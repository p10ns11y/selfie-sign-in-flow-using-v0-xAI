import { assign, createMachine, fromPromise } from 'xstate'
import { getCameraStream, REQUIRED_ANGLES } from '../camera-utils'

export const createAccountMachine = createMachine(
  {
    context: {
      currentIndex: 0,
      error: null as string | null,
      formData: { email: '', name: '' },
      isCapturing: false,
      photos: [] as string[],
      stream: null as MediaStream | null,
    },
    id: 'createAccount',
    initial: 'info',
    states: {
      capture: {
        exit: 'stopStream',
        initial: 'starting',
        states: {
          active: {
            on: {
              PHOTO_CAPTURED: 'validating',
              RETAKE: {
                actions: 'removeLastPhoto',
                guard: 'hasPhotos',
              },
            },
          },
          starting: {
            invoke: {
              onDone: {
                actions: assign({ stream: ({ event }) => event.output }),
                target: 'active',
              },
              onError: {
                actions: assign({
                  error: ({ event }) => event.error as string,
                }),
                target: 'active',
              },
              src: 'getCameraStream',
            },
          },
          validating: {
            invoke: {
              input: ({ event }) => ({ photo: event.photo }),
              onDone: [
                {
                  actions: 'addPhoto',
                  guard: 'isLastPhoto',
                  target: '#createAccount.complete',
                },
                {
                  actions: 'addPhoto',
                  target: 'active',
                },
              ],
              onError: {
                actions: assign({
                  error: ({ event }) => event.error as string,
                }),
                target: 'active',
              },
              src: 'validatePhoto',
            },
          },
        },
      },
      complete: {
        on: {
          SUBMIT: 'submitting',
        },
      },
      done: {
        entry: 'handleComplete',
      },
      info: {
        on: {
          START_CAPTURE: {
            guard: 'isFormValid',
            target: 'capture',
          },
          UPDATE_FORM: {
            actions: 'updateForm',
          },
        },
      },
      submitting: {
        entry: assign({ isCapturing: true }),
        invoke: {
          input: ({ context }) => ({ context }),
          onDone: {
            actions: assign({ error: null, isCapturing: false }),
            target: 'done',
          },
          onError: {
            actions: assign({
              error: ({ event }) => event.error as string,
              isCapturing: false,
            }),
            target: 'complete',
          },
          src: 'submitAccount',
        },
      },
    },
  },
  {
    actions: {
      addPhoto: assign({
        currentIndex: ({ context }) => context.currentIndex + 1,
        error: null,
        photos: ({ context, event }) => {
          return [...context.photos, event?.output?.input?.photo]
        },
      }),
      removeLastPhoto: assign({
        currentIndex: ({ context }) => context.currentIndex - 1,
        error: null,
        photos: ({ context }) => context.photos.slice(0, -1),
      }),
      stopStream: ({ context }) => {
        if (context.stream) {
          context.stream.getTracks().forEach(track => track.stop())
        }
      },
      updateForm: assign({
        formData: ({ context, event }) => ({
          ...context.formData,
          [event.field]: event.value,
        }),
      }),
    },
    actors: {
      getCameraStream: fromPromise(getCameraStream),
      submitAccount: fromPromise(submitAccount),
      validatePhoto: fromPromise(validatePhoto),
    },
    guards: {
      hasPhotos: ({ context }) => context.photos.length > 0,
      isFormValid: ({ context }) =>
        !!context.formData.name && !!context.formData.email,
      isLastPhoto: ({ context }) =>
        context.currentIndex + 1 === REQUIRED_ANGLES.length,
    },
  },
)

// Actors utils
async function validatePhoto({ input }: { input: { photo: string } }) {
  const photo = input.photo

  const response = await fetch('/api/rekognition', {
    body: JSON.stringify({ action: 'validate', photo }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Validation failed')
  }

  return {
    data,
    input,
  }
}

async function submitAccount({ input }: { input: { photo: string } }) {
  const { photos } = input.context

  const response = await fetch('/api/rekognition', {
    body: JSON.stringify({ action: 'index', photos }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Validation failed')
  }

  return {
    data,
    input,
  }
}
