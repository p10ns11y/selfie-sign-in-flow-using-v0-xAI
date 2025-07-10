"use client"

import { useMachine } from "@xstate/react"
import { useRef, useEffect } from "react"
import { createAccountMachine } from "../state-machines/create-acccount"
import { REQUIRED_ANGLES } from "../camera-utils"
import { InfoView } from "../views/create-account-info"
import { CreateCaptureView } from "../views/capture-training-pictures"
import { CompleteView } from "../views/training-complete"

interface CreateAccountPageProps {
  onBack: () => void
}

export default function CreateAccountPage({ onBack }: CreateAccountPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Custom actions that close over props
  const customActions = {
    handleComplete: () => {
      alert("Account created successfully! Your facial model has been trained.")
      onBack()
    },
  }

  const [state, send] = useMachine(
    createAccountMachine.provide({
      actions: customActions,
    }),
  )

  // Effect to set stream to video element when available
  useEffect(() => {
    if (state.context.stream && videoRef.current) {
      videoRef.current.srcObject = state.context.stream
      videoRef.current.play().catch((error) => console.error("Error playing video:", error))
    }
  }, [state.context.stream])

  // Effect to handle camera error
  useEffect(() => {
    if (state.context.error) {
      alert("Unable to access camera. Please ensure you've granted camera permissions.")
    }
  }, [state.context.error])

  // Function to handle photo capture using refs
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
    send({ type: "PHOTO_CAPTURED", photo: photoDataUrl })
  }

  const handleRetake = () => send({ type: "RETAKE" })

  if (state.matches("info")) {
    return (
      <InfoView
        onNameChange={(e) => send({ type: "UPDATE_FORM", field: "name", value: e.target.value })}
        onEmailChange={(e) => send({ type: "UPDATE_FORM", field: "email", value: e.target.value })}
        onStart={() => send({ type: "START_CAPTURE" })}
        name={state.context.formData.name}
        email={state.context.formData.email}
        onBack={onBack}
      />
    )
  }

  if (state.matches("capture")) {
    const currentAngle = REQUIRED_ANGLES[state.context.currentIndex]
    const progress = (state.context.photos.length / REQUIRED_ANGLES.length) * 100
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
      />
    )
  }

  if (state.matches("complete") || state.matches("submitting")) {
    return <CompleteView onSubmit={() => send({ type: "SUBMIT" })} isCapturing={state.context.isCapturing} />
  }

  if (state.matches("done")) {
    // Redirect handled in action, return null or loading
    return null
  }

  return null
}
