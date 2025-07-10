import { createMachine, assign } from "xstate"
import { getCameraStream, authenticate } from "../camera-utils"

export const signInMachine = createMachine(
  {
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
              src: "getCameraStream",
              onDone: {
                target: "active",
                actions: assign({
                  stream: ({ event }) => event.output,
                  isCameraLoading: false,
                }),
              },
              onError: {
                target: "#signIn.ready",
                actions: assign({
                  error: ({ event }) => event.error,
                  isCameraLoading: false,
                }),
              },
            },
          },
          active: {
            on: {
              PHOTO_CAPTURED: {
                target: "#signIn.processing",
                actions: assign({
                  capturedPhoto: ({ event }) => event.photo,
                }),
              },
              CANCEL: "#signIn.ready",
            },
          },
        },
        exit: "stopStream",
      },
      processing: {
        invoke: {
          src: "authenticate",
          input: ({ context }) => context.capturedPhoto,
          onDone: [
            {
              target: "success",
              guard: ({ event }) => event.output,
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
  },
  {
    actors: {
      getCameraStream: getCameraStream,
      authenticate: ({ input }) => authenticate(input),
    },
    actions: {
      stopStream: ({ context }) => {
        if (context.stream) {
          context.stream.getTracks().forEach((track) => track.stop())
        }
      },
    },
  },
)
