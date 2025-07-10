// src/utils/cameraUtils.ts
export const getCameraStream = () =>
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
  })

export const authenticate = (photo: string) =>
  new Promise((resolve) => setTimeout(() => resolve(Math.random() > 0.3), 3000))

export const submitAccount = () => new Promise((resolve) => setTimeout(resolve, 2000))

export const REQUIRED_ANGLES = [
  { name: "Front", instruction: "Look straight at the camera", icon: "👤" },
  { name: "Left Profile", instruction: "Turn your head to the left", icon: "👈" },
  { name: "Right Profile", instruction: "Turn your head to the right", icon: "👉" },
  { name: "Slight Up", instruction: "Tilt your head slightly up", icon: "👆" },
  { name: "Slight Down", instruction: "Tilt your head slightly down", icon: "👇" },
]
