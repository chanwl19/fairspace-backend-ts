import { User } from '../models/user';
import { Role } from '../models/role';
import { hash } from 'bcryptjs';
import { encrypt } from '../middlewares/encryptText';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@google-cloud/storage';

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
    const storage = new Storage({ keyFilename: `../keyfolder/${process.env.GOOGLE_CLOUD_KEY_FILE}`, projectId: process.env.GOOGLE_PROJECT_ID });
    const bucket = storage.bucket(process.env.BUCKET_NAME || 'fairspace_image');
    console.log('in update user service phoneNo ' ,phoneNo, ' idKey ', idKey )
    const updateReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        console.log("Finding user");
        const user = await User.findById(idKey);
        console.log("User found");
        if (!user) {
            updateReturn.errorCode = 404;
            updateReturn.errorMessage = 'User not found';
            return updateReturn;
        };

        console.log("Before upload image image ", image);
        if (image) {
            console.log("File found, trying to upload...");
            const extArray = image.mimetype.split("/");
            const extension = extArray[extArray.length - 1];
            const fileName = uuidv4() + '.' + extension;
            console.log("Upload file name  ", fileName)
            const blob = bucket.file(fileName);
            const blobStream = blob.createWriteStream();

            blobStream.on("finish", () => {
                console.log("Success");
            });
            blobStream.on("error", (error) => {
                console.log("error ", error );
            });
            blobStream.end(image.buffer);
        }

        user.phoneNo = encrypt(phoneNo);
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

