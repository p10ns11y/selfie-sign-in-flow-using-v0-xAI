import {
  DetectFacesCommand,
  IndexFacesCommand,
  RekognitionClient,
  SearchFacesByImageCommand,
} from '@aws-sdk/client-rekognition'
import { NextResponse } from 'next/server'

const rekognitionClient = new RekognitionClient({
  region: 'eu-west-1',
})

export async function POST(req: Request) {
  const requestBody = await req.json()

  try {
    if (requestBody.action === 'validate') {
      const { photo } = requestBody
      const buffer = Buffer.from(photo.split(',')[1], 'base64')

      const command = new DetectFacesCommand({
        Attributes: ['ALL'],
        Image: { Bytes: buffer },
      })
      const response = await rekognitionClient.send(command)

      if (response.FaceDetails?.length !== 1) {
        throw new Error('Invalid photo')
      }

      return NextResponse.json({ data: response, success: true })
    } else if (requestBody.action === 'index') {
      const { photos } = requestBody
      const collectionId = 'auth-selfies'

      await Promise.all(
        photos.map(async photo => {
          const buffer = Buffer.from(photo.split(',')[1], 'base64')
          const params = {
            CollectionId: collectionId,
            // ExternalImageId: userId,
            DetectionAttributes: ['ALL'],
            Image: { Bytes: buffer },
          }
          const command = new IndexFacesCommand(params)

          await rekognitionClient.send(command)
        }),
      )

      console.log('Faces indexed successfully')

      return NextResponse.json({ success: true })
    }

    if (requestBody.action === 'authenticate') {
      const { photo, collectionId = 'auth-selfies' } = requestBody
      const buffer = Buffer.from(photo.split(',')[1], 'base64')

      // Step 1: Detect single face (simplifies by reusing create-account logic)
      const detectCommand = new DetectFacesCommand({
        Attributes: ['ALL'],
        Image: { Bytes: buffer },
      })
      const detectResponse = await rekognitionClient.send(detectCommand)
      if (detectResponse.FaceDetails?.length !== 1) {
        throw new Error('Invalid photo: Must detect exactly one face.')
      }

      // Step 2: Search collection for match
      const searchCommand = new SearchFacesByImageCommand({
        CollectionId: collectionId,
        FaceMatchThreshold: 90, // Tune threshold for accuracy vs. false positives
        Image: { Bytes: buffer },
        MaxFaces: 1,
      })
      const searchResponse = await rekognitionClient.send(searchCommand)
      if (searchResponse.FaceMatches?.length === 0) {
        throw new Error('No matching face found.')
      }

      return NextResponse.json({
        match: searchResponse.FaceMatches[0],
        success: true,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
