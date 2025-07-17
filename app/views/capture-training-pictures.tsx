'use client'

import { Camera, Check, Loader2, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { REQUIRED_ANGLES } from '../camera-utils'

export function CreateCaptureView({
  videoRef,
  canvasRef,
  onCapture,
  onRetake,
  currentAngle,
  progress,
  capturedPhotos,
  currentIndex,
  isValidating = false,
  validationError = null,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Photo Capture</CardTitle>
              <CardDescription>
                {capturedPhotos.length} of {REQUIRED_ANGLES.length} photos
                captured
              </CardDescription>
            </div>
            <Badge variant="secondary">{currentAngle.name}</Badge>
          </div>
          <Progress className="w-full" value={progress} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              autoPlay
              className="w-full h-64 object-cover"
              muted
              playsInline
              ref={videoRef}
            />
            <canvas className="hidden" ref={canvasRef} />
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">{currentAngle.icon}</div>
            <p className="font-medium">{currentAngle.instruction}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Position yourself clearly in the frame and click capture
            </p>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertDescription>
                {(validationError as unknown as Error)?.message ||
                  'validation error'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {capturedPhotos.length > 0 && (
              <Button
                className="flex-1 bg-transparent"
                disabled={isValidating}
                onClick={onRetake}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            )}
            <Button
              className="flex-1"
              disabled={isValidating}
              onClick={onCapture}
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating Face...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {REQUIRED_ANGLES.map((angle, index) => (
              <div
                className={`aspect-square rounded border-2 flex items-center justify-center text-xs ${
                  index < capturedPhotos.length
                    ? 'border-green-500 bg-green-50'
                    : index === currentIndex
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
                key={angle.name}
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
