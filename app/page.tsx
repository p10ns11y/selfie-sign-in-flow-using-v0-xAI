'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import CreateAccountPage from './create-account/page'
import SignInPage from './signin/page'

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<'home' | 'create' | 'signin'>(
    'home',
  )

  if (currentPage === 'create') {
    return <CreateAccountPage onBack={() => setCurrentPage('home')} />
  }

  if (currentPage === 'signin') {
    return <SignInPage onBack={() => setCurrentPage('home')} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">FaceAuth</CardTitle>
          <CardDescription>
            Secure authentication using facial recognition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setCurrentPage('create')}
            className="w-full h-12"
            size="lg"
          >
            Create Account
          </Button>
          <Button
            onClick={() => setCurrentPage('signin')}
            variant="outline"
            className="w-full h-12"
            size="lg"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
