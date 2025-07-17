'use client'


import { createBrowserInspector } from '@statelyai/inspect'
import { useMachine } from '@xstate/react'
import { useEffect, useRef } from 'react'
import { REQUIRED_ANGLES } from '../camera-utils'
import { createAccountMachine } from '../state-machines/create-account'
import { CreateCaptureView } from '../views/capture-training-pictures'
import { InfoView } from '../views/create-account-info'
import { CompleteView } from '../views/training-complete'

// TODO: Need to turn off in production mode
const { inspect } = createBrowserInspector()

interface CreateAccountPageProps {
  onBack: () => void
}

export default function CreateAccountPage({ onBack }: CreateAccountPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Custom actions
  const customActions = {
    handleComplete: () => {
      alert('Account created successfully! Your facial model has been trained.')
      onBack()
    },
  }

  const [state, send] = useMachine(
    createAccountMachine.provide({
      actions: customActions,
    }),
    { inspect: process.env.NODE_ENV === 'development' ? inspect: undefined }
  )

  // Set stream to video
  useEffect(() => {
    if (state.context.stream && videoRef.current) {
      videoRef.current.srcObject = state.context.stream
      videoRef.current
        .play()
        .catch(error => console.error('Error playing video:', error))
    }
  }, [state.context.stream])

  useEffect(() => {
    if (state.context.error) {
      alert(
        `Error: ${state.context.error?.message || state.context.error}. Please try again.`,
      )
    }
  }, [state.context.error])

  // Capture photo using refs
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    send({ type: 'PHOTO_CAPTURED', photo: photoDataUrl })
  }

  const handleRetake = () => send({ type: 'RETAKE' })

  if (state.matches('info')) {
    return (
      <InfoView
        onNameChange={e =>
          send({ type: 'UPDATE_FORM', field: 'name', value: e.target.value })
        }
        onEmailChange={e =>
          send({ type: 'UPDATE_FORM', field: 'email', value: e.target.value })
        }
        onStart={() => send({ type: 'START_CAPTURE' })}
        name={state.context.formData.name}
        email={state.context.formData.email}
        onBack={onBack}
      />
    )
  }

  if (state.matches('capture')) {
    const currentAngle = REQUIRED_ANGLES[state.context.currentIndex]
    const progress =
      (state.context.photos.length / REQUIRED_ANGLES.length) * 100
    return (
      <CreateCaptureView
        videoRef={videoRef}
        canvasRef={canvasRef}
        onCapture={handleCapture}
        onRetake={handleRetake}
        currentAngle={currentAngle}
        progress={progress}
        capturedPhotos={state.context.photos}
        currentIndex={state.context.currentIndex}
        isValidating={state.matches('capture.validating')}
        validationError={state.context.error} // Clears on success
      />
    )
  }

  if (state.matches('complete') || state.matches('submitting')) {
    return (
      <CompleteView
        onSubmit={() => send({ type: 'SUBMIT' })}
        isCapturing={state.context.isCapturing}
      />
    )
  }

  if (state.matches('done')) {
    return null // Redirect handled in action
  }

  return null
}
