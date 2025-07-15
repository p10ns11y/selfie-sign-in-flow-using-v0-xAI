export const getCameraStream = () =>
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
  })


export const REQUIRED_ANGLES = [
  { name: 'Front', instruction: 'Look straight at the camera', icon: '👤' },
  {
    name: 'Left Profile',
    instruction: 'Turn your head to the left',
    icon: '👈',
  },
  {
    name: 'Right Profile',
    instruction: 'Turn your head to the right',
    icon: '👉',
  },
  { name: 'Slight Up', instruction: 'Tilt your head slightly up', icon: '👆' },
  {
    name: 'Slight Down',
    instruction: 'Tilt your head slightly down',
    icon: '👇',
  },
]

