import { User } from '../models/user';
import { Role } from '../models/role';
import { hash } from 'bcryptjs';


interface BasicReturn{
    errorCode: number; 
    errorMessage: string;
}

interface UserReturn extends BasicReturn{
    user: InstanceType<typeof User>;
}

export async function signup(userId: string, password: string, email: string, roleIds: number[]): Promise<BasicReturn> {
    const signupReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };
    //check if user exist
    const duplicatedUser = await User.findOne({$or: [{userId: userId},{email: email}]});

    if (duplicatedUser) {
        signupReturn.errorCode = 409;
        signupReturn.errorMessage = 'User already exists';
        return signupReturn;
    }

    //check if role exists
    const roles = await Role.find({ roleId : roleIds});

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

    console.log("userid in service " + userId)
    const userReturn: UserReturn = {
        user: new User(),
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        const user = await User.findOne({ userId: userId}).select('-password -refreshToken -createdAt -updatedAt').populate('roles');
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


