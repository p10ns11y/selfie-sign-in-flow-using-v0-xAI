import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Camera, ArrowLeft, Loader2, Shield, User } from 'lucide-react'

export function CameraReadyView({ onStart, onBack, isLoading }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Sign In</CardTitle>
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
            onClick={onStart}
            className="w-full h-12"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
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
