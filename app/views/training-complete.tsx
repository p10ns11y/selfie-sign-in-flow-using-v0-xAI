'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function CompleteView({ onSubmit, isCapturing }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Training Complete!</CardTitle>
          <CardDescription>
            Your facial recognition model has been successfully trained with AWS
            Rekognition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your photos are processed securely with face detection</li>
              <li>• Facial features are extracted, indexed, and encrypted</li>
              <li>• You can now sign in with just a selfie verification</li>
            </ul>
          </div>
          <Button className="w-full" disabled={isCapturing} onClick={onSubmit}>
            {isCapturing ? 'Creating Account...' : 'Complete Setup'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
