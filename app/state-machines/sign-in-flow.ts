import { assign, createMachine, fromPromise } from 'xstate'
import { getCameraStream } from '../camera-utils'

export const signInMachine = createMachine(
  {
    id: 'signIn',
    initial: 'ready',
    context: {
      stream: null,
      capturedPhoto: null,
      isCameraLoading: false,
      error: null,
    },
    states: {
      ready: {
        on: {
          START_CAMERA: 'capture',
        },
      },
      capture: {
        initial: 'starting',
        states: {
          starting: {
            entry: assign({ isCameraLoading: true }),
            invoke: {
              src: 'getCameraStream',
              onDone: {
                target: 'active',
                actions: assign({
                  stream: ({ event }) => event.output,
                  isCameraLoading: false,
                }),
              },
              onError: {
                target: '#signIn.ready',
                actions: assign({
                  error: ({ event }) => event.error,
                  isCameraLoading: false,
                }),
              },
            },
          },
          active: {
            on: {
              PHOTO_CAPTURED: 'validating',
              CANCEL: '#signIn.ready',
            },
          },
          validating: {
            invoke: {
              src: 'validateAndAuthenticate', // Combined for simplicity (detect + search via API)
              input: ({ context, event }) => ({ context, photo: event.photo }),
              onDone: {
                target: '#signIn.success',
              },
              onError: {
                target: '#signIn.failed',
                actions: assign({ error: ({ event }) => event.error }),
              },
            },
          },
        },
        exit: 'stopStream',
      },
      processing: { // Optional if needed; but combined in validating for agility

      },
      success: {
        entry: 'handleSuccess',
      },
      failed: {
        on: {
          RETRY: 'ready',
          BACK: { actions: 'handleBack' },
        },
      },
    },
  },
  {
    actors: {
      getCameraStream: fromPromise(getCameraStream),
      validateAndAuthenticate: fromPromise(validateAndAuthenticate),
    },
    actions: {
      stopStream: ({ context }) => {
        if (context.stream) {
          context.stream.getTracks().forEach(track => track.stop())
        }
      },
    },
  },
)

async function validateAndAuthenticate({ input }) {
  debugger;
  const response = await fetch('/api/rekognition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'authenticate', photo: input.photo }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Authentication failed');
  }

  return data;
}