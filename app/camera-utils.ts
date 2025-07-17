export const getCameraStream = () =>
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      height: { ideal: 480 },
      width: { ideal: 640 },
    },
  })

export const REQUIRED_ANGLES = [
  { icon: '👤', instruction: 'Look straight at the camera', name: 'Front' },
  {
    icon: '👈',
    instruction: 'Turn your head to the left',
    name: 'Left Profile',
  },
  {
    icon: '👉',
    instruction: 'Turn your head to the right',
    name: 'Right Profile',
  },
  { icon: '👆', instruction: 'Tilt your head slightly up', name: 'Slight Up' },
  {
    icon: '👇',
    instruction: 'Tilt your head slightly down',
    name: 'Slight Down',
  },
]
