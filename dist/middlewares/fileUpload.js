"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncFile = void 0;
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const gcpCredentials_1 = __importDefault(require("../middlewares/gcpCredentials"));
const storage_1 = require("@google-cloud/storage");
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
function syncFile(image) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const storage = new storage_1.Storage((0, gcpCredentials_1.default)());
            const bucket = storage.bucket(process.env.BUCKET_NAME || 'fairspace_image');
            const extArray = image.mimetype.split("/");
            const extension = extArray[extArray.length - 1];
            const fileName = (0, uuid_1.v4)() + '.' + extension;
            const blob = bucket.file(fileName);
            const blobStream = blob.createWriteStream();
            console.log("file start to upload");
            return new Promise((resolve, reject) => {
                console.log("File completed sync again!!!");
                blobStream.end(image.buffer);
                blobStream.on("finish", () => resolve(fileName));
                blobStream.on("error", reject);
            });
            // blobStream.on("success", () => {return Promise.resolve(fileName)} );
            // blobStream.on("error", () => {
            //   return Promise.resolve("");
            // });
            // return Promise.resolve("");
        }
        catch (_a) {
            console.log("Error ");
            return Promise.resolve("");
        }
    });
}
exports.syncFile = syncFile;
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
