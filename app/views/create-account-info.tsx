'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { REQUIRED_ANGLES } from '../camera-utils'

export function InfoView({
  onNameChange,
  onEmailChange,
  onStart,
  name,
  email,
  onBack,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button onClick={onBack} size="sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Enter your details to get started
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              onChange={onNameChange}
              placeholder="Enter your full name"
              value={name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              onChange={onEmailChange}
              placeholder="Enter your email"
              type="email"
              value={email}
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">
              Next: Secure Facial Training
            </h3>
            <p className="text-sm text-muted-foreground">
              We'll capture {REQUIRED_ANGLES.length} photos from different
              angles to train your facial model using secure AWS Rekognition.
            </p>
          </div>
          <Button
            className="w-full"
            disabled={!name || !email}
            onClick={onStart}
          >
            Continue to Photo Capture
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
