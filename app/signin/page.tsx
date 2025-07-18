'use client'

import { createBrowserInspector } from '@statelyai/inspect'
import { useMachine } from '@xstate/react'
import { useEffect, useRef } from 'react'
import { signInMachine } from '../state-machines/sign-in-flow'
import { AuthFailedView } from '../views/authentication-failed'
import { AuthProcessingView } from '../views/authentication-process'
import { AuthSuccessView } from '../views/authentication-success'
import { CaptureView } from '../views/camera-capture'
import { CameraReadyView } from '../views/camera-ready'

const { inspect } = createBrowserInspector()

interface SignInPageProps {
  onBack: () => void
}

export default function SignInPage({ onBack }: SignInPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Custom actions
  const customActions = {
    handleBack: onBack,
    handleSuccess: () => {
      setTimeout(() => {
        alert('Welcome back! You have been successfully authenticated.')
        onBack()
      }, 2000)
    },
    stopStream: ({ context }) => {
      if (context.stream) {
        context.stream.getTracks().forEach(track => track.stop())
      }
    },
  }

  const [state, send] = useMachine(
    signInMachine.provide({
      actions: customActions,
    }),
    { inspect: process.env.NODE_ENV === 'development' ? inspect : undefined },
  )

  // Set stream
  useEffect(() => {
    if (state.context.stream && videoRef.current) {
      videoRef.current.srcObject = state.context.stream
      videoRef.current
        .play()
        .catch(error => console.error('Error playing video:', error))
    }
  }, [state.context.stream])

  // Handle errors
  useEffect(() => {
    if (state.context.error) {
      alert(
        `Error: ${state.context.error.message || state.context.error}. Please try again.`,
      )
    }
  }, [state.context.error])

  // Capture photo
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

  if (state.matches('ready')) {
    return (
      <CameraReadyView
        isLoading={state.context.isCameraLoading}
        onBack={onBack}
        onStart={() => send({ type: 'START_CAMERA' })}
      />
    )
  }

  if (state.matches('capture')) {
    return (
      <CaptureView
        canvasRef={canvasRef}
        isLoading={
          state.context.isCameraLoading || state.matches('capture.validating')
        }
        onCancel={() => send({ type: 'CANCEL' })}
        onCapture={handleCapture}
        videoRef={videoRef} // Add for validation spinner if view supports
      />
    )
  }

  if (state.matches('processing')) {
    return <AuthProcessingView />
  }

  if (state.matches('success')) {
    return <AuthSuccessView />
  }

  if (state.matches('failed')) {
    return (
      <AuthFailedView
        onBack={() => send({ type: 'BACK' })}
        onRetry={() => send({ type: 'RETRY' })}
      />
    )
  }

  return null
}
