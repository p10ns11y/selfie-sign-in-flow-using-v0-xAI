import { Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function AuthSuccessView() {
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
