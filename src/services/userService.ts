import { User } from '../models/user';
import { Role } from '../models/role';
import { hash } from 'bcryptjs';
import { encrypt } from '../middlewares/encryptText';
import dotenv from 'dotenv';
import { uploadImage } from '../middlewares/fileUpload';
import sendEmail from '../middlewares/sendEmail';
import mongoose from 'mongoose';
import { sign, verify } from 'jsonwebtoken';
import axios from 'axios';


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

interface TokenInterface {
    userId: string;
    iat: number;
    exp: number;
}

export async function signup(userId: string, password: string, email: string, roleIds: number[], firstName: string,
    middleName: string, lastName: string, phoneNo: string): Promise<BasicReturn> {

    const signupReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        //check if user exist
        const duplicatedUser = await User.findOne({ $or: [{ userId: userId }, { email: email }] });

        if (duplicatedUser && duplicatedUser.status !== 'D') {
            signupReturn.errorCode = 409;
            signupReturn.errorMessage = 'User already exists';
            return signupReturn;
        }

        //check if role exists
        const roles = await Role.find({ roleId: roleIds });
        const resetPasswordToken = sign(
            { "userId": userId },
            process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY',
            { expiresIn: '2d' }
        );

        if (!roles || roles.length === 0) {
            signupReturn.errorCode = 404;
            signupReturn.errorMessage = 'Role not found';
            return signupReturn;
        };

        //create user if not exist
        await User.create([{
            userId: userId,
            //password: await hash(password, 12),
            email: email,
            status: 'I',
            roles: roles,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName
        }], { session: sess });

        try {
            await axios.post(process.env.EMAIL_URL || '', JSON.stringify({
                'from': "FairSpace <donotreply@fairspace.com>",
                'to': email,
                'subject': "Welcome to FairSpace",
                'content': "<h1>Welcome to FairSpace</h1><p>Please set your new password at <a href='https://fairspace.netlify.app/resetPassword?token=" + resetPasswordToken + "'>Reset Password</a></p>"
            }),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
        } catch (err) {
            console.log(err)
            signupReturn.errorCode = 500;
            signupReturn.errorMessage = 'Cannot send email';
            return signupReturn;
        }
        // const isSendEmail = await sendEmail("FairSpace <donotreply@fairspace.com>", email, "Welcome to FairSpace", "<h1>Welcome to FairSpace</h1><p>Please set your new password at <a href='https://fairspace.netlify.app/resetPassword?token=" + resetPasswordToken + "'>Reset Password</a></p>");
        // console.log('isSendEmail ', isSendEmail)
        // if (!isSendEmail){
        //     signupReturn.errorCode = 500;
        //     signupReturn.errorMessage = 'Cannot send email';
        //     return signupReturn;
        // }

        signupReturn.errorCode = 0;
        signupReturn.errorMessage = '';
        await sess.commitTransaction();
    } catch {
        signupReturn.errorCode = 500;
        signupReturn.errorMessage = 'Error Occurs';
    }
    sess.endSession();
    return signupReturn;
}

export async function getUserById(userId: string): Promise<UserReturn> {

    const userReturn: UserReturn = {
        user: new User(),
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        const user = await User.findOne({ userId: userId }).select('-password -refreshToken -createdAt -updatedAt').populate('roles').populate('reservations');
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
    }

    return usersReturn;
}

export async function updateUser(image: Express.Multer.File, idKey: string, password: string,
    email: string, roleIds: number[], firstName: string, middleName: string, lastName: string): Promise<BasicReturn> {
    const updateReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        const user = await User.findById(idKey);
        if (!user) {
            updateReturn.errorCode = 404;
            updateReturn.errorMessage = 'User not found';
            return updateReturn;
        };
        const blob = await uploadImage(image);
        user.image = blob?.downloadUrl;
        user.email = email;
        user.firstName = firstName;
        user.middleName = middleName;
        user.lastName = lastName;

        if (roleIds && roleIds?.length > 0) {
            const roles = await Role.find({ roleId: roleIds });
            if (roles && roles?.length > 0) {
                user.roles = roles.map(role => role._id);
            }
        }
        await user.save({ session: sess });
        await sess.commitTransaction();
        updateReturn.errorCode = 0;
        updateReturn.errorMessage = "";
    } catch {
        updateReturn.errorCode = 500;
        updateReturn.errorMessage = 'Error Occurs';
    }
    sess.endSession();
    return updateReturn;
}

export async function deleteUser(_id: string): Promise<BasicReturn> {

    const deleteReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };
    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        await User.findByIdAndUpdate(_id, { status: "D" }, { session: sess });
        deleteReturn.errorCode = 0;
        deleteReturn.errorMessage = "";
        await sess.commitTransaction();
    } catch {
        deleteReturn.errorCode = 500;
        deleteReturn.errorMessage = 'Error Occurs';
    }
    sess.endSession();
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
        let user;
        if (userId) {
            user = await User.findOne({ userId: userId });
        }
        if (token) {
            try {
                const decoded = await verify(token, process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY');
                console.log("token id ", decoded);
                if (!decoded) {
                    resetPasswordReturn.errorCode = 404;
                    resetPasswordReturn.errorMessage = "Token has already expired";
                    return resetPasswordReturn;
                }
                user = await User.findOne({ userId: (decoded as TokenInterface).userId });
            } catch {
                resetPasswordReturn.errorCode = 404;
                resetPasswordReturn.errorMessage = "Token has already expired";
                return resetPasswordReturn;
            }
        }
        if (!user) {
            resetPasswordReturn.errorCode = 404;
            resetPasswordReturn.errorMessage = "No user found";
            return resetPasswordReturn;
        }

        user.password = await hash(password, 12);
        user.status = 'A';
        await user.save({ session: sess });
        await sess.commitTransaction();
        resetPasswordReturn.errorCode = 0;
        resetPasswordReturn.errorMessage = "";
    } catch {
        resetPasswordReturn.errorCode = 500;
        resetPasswordReturn.errorMessage = 'Error Occurs';
    }
    sess.endSession();
    return resetPasswordReturn;
}