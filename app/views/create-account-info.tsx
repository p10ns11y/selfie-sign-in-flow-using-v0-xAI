// src/components/createaccount/InfoView.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export function InfoView({ onNameChange, onEmailChange, onStart, name, email, onBack }) {
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
              value={name}
              onChange={onNameChange}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={onEmailChange}
              placeholder="Enter your email"
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Next: Facial Recognition Setup</h3>
            <p className="text-sm text-muted-foreground">
              We'll capture 5 photos from different angles to train your facial recognition model.
            </p>
          </div>
          <Button onClick={onStart} className="w-full" disabled={!name || !email}>
            Continue to Photo Capture
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
