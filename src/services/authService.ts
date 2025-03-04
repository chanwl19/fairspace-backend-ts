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
    const user = await User.findOne({ $and :[{ userId: userId }, {status :'A'} ]}).populate('roles');
    if (!user) {
        loginReturn.errorCode = 401;
        loginReturn.errorMessage = 'Invalid user id and password';
        return loginReturn;
    };

    if (user.password) {
        const isCorrectPassword = await compare(password, user.password);
        if (!isCorrectPassword) {
            loginReturn.errorCode = 401 ;
            loginReturn.errorMessage = 'Invalid user id and password';
            return loginReturn;
        }
    }

    const accessToken = sign(
        { "userId": user.userId, "roles": user.roles },
        process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY',
        { expiresIn: '5m' }
    );
    const refreshToken = sign(
        { "userId": user.userId },
        process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
        { expiresIn: '1d' }
    );

    const result = await User.findByIdAndUpdate(user._id.toString(), {refreshToken : refreshToken});
    user.password = "";
    user.refreshToken = '';
    loginReturn.errorCode = 0;
    loginReturn.errorMessage = '';
    loginReturn.refreshToken = refreshToken;
    loginReturn.accessToken = accessToken;
    loginReturn.user = user;
    return loginReturn;
}

export async function logout(_id: string): Promise<number> {
    console.log("in service _id ", _id);
    const user = await User.findById(_id);
    console.log("Found user ", user);
    if (!user){
        return -1;
    }
    const result = await User.findByIdAndUpdate(_id, {refreshToken : ''});
    
    console.log("result ", result);
    return 0;
}