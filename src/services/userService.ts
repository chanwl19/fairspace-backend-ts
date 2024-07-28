import { User } from '../models/user';
import { Role } from '../models/role';
import { hash } from 'bcryptjs';
import { encrypt } from '../middlewares/encryptText';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import { uploadFile, uploadImage } from '../middlewares/fileUpload';
import sendEmail from '../middlewares/sendEmail';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

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

export async function signup(userId: string, password: string, email: string, roleIds: number[], firstName: string,
    middleName: string, lastName: string, phoneNo: string): Promise<BasicReturn> {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    
    const signupReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };
    //check if user exist
    const duplicatedUser = await User.findOne({ $or: [{ userId: userId}, { email: email }] });

    if (duplicatedUser && duplicatedUser.status !== 'D') {
        signupReturn.errorCode = 409;
        signupReturn.errorMessage = 'User already exists';
        return signupReturn;
    }

    //check if role exists
    const roles = await Role.find({ roleId: roleIds });
    const resetPasswordToken = uuidv4();

    if (!roles || roles.length === 0) {
        signupReturn.errorCode = 404;
        signupReturn.errorMessage = 'Role not found';
        return signupReturn;
    };
    console.log("I am here before email")
    await sendEmail("donotreply@fairspace.com", email, "Welcome to FairSpace", "<h1>Welcome to FairSpace</h1><p>Please set your new password at <a href='https://fairspace.netlify.app/resetPassword?token=" + resetPasswordToken + "'>Reset Password</a></p>");
    
    console.log("I am here after email")
    //create user if not exist
    await User.create({
        userId: userId,
        //password: await hash(password, 12),
        email: email,
        status: 'I',
        roles: roles,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        resetPasswordToken: resetPasswordToken
    });
    console.log("I am here after save user")
    signupReturn.errorCode = 0;
    signupReturn.errorMessage = '';
    await sess.commitTransaction();
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

export async function getUsers() {

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

export async function updateUser(phoneNo: string, image: Express.Multer.File, idKey: string, password: string,
    email: string, roleIds: number[], firstName: string, middleName: string, lastName: string): Promise<BasicReturn> {
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
        // if (image) {
        //     const blob = await uploadImage(image);
        //     user.image = blob?.downloadUrl;
        // }
        if (phoneNo) {
            user.phoneNo = phoneNo;
        }
        if (email) {
            user.email = email;
        }
        if (firstName) {
            user.firstName = firstName;
        }
        if (middleName) {
            user.middleName = middleName;
        }
        if (lastName) {
            user.middleName = lastName;
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

export async function deleteUser(_id: string): Promise<BasicReturn> {

    const deleteReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        await User.findByIdAndDelete(_id);
        deleteReturn.errorCode = 0;
        deleteReturn.errorMessage = "";
    } catch {
        deleteReturn.errorCode = 500;
        deleteReturn.errorMessage = 'Error Occurs';
    }
    return deleteReturn;
}

export async function resetPassword(userId: string, password: string, token: string): Promise<BasicReturn> {
    const resetPasswordReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        const user = await User.findOne({ $and: [{userId : userId}, {resetPasswordToken: token}]});

        if (!user) {
            resetPasswordReturn.errorCode = 404;
            resetPasswordReturn.errorMessage = "No user found";
            return resetPasswordReturn;
        }
        user.password = await hash(password, 12);
        user.resetPasswordToken = "";
        await user.save();
        sess.commitTransaction();
        resetPasswordReturn.errorCode = 0;
        resetPasswordReturn.errorMessage = "";
    } catch {
        resetPasswordReturn.errorCode = 500;
        resetPasswordReturn.errorMessage = 'Error Occurs';
    }

    return resetPasswordReturn;
}