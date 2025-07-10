import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function AuthProcessingView() {
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
