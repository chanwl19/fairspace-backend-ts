import multer, { FileFilterCallback } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request } from "express";
import dotenv from 'dotenv';
import getGCPCredentials from '../middlewares/gcpCredentials';
import { Storage } from '@google-cloud/storage';
import { put } from '@vercel/blob';
import fs from 'fs';

dotenv.config();

export const maxDuration = 30;

const MIME_TYPE_MAP: { [index: string]: string } = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

type DestinationCallback = (error: Error | null, destination: string) => void

export const fileHandler = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Invalid mime type!'));
    }
  }
});

export async function uploadFile(image: Express.Multer.File) {
  try {
    const storage = new Storage(getGCPCredentials());
    const bucket = storage.bucket(process.env.BUCKET_NAME || 'fairspace_image');
    const extArray = image.mimetype.split("/");
    const extension = extArray[extArray.length - 1];
    const fileName = uuidv4() + '.' + extension;
    const buffer = image.buffer;
    console.log("buffer ");
    await bucket.file(fileName).save(Buffer.from(buffer));
    return process.env.GCP_URL_PREFIX || 'https://storage.cloud.google.com/fairspace_image/' + fileName;
  } catch (error) {
    console.log("Error ", error);
    return "";
  }
}

export async function uploadImage(file: Express.Multer.File) {
  let blob;
  if (file) {
    console.log("file upload")
    const imageFile = fs.createReadStream(file.path);
    blob = await put("profile/" + file.filename, imageFile, {
      access: 'public',
    });
    console.log("blob ", blob)
  }
  return blob;
}

// // Get the 'PROJECT_ID' and 'KEYFILENAME' environment variables from the .env file
// const bucketName = process.env.BUCKET_NAME;
// const keyFilename = process.env.GOOGLE_CLOUD_KEY_FILE;

// // Create a new Storage object with the specified project ID and key file
// const storage = new Storage({keyFilename});

// // Define an asynchronous function to upload a file to Google Cloud Storage
// async function uploadFile(file: File) {
//     try {
//         const extArray = file.
//         const extension = extArray[extArray.length - 1];
//         // Get a reference to the specified bucket
//         const bucket = storage.bucket(bucketName || 'fairspace_image');

//         // Upload the specified file to the bucket with the given destination name
//         const ret = await bucket.upload(file, {
//             destination: fileOutputName
//         });

//         // Return the result of the upload operation
//         return ret;
//     } catch (error) {
//         // Handle any errors that occur during the upload process
//         console.error('Error:', error);
//     }
// }

// // Use an immediately-invoked function expression (IIFE) to call the uploadFile function
// (async () => {
//     // Call the uploadFile function with the specified parameters
//     const ret = await uploadFile(process.env.BUCKET_NAME, 'test.txt', 'CodingWithAdo.txt');

//     // Log the result of the upload operation to the console
//     console.log(ret);
// })();


// const MIME_TYPE_MAP: { [index: string]: string } = {
//     'image/png': 'png',
//     'image/jpeg': 'jpeg',
//     'image/jpg': 'jpg'
// };


//type DestinationCallback = (error: Error | null, destination: string) => void

// const fileUpload = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 5_1024_1024 }
// });


// multer({
//     storage: multer.memoryStorage(), 
//     limits: { fileSize: 5_1024_1024},
// });
// multer({
//     limits: { fileSize: 500000 },
//     storage: multer.diskStorage({
//         destination: (req, file, cb) => {
//             console.log("In multer storage destination");
//             cb(null, path.resolve(__dirname,'../uploads/images'));
//         },
//         filename: (req: Request, file: Express.Multer.File, cb: DestinationCallback) => {
//             console.log("In multer storage filename");
//             const ext = MIME_TYPE_MAP[file.mimetype];
//             cb(null, uuidv4() + '.' + ext);
//         }
//     }),
//     fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//         console.log("In multer storage fileFilter");
//         const isValid = !!MIME_TYPE_MAP[file.mimetype];
//         if (isValid) {
//             cb(null, true);
//         } else {
//             cb(new Error('Invalid mime type!'));
//         }
//     }
// });


