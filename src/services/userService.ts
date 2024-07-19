import { User } from '../models/user';
import { Role } from '../models/role';
import { hash } from 'bcryptjs';
import { encrypt } from '../middlewares/encryptText';
import getGCPCredentials from '../middlewares/gcpCredentials';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import { uploadFile, uploadImage } from '../middlewares/fileUpload';

dotenv.config();

interface BasicReturn {
    errorCode: number;
    errorMessage: string;
}

interface UserReturn extends BasicReturn {
    user: InstanceType<typeof User>;
}

interface UsersReturn extends BasicReturn {
    users: InstanceType<typeof User>[];
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

export async function getUserById(userId: string): Promise<UserReturn> {

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

export async function getUsers(){

    const usersReturn: UsersReturn = {
        users: [],
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        const users = await User.find({}).select('-password -refreshToken -createdAt -updatedAt').populate('roles');
        usersReturn.users = users;
        usersReturn.errorCode = 0;
        usersReturn.errorMessage = "";
    } catch {
        usersReturn.errorCode = 500;
        usersReturn.errorMessage = 'Error Occurs';
        return usersReturn;
    }
    
    return usersReturn;
}

export async function updateUser(phoneNo: string, image: Express.Multer.File, idKey: string): Promise<BasicReturn> {
    const updateReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        const user = await User.findById(idKey);
        if (!user) {
            updateReturn.errorCode = 404;
            updateReturn.errorMessage = 'User not found';
            return updateReturn;
        };
        if (image) {
            const blob = await uploadImage(image);
            user.image = blob?.downloadUrl;
        }
        if (phoneNo) {
            user.phoneNo = encrypt(phoneNo);
        }
        await user.save();
        updateReturn.errorCode = 0;
        updateReturn.errorMessage = "";
        return updateReturn
    } catch {
        updateReturn.errorCode = 500;
        updateReturn.errorMessage = 'Error Occurs';
        return updateReturn;
    }

    return updateReturn;
}

export async function deleteUser(userId: string): Promise<BasicReturn> {

    const deleteReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        
        await User.findByIdAndDelete(userId);
        deleteReturn.errorCode = 0;
        deleteReturn.errorMessage = "";
        return deleteReturn
    } catch {
        deleteReturn.errorCode = 500;
        deleteReturn.errorMessage = 'Error Occurs';
        return deleteReturn;
    }

    return deleteReturn
}
