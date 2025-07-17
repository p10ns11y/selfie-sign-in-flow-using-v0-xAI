import { assign, createMachine, fromPromise } from 'xstate'
import { getCameraStream } from '../camera-utils'

export const signInMachine = createMachine(
  {
    context: {
      capturedPhoto: null,
      error: null,
      isCameraLoading: false,
      stream: null,
    },
    id: 'signIn',
    initial: 'ready',
    states: {
      capture: {
        exit: 'stopStream',
        initial: 'starting',
        states: {
          active: {
            on: {
              CANCEL: '#signIn.ready',
              PHOTO_CAPTURED: 'validating',
            },
          },
          starting: {
            entry: assign({ isCameraLoading: true }),
            invoke: {
              onDone: {
                actions: assign({
                  error: null,
                  isCameraLoading: false,
                  stream: ({ event }) => event.output,
                }),
                target: 'active',
              },
              onError: {
                actions: assign({
                  error: ({ event }) => event.error,
                  isCameraLoading: false,
                }),
                target: '#signIn.ready',
              },
              src: 'getCameraStream',
            },
          },
          validating: {
            invoke: {
              input: ({ context, event }) => ({ context, photo: event.photo }),
              onDone: {
                target: '#signIn.success',
              },
              onError: {
                actions: assign({ error: ({ event }) => event.error }),
                target: '#signIn.failed',
              },
              src: 'validateAndAuthenticate',
            },
          },
        },
      },
      failed: {
        on: {
          BACK: { actions: 'handleBack' },
          RETRY: 'ready',
        },
      },
      ready: {
        on: {
          START_CAMERA: 'capture',
        },
      },
      success: {
        entry: 'handleSuccess',
      },
    },
  },
  {
    actions: {
      stopStream: ({ context }) => {
        if (context.stream) {
          context.stream.getTracks().forEach(track => track.stop())
        }
      },
    },
    actors: {
      getCameraStream: fromPromise(getCameraStream),
      validateAndAuthenticate: fromPromise(validateAndAuthenticate),
    },
  },
)

async function validateAndAuthenticate({ input }) {
  const response = await fetch('/api/rekognition', {
    body: JSON.stringify({ action: 'authenticate', photo: input.photo }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Authentication failed')
  }

  return data
}
