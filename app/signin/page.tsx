'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, ArrowLeft, Loader2, Shield, User } from 'lucide-react'

interface SignInPageProps {
  onBack: () => void
}

export default function SignInPage({ onBack }: SignInPageProps) {
  const [step, setStep] = useState<
    'ready' | 'capture' | 'processing' | 'success' | 'failed'
  >('ready')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isCameraLoading, setIsCameraLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    setIsCameraLoading(true)
    setStep('capture')
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        console.log(mediaStream)
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert(
        "Unable to access camera. Please ensure you've granted camera permissions.",
      )
      setStep('ready')
    } finally {
      setIsCameraLoading(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedPhoto(photoDataUrl)
    stopCamera()
    authenticateUser(photoDataUrl)
  }, [stopCamera])

  const authenticateUser = async (photoData: string) => {
    setStep('processing')

    // Simulate authentication API call
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Simulate random success/failure for demo
    const isAuthenticated = Math.random() > 0.3

    if (isAuthenticated) {
      setStep('success')
      setTimeout(() => {
        alert('Welcome back! You have been successfully authenticated.')
        onBack()
      }, 2000)
    } else {
      setStep('failed')
    }
  }

  const handleRetry = () => {
    setCapturedPhoto(null)
    setStep('ready')
  }

  if (step === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Sign Inn</CardTitle>
                <CardDescription>
                  Use your face to sign in securely
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Ready to sign in?</h3>
              <p className="text-sm text-muted-foreground">
                Position your face clearly in front of the camera and we'll
                authenticate you instantly.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Secure & Private</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Your photo is processed locally</li>
                <li>• No images are stored permanently</li>
                <li>• Encrypted facial features only</li>
              </ul>
            </div>

            <Button
              onClick={startCamera}
              className="w-full h-12"
              size="lg"
              disabled={isCameraLoading}
            >
              {isCameraLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Starting Camera...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'capture') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Position Your Face</CardTitle>
                <CardDescription>Look directly at the camera</CardDescription>
              </div>
              <Badge variant="secondary">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Face detection overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-full opacity-50"></div>
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="font-medium">
                Position your face in the circle Prem
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Make sure your face is well-lit and clearly visible
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  stopCamera()
                  setStep('ready')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={capturePhoto}
                className="flex-1"
                disabled={isCameraLoading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture & Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Authenticating...</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzing your facial features and matching with your profile
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Processing image...</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Extracting features...</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Matching profile...</span>
                  <Loader2 className="h-3 w-3 animate-spin" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 mb-2">
                  Authentication Successful!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Welcome back! You have been successfully authenticated.
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-green-700">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-2">
                  Authentication Failed
                </h3>
                <p className="text-sm text-muted-foreground">
                  We couldn't match your face with any registered user. Please
                  try again.
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-red-700 mb-2">Possible reasons:</p>
                <ul className="text-xs text-red-600 space-y-1">
                  <li>• Poor lighting conditions</li>
                  <li>• Face partially obscured</li>
                  <li>• Camera angle too extreme</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="flex-1 bg-transparent"
                >
                  Back to Home
                </Button>
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
