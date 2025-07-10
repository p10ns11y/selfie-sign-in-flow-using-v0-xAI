"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Camera, ArrowLeft, Check, RotateCcw } from "lucide-react"

interface CreateAccountPageProps {
  onBack: () => void
}

const REQUIRED_ANGLES = [
  { name: "Front", instruction: "Look straight at the camera", icon: "👤" },
  { name: "Left Profile", instruction: "Turn your head to the left", icon: "👈" },
  { name: "Right Profile", instruction: "Turn your head to the right", icon: "👉" },
  { name: "Slight Up", instruction: "Tilt your head slightly up", icon: "👆" },
  { name: "Slight Down", instruction: "Tilt your head slightly down", icon: "👇" },
]

export default function CreateAccountPage({ onBack }: CreateAccountPageProps) {
  const [step, setStep] = useState<"info" | "capture" | "complete">("info")
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "" })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedPhotos((prev) => [...prev, photoDataUrl])

    if (currentAngleIndex < REQUIRED_ANGLES.length - 1) {
      setCurrentAngleIndex((prev) => prev + 1)
    } else {
      stopCamera()
      setStep("complete")
    }
  }, [currentAngleIndex, stopCamera])

  const handleStartCapture = () => {
    setStep("capture")
    startCamera()
  }

  const handleRetakePhoto = () => {
    setCapturedPhotos((prev) => prev.slice(0, -1))
    if (currentAngleIndex > 0) {
      setCurrentAngleIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsCapturing(true)
    // Simulate API call to process photos and create account
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsCapturing(false)
    alert("Account created successfully! Your facial model has been trained.")
    onBack()
  }

  if (step === "info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Enter your details to get started</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Next: Facial Recognition Setup</h3>
              <p className="text-sm text-muted-foreground">
                We'll capture 5 photos from different angles to train your facial recognition model.
              </p>
            </div>
            <Button onClick={handleStartCapture} className="w-full" disabled={!formData.name || !formData.email}>
              Continue to Photo Capture
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "capture") {
    const currentAngle = REQUIRED_ANGLES[currentAngleIndex]
    const progress = (capturedPhotos.length / REQUIRED_ANGLES.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Photo Capture</CardTitle>
                <CardDescription>
                  {capturedPhotos.length} of {REQUIRED_ANGLES.length} photos captured
                </CardDescription>
              </div>
              <Badge variant="secondary">{currentAngle.name}</Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">{currentAngle.icon}</div>
              <p className="font-medium">{currentAngle.instruction}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Position yourself clearly in the frame and click capture
              </p>
            </div>

            <div className="flex gap-2">
              {capturedPhotos.length > 0 && (
                <Button variant="outline" onClick={handleRetakePhoto} className="flex-1 bg-transparent">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              )}
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {REQUIRED_ANGLES.map((angle, index) => (
                <div
                  key={angle.name}
                  className={`aspect-square rounded border-2 flex items-center justify-center text-xs ${
                    index < capturedPhotos.length
                      ? "border-green-500 bg-green-50"
                      : index === currentAngleIndex
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {index < capturedPhotos.length ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <span>{angle.icon}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Training Complete!</CardTitle>
          <CardDescription>Your facial recognition model has been successfully trained</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your photos are processed securely</li>
              <li>• Facial features are extracted and encrypted</li>
              <li>• You can now sign in with just a selfie</li>
            </ul>
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={isCapturing}>
            {isCapturing ? "Creating Account..." : "Complete Setup"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
