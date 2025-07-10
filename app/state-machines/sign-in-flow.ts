import { createMachine, assign } from "xstate"
import { authenticate } from "../camera-utils"

export const signInMachine = createMachine({
  id: "signIn",
  initial: "ready",
  context: {
    stream: null,
    capturedPhoto: null,
    isCameraLoading: false,
    error: null,
  },
  states: {
    ready: {
      on: {
        START_CAMERA: "capture",
      },
    },
    capture: {
      initial: "starting",
      states: {
        starting: {
          entry: assign({ isCameraLoading: true }),
          invoke: {
            src: getCameraStream,
            onDone: {
              target: "active",
              actions: assign({
                stream: (_, event) => event.data,
                isCameraLoading: false,
              }),
            },
            onError: {
              target: "#signIn.ready",
              actions: assign({
                error: (_, event) => event.data,
                isCameraLoading: false,
              }),
            },
          },
        },
        active: {
          on: {
            PHOTO_CAPTURED: "#signIn.processing",
            CANCEL: "#signIn.ready",
          },
        },
      },
      exit: "stopStream",
    },
    processing: {
      invoke: {
        src: (ctx) => authenticate(ctx.capturedPhoto),
        onDone: [
          {
            target: "success",
            cond: (_, event) => event.data,
          },
          { target: "failed" },
        ],
        onError: "failed",
      },
    },
    success: {
      entry: "handleSuccess",
    },
    failed: {
      on: {
        RETRY: "ready",
        BACK: { actions: "handleBack" },
      },
    },
  },
})
