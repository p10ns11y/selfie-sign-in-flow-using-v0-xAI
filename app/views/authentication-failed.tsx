"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"

export function AuthFailedView({ onRetry, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Authentication Failed</h3>
              <p className="text-sm text-muted-foreground">
                We couldn't match your face with any registered user. Please try again.
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
              <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                Back to Home
              </Button>
              <Button onClick={onRetry} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
