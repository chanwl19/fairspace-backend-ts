"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// import { Storage } from "@google-cloud/storage"
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};
const fileUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        if (isValid) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid mime type!'));
        }
    }
});
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
exports.default = fileUpload;
