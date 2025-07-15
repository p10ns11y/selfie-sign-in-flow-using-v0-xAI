import {
  DetectFacesCommand,
  RekognitionClient,
} from '@aws-sdk/client-rekognition'
import { assign, createMachine, fromPromise } from 'xstate'
import { getCameraStream, REQUIRED_ANGLES } from '../camera-utils'

// const { inspect } = createBrowserInspector();

// inspect({
//   iframe: false, // Opens in new tab for better QoL (less clutter)
//   // url: "https://stately.ai/viz?inspect", // Default visualizer
// });

const rekognitionClient = new RekognitionClient({ region: 'eu-west-1' })

// Helper function to check credentials
async function checkCredentials() {
  const c = await rekognitionClient.config.credentials()
  console.log(c?.accessKeyId)
}

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
          // debugger;
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

// async function validatePhotoClient({ input }: { input: { photo: string } }) {
// 	// checkCredentials();

// 	const photo = input.photo;
// 	const buffer = Buffer.from(photo.split(",")[1], "base64");
// 	const params = {
// 		Image: { Bytes: new Uint8Array(buffer) },
// 		Attributes: ["ALL"],
// 	};
// 	const command = new DetectFacesCommand(params);
// 	const response = await rekognitionClient.send(command); // v3 send pattern
// 	if (response.FaceDetails?.length !== 1) {
// 		throw new Error("Invalid photo: Must detect exactly one face.");
// 	}
// 	// Optional: Check quality, e.g., if (response.FaceDetails[0].Quality.Brightness < 50) throw...
// 	return response;
// }

// In create-account.ts validatePhoto actor (now async fetch)
async function validatePhoto({ input }: { input: { photo: string } }) {
  const photo = input.photo

  const response = await fetch('/api/rekognition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'validate', photo }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Validation failed')
  return {
    input,
    data,
  }
}

async function submitAccount({ input }: { input: { photo: string } }) {
  const { photos, formData } = input.context
  // const userId = formData.email;
  // console.log(photos);

  const response = await fetch('/api/rekognition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'index', photos }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Validation failed')
  return {
    input,
    data,
  }
}
