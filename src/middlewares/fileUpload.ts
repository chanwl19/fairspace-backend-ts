import multer, { FileFilterCallback } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request } from "express";

const MIME_TYPE_MAP: { [index: string]: string } = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

type DestinationCallback = (error: Error | null, destination: string) => void

const fileUpload =
    multer({
        limits: { fileSize: 500000 },
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads');
            },
            filename: (req: Request, file: Express.Multer.File, cb: DestinationCallback) => {
                const ext = MIME_TYPE_MAP[file.mimetype];
                cb(null, uuidv4() + '.' + ext);
            }
        }),
        fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
            const isValid = !!MIME_TYPE_MAP[file.mimetype];
            if (isValid) {
                cb(null, true);
            } else {
                cb(new Error('Invalid mime type!'));
            }
        }
    });

export default fileUpload;


