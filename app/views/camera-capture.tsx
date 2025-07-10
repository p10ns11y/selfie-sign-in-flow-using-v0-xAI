import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera } from "lucide-react"

export function CaptureView({ videoRef, canvasRef, onCapture, onCancel, isLoading }) {
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
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Face detection overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white rounded-full opacity-50"></div>
            </div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="font-medium">Position your face in the circle</p>
            <p className="text-sm text-muted-foreground mt-1">Make sure your face is well-lit and clearly visible</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onCapture} className="flex-1" disabled={isLoading}>
              <Camera className="h-4 w-4 mr-2" />
              Capture & Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
