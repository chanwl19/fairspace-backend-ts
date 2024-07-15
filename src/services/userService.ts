import { User } from '../models/user';
import { Role } from '../models/role';
import { hash } from 'bcryptjs';
import { encrypt } from '../middlewares/encryptText';
import getGCPCredentials from '../middlewares/gcpCredentials';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import { uploadFile } from '../middlewares/fileUpload';

dotenv.config();

interface BasicReturn {
    errorCode: number;
    errorMessage: string;
}

interface UserReturn extends BasicReturn {
    user: InstanceType<typeof User>;
}

export async function signup(userId: string, password: string, email: string, roleIds: number[]): Promise<BasicReturn> {
    const signupReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };
    //check if user exist
    const duplicatedUser = await User.findOne({ $or: [{ userId: userId }, { email: email }] });

    if (duplicatedUser) {
        signupReturn.errorCode = 409;
        signupReturn.errorMessage = 'User already exists';
        return signupReturn;
    }

    //check if role exists
    const roles = await Role.find({ roleId: roleIds });

    if (!roles || roles.length === 0) {
        signupReturn.errorCode = 404;
        signupReturn.errorMessage = 'Role not found';
        return signupReturn;
    };

    //create user if not exist
    await User.create({
        userId: userId,
        password: await hash(password, 12),
        email: email,
        status: 'A',
        roles: roles
    });

    signupReturn.errorCode = 0;
    signupReturn.errorMessage = '';
    return signupReturn;
}

export async function getUser(userId: string): Promise<UserReturn> {

    const userReturn: UserReturn = {
        user: new User(),
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        const user = await User.findOne({ userId: userId }).select('-password -refreshToken -createdAt -updatedAt').populate('roles');
        if (!user) {
            userReturn.errorCode = 404;
            userReturn.errorMessage = 'User not found';
            return userReturn;
        }
        userReturn.user = user;
        userReturn.errorCode = 0;
        userReturn.errorMessage = "";
    } catch {
        userReturn.errorCode = 500;
        userReturn.errorMessage = 'Error Occurs';
        return userReturn;
    }
    return userReturn;
}

export async function updateUser(phoneNo: string, image: Express.Multer.File, idKey: string): Promise<BasicReturn> {
    const storage = new Storage(getGCPCredentials());
    const bucket = storage.bucket(process.env.BUCKET_NAME || 'fairspace_image');
    const updateReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        const user = await User.findById(idKey);
        let url = process.env.GCP_URL_PREFIX || 'https://storage.cloud.google.com/fairspace_image/';
        if (!user) {
            updateReturn.errorCode = 404;
            updateReturn.errorMessage = 'User not found';
            return updateReturn;
        };

        if (image) {
            const url = await uploadFile(image);
            // const fileName = await syncFile(image);
            // url = url + fileName;
            // const extArray = image.mimetype.split("/");
            // const extension = extArray[extArray.length - 1];
            // const fileName = uuidv4() + '.' + extension;
            // url = url+ fileName;
            // console.log("IN upload file");
            // console.log("originalname " , image.originalname);
            // console.log("mimetype " , image.mimetype);
            // const blob = bucket.file(fileName);
            // const blobStream = blob.createWriteStream();

            // blobStream.on("finish", () => {
            //      url = url + fileName;
            //      console.log("Success");
            // });
            // blobStream.on("error", (error) => {
            //     console.log("error ", error.message );
            // });
            // blobStream.end(image.buffer);
        }
        if (phoneNo) {
            user.phoneNo = encrypt(phoneNo);
        }
        user.image = url;
        await user.save();
        updateReturn.errorCode = 0;
        updateReturn.errorMessage = "";
    } catch {
        updateReturn.errorCode = 500;
        updateReturn.errorMessage = 'Error Occurs';
        return updateReturn;
    }

    return updateReturn;
}

