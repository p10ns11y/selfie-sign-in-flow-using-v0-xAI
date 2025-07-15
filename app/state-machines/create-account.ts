import { assign, createMachine, fromPromise } from 'xstate'
import { getCameraStream, REQUIRED_ANGLES } from '../camera-utils'

export const createAccountMachine = createMachine(
  {
    id: 'createAccount',
    initial: 'info',
    context: {
      formData: { name: '', email: '' },
      stream: null as MediaStream | null,
      photos: [] as string[],
      currentIndex: 0,
      isCapturing: false,
      error: null as string | null,
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
                target: 'active',
                actions: assign({
                  error: ({ event }) => event.error as string,
                }),
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
              input: ({ event }) => ({ photo: event.photo }),
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
                actions: assign({
                  error: ({ event }) => event.error as string,
                }),
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
          input: ({ context }) => ({ context }),
          onDone: {
            target: 'done',
            actions: assign({ isCapturing: false }),
          },
          onError: {
            target: 'complete',
            actions: assign({
              isCapturing: false,
              error: ({ event }) => event.error as string,
            }),
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
      getCameraStream: fromPromise(getCameraStream),
      submitAccount: fromPromise(submitAccount),
      validatePhoto: fromPromise(validatePhoto),
    },
    actions: {
      updateForm: assign({
        formData: ({ context, event }) => ({
          ...context.formData,
          [event.field]: event.value,
        }),
      }),
      addPhoto: assign({
        photos: ({ context, event }) => {
          return [...context.photos, event?.output?.input?.photo]
        },
        currentIndex: ({ context }) => context.currentIndex + 1,
      }),
      removeLastPhoto: assign({
        photos: ({ context }) => context.photos.slice(0, -1),
        currentIndex: ({ context }) => context.currentIndex - 1,
      }),
      stopStream: ({ context }) => {
        if (context.stream) {
          context.stream.getTracks().forEach(track => track.stop())
        }
      },
    },
    guards: {
      isFormValid: ({ context }) =>
        !!context.formData.name && !!context.formData.email,
      isLastPhoto: ({ context }) =>
        context.currentIndex + 1 === REQUIRED_ANGLES.length,
      hasPhotos: ({ context }) => context.photos.length > 0,
    },
  },
)

// Actors utils
async function validatePhoto({ input }: { input: { photo: string } }) {
  const photo = input.photo

  const response = await fetch('/api/rekognition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'validate', photo }),
  })
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Validation failed')
  }
  
  return {
    input,
    data,
  };
}

async function submitAccount({ input }: { input: { photo: string } }) {
  const { photos } = input.context

  const response = await fetch('/api/rekognition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'index', photos }),
  })
  const data = await response.json()

  if (!response.ok) { 
    throw new Error(data.error || 'Validation failed') 
  }

  return {
    input,
    data,
  };
}
