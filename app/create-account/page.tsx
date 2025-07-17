'use client'

import { createBrowserInspector } from '@statelyai/inspect'
import { useMachine } from '@xstate/react'
import { useEffect, useRef } from 'react'
import { REQUIRED_ANGLES } from '../camera-utils'
import { createAccountMachine } from '../state-machines/create-account'
import { CreateCaptureView } from '../views/capture-training-pictures'
import { InfoView } from '../views/create-account-info'
import { CompleteView } from '../views/training-complete'

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
    { inspect: process.env.NODE_ENV === 'development' ? inspect : undefined },
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
    send({ photo: photoDataUrl, type: 'PHOTO_CAPTURED' })
  }

  const handleRetake = () => send({ type: 'RETAKE' })

  if (state.matches('info')) {
    return (
      <InfoView
        email={state.context.formData.email}
        name={state.context.formData.name}
        onBack={onBack}
        onEmailChange={e =>
          send({ field: 'email', type: 'UPDATE_FORM', value: e.target.value })
        }
        onNameChange={e =>
          send({ field: 'name', type: 'UPDATE_FORM', value: e.target.value })
        }
        onStart={() => send({ type: 'START_CAPTURE' })}
      />
    )
  }

  if (state.matches('capture')) {
    const currentAngle = REQUIRED_ANGLES[state.context.currentIndex]
    const progress =
      (state.context.photos.length / REQUIRED_ANGLES.length) * 100
    return (
      <CreateCaptureView
        canvasRef={canvasRef}
        capturedPhotos={state.context.photos}
        currentAngle={currentAngle}
        currentIndex={state.context.currentIndex}
        isValidating={state.matches('capture.validating')}
        onCapture={handleCapture}
        onRetake={handleRetake}
        progress={progress}
        validationError={state.context.error}
        videoRef={videoRef} // Clears on success
      />
    )
  }

  if (state.matches('complete') || state.matches('submitting')) {
    return (
      <CompleteView
        isCapturing={state.context.isCapturing}
        onSubmit={() => send({ type: 'SUBMIT' })}
      />
    )
  }

  if (state.matches('done')) {
    return null // Redirect handled in action
  }

  return null
}
