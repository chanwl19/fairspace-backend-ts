import { User } from '../models/user';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

interface LoginReturn{
    refreshToken: string;
    accessToken: string; 
    errorCode: number; 
    errorMessage: string;
    user: InstanceType<typeof User>;
}

export async function login(userId: string, password: string): Promise<LoginReturn> {
    const loginReturn: LoginReturn = {
        refreshToken: '',
        accessToken: '',
        errorCode: 500,
        errorMessage: 'Error Occurs',
        user: new User()
    };
    //check if user exist
    const user = await User.findOne({ userId: userId }).populate('roles');
    if (!user) {
        loginReturn.errorCode = 401;
        loginReturn.errorMessage = 'Invalid user id and password';
        return loginReturn;
    };

    const isCorrectPassword = await compare(password, user.password);
    if (!isCorrectPassword) {
        loginReturn.errorCode = 401 ;
        loginReturn.errorMessage = 'Invalid user id and password';
        return loginReturn;
    }

    const accessToken = sign(
        { "userId": user.userId, "roles": user.roles },
        process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY',
        { expiresIn: '60s' }
    );
    const refreshToken = sign(
        { "userId": user.userId },
        process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
        { expiresIn: '1d' }
    );

    const result = await User.findByIdAndUpdate(user._id.toString(), {refreshToken : refreshToken});
    user.password = "";
    loginReturn.errorCode = 0;
    loginReturn.errorMessage = '';
    loginReturn.refreshToken = refreshToken;
    loginReturn.accessToken = accessToken;
    loginReturn.user = user;
    return loginReturn;
}


