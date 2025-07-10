import { createMachine, assign } from "xstate"
import { getCameraStream, submitAccount, REQUIRED_ANGLES } from "../camera-utils"

export const createAccountMachine = createMachine(
  {
    id: "createAccount",
    initial: "info",
    context: {
      formData: { name: "", email: "" },
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
            actions: "updateForm",
          },
          START_CAPTURE: {
            target: "capture",
            guard: "isFormValid",
          },
        },
      },
      capture: {
        initial: "starting",
        states: {
          starting: {
            invoke: {
              src: "getCameraStream",
              onDone: {
                target: "active",
                actions: assign({ stream: ({ event }) => event.output }),
              },
              onError: {
                target: "#createAccount.info",
                actions: assign({ error: ({ event }) => event.error }),
              },
            },
          },
          active: {
            on: {
              PHOTO_CAPTURED: [
                {
                  target: "#createAccount.complete",
                  actions: "addPhoto",
                  guard: "isLastPhoto",
                },
                {
                  actions: "addPhoto",
                },
              ],
              RETAKE: {
                actions: "removeLastPhoto",
                guard: "hasPhotos",
              },
            },
          },
        },
        exit: "stopStream",
      },
      complete: {
        on: {
          SUBMIT: "submitting",
        },
      },
      submitting: {
        entry: assign({ isCapturing: true }),
        invoke: {
          src: "submitAccount",
          onDone: {
            target: "done",
            actions: assign({ isCapturing: false }),
          },
          onError: {
            target: "complete",
            actions: assign({ isCapturing: false }),
          },
        },
      },
      done: {
        entry: "handleComplete",
      },
    },
  },
  {
    actors: {
      getCameraStream: getCameraStream,
      submitAccount: submitAccount,
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
