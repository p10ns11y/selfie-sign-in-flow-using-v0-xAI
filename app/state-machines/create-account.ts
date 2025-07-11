import { createMachine, assign } from 'xstate'
import { RekognitionClient, DetectFacesCommand } from '@aws-sdk/client-rekognition'
import { getCameraStream, submitAccount, REQUIRED_ANGLES } from '../camera-utils'

const rekognitionClient = new RekognitionClient({ region: 'eu-west-1' });

export const createAccountMachine = createMachine(
  {
    id: 'createAccount',
    initial: 'info',
    context: {
      formData: { name: '', email: '' },
      stream: null,
      photos: [],
      currentIndex: 0,
      isCapturing: false,
      error: null,
    },
    states: {
      info: {
        on: {
          UPDATE_FORM: {
            actions: 'updateForm',
          },
          START_CAPTURE: {
            target: 'capture',
            guard: 'isFormValid',
          },
        },
      },
      capture: {
        initial: 'starting',
        states: {
          starting: {
            invoke: {
              src: 'getCameraStream',
              onDone: {
                target: 'active',
                actions: assign({ stream: ({ event }) => event.output }),
              },
              onError: {
                target: '#createAccount.info',
                actions: assign({ error: ({ event }) => event.error }),
              },
            },
          },
          active: {
            on: {
              PHOTO_CAPTURED: 'validating',
              RETAKE: {
                actions: 'removeLastPhoto',
                guard: 'hasPhotos',
              },
            },
          },
          validating: {
            invoke: {
              src: 'validatePhoto',
              onDone: [
                {
                  target: '#createAccount.complete',
                  actions: 'addPhoto',
                  guard: 'isLastPhoto',
                },
                {
                  target: 'active',
                  actions: 'addPhoto',
                },
              ],
              onError: {
                target: 'active',
                actions: assign({ error: ({ event }) => event.error }),
              },
            },
          },
        },
        exit: 'stopStream',
      },
      complete: {
        on: {
          SUBMIT: 'submitting',
        },
      },
      submitting: {
        entry: assign({ isCapturing: true }),
        invoke: {
          src: 'submitAccount',
          onDone: {
            target: 'done',
            actions: assign({ isCapturing: false }),
          },
          onError: {
            target: 'complete',
            actions: assign({ isCapturing: false, error: ({ event }) => event.error }),
          },
        },
      },
      done: {
        entry: 'handleComplete',
      },
    },
  },
  {
    actors: {
      getCameraStream: getCameraStream,
      submitAccount,
      validatePhoto: async ({ context, event }) => {
        const photo = event.photo
        const buffer = Buffer.from(photo.split(',')[1], 'base64')
        const params = {
          Image: { Bytes: buffer },
          Attributes: ['ALL'],
        }
        const command = new DetectFacesCommand(params)
        const response = await rekognitionClient.send(command) // v3 send pattern
        if (response.FaceDetails?.length !== 1) {
          throw new Error('Invalid photo: Must detect exactly one face.')
        }
        // Optional: Check quality, e.g., if (response.FaceDetails[0].Quality.Brightness < 50) throw...
        return response
      },
    },
    actions: {
      updateForm: assign({
        formData: ({ context, event }) => ({ ...context.formData, [event.field]: event.value }),
      }),
      addPhoto: assign({
        photos: ({ context, event }) => [...context.photos, event.photo],
        currentIndex: ({ context }) => context.currentIndex + 1,
      }),
      removeLastPhoto: assign({
        photos: ({ context }) => context.photos.slice(0, -1),
        currentIndex: ({ context }) => context.currentIndex - 1,
      }),
      stopStream: ({ context }) => {
        if (context.stream) {
          context.stream.getTracks().forEach((track) => track.stop())
        }
      },
    },
    guards: {
      isFormValid: ({ context }) => !!context.formData.name && !!context.formData.email,
      isLastPhoto: ({ context }) => context.currentIndex + 1 === REQUIRED_ANGLES.length,
      hasPhotos: ({ context }) => context.photos.length > 0,
    },
  },
)