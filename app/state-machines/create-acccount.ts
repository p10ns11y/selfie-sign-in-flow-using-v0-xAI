import { createMachine, assign } from "xstate"

export const createAccountMachine = createMachine({
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
          cond: "isFormValid",
        },
      },
    },
    capture: {
      initial: "starting",
      states: {
        starting: {
          invoke: {
            src: getCameraStream,
            onDone: {
              target: "active",
              actions: assign({ stream: (_, event) => event.data }),
            },
            onError: {
              target: "#createAccount.info",
              actions: assign({ error: (_, event) => event.data }),
            },
          },
        },
        active: {
          on: {
            PHOTO_CAPTURED: {
              actions: "addPhoto",
              target: "#createAccount.complete",
              cond: "isLastPhoto",
            },
            RETAKE: {
              actions: "removeLastPhoto",
              cond: "hasPhotos",
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
        src: submitAccount,
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
}, {
  actions: {
    updateForm: assign({
      formData: (ctx, event) => ({ ...ctx.formData, [event.field]: event.value }),
    }),
    addPhoto: assign({
      photos: (ctx, event) => [...ctx.photos, event.photo],
      currentIndex: (ctx) => ctx.currentIndex + 1,
    }),
    removeLastPhoto: assign({
      photos: (ctx) => ctx.photos.slice(0, -1),
      currentIndex: (ctx) => ctx.currentIndex - 1,
    }),
    stopStream: (context) => {
      if (context.stream) {
        context.stream.getTracks().forEach((track) => track.stop())
      }
    },
  },
  guards: {
    isFormValid: (ctx) => !!ctx.formData.name && !!ctx.formData.email,
    isLastPhoto: (ctx) => ctx.currentIndex + 1 === REQUIRED_ANGLES.length,
    hasPhotos: (ctx) => ctx.photos.length > 0,
  },
})
