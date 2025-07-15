import {
  DetectFacesCommand,
  IndexFacesCommand,
  RekognitionClient,
} from '@aws-sdk/client-rekognition'
import { NextResponse } from 'next/server'

const rekognitionClient = new RekognitionClient({
  region: 'eu-west-1',
})

export async function POST(req: Request) {
  const requestBody = await req.json()
  try {
    if (requestBody.action === 'validate') {
      const { action, photo } = requestBody
      const buffer = Buffer.from(photo.split(',')[1], 'base64')
      const command = new DetectFacesCommand({
        Image: { Bytes: buffer },
        Attributes: ['ALL'],
      })
      const response = await rekognitionClient.send(command)
      console.log(response)
      if (response.FaceDetails?.length !== 1) throw new Error('Invalid photo')
      return NextResponse.json({ success: true, data: response })
    } else if (requestBody.action === 'index') {
      const { photos } = requestBody
      const collectionId = 'auth-selfies'

      await Promise.all(
        photos.map(async photo => {
          const buffer = Buffer.from(photo.split(',')[1], 'base64')
          const params = {
            CollectionId: collectionId,
            Image: { Bytes: buffer },
            // ExternalImageId: userId,
            DetectionAttributes: ['ALL'],
          }
          const command = new IndexFacesCommand(params)
          await rekognitionClient.send(command) // v3 send
        }),
      )

      console.log('Faces indexed successfully')

      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
