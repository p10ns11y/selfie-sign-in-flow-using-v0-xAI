import {
  IndexFacesCommand,
  RekognitionClient,
} from '@aws-sdk/client-rekognition'

// Camera utility functions
export const getCameraStream = () =>
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
  })

// export const authenticate = (photo: string) =>
// 	new Promise((resolve) =>
// 		setTimeout(() => resolve(Math.random() > 0.3), 3000),
// 	);

// export const submitAccount = () => new Promise((resolve) => setTimeout(resolve, 2000))

export const REQUIRED_ANGLES = [
  { name: 'Front', instruction: 'Look straight at the camera', icon: '👤' },
  {
    name: 'Left Profile',
    instruction: 'Turn your head to the left',
    icon: '👈',
  },
  {
    name: 'Right Profile',
    instruction: 'Turn your head to the right',
    icon: '👉',
  },
  { name: 'Slight Up', instruction: 'Tilt your head slightly up', icon: '👆' },
  {
    name: 'Slight Down',
    instruction: 'Tilt your head slightly down',
    icon: '👇',
  },
]

const rekognitionClient = new RekognitionClient({ region: 'eu-west-1' })

// const rekognition = new AWS.Rekognition({ region: 'us-east-1' })

// export const REQUIRED_ANGLES = ['front', 'left', 'right'] // Example; update as needed

// export const getCameraStream = () =>
//   navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => stream)

// export const submitAccount2 = async ({ input }: { input: { context: any } }) => {
// 	// Made async for clarity
// 	const { photos, formData } = input.context;
// 	const userId = formData.email; // Or generate UUID/hash
// 	const collectionId = "auth-selfies"; // Create via AWS CLI/console
// 	console.log(photos);
// 	debugger;

// 	await Promise.all(
// 		photos.map(async (photo) => {
// 			const buffer = Buffer.from(photo.split(",")[1], "base64");
// 			const params = {
// 				CollectionId: collectionId,
// 				Image: { Bytes: buffer },
// 				ExternalImageId: userId,
// 				DetectionAttributes: ["ALL"],
// 			};
// 			const command = new IndexFacesCommand(params);
// 			await rekognitionClient.send(command); // v3 send
// 		}),
// 	);
// 	// Optional: Store formData in DynamoDB/S3 for user record
// 	console.log("Faces indexed successfully");
// };
