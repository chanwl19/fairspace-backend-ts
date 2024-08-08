import { User } from '../models/user';
import { sign, verify } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface TokenReturn {
    newRefreshToken: string;
    accessToken: string;
    errorCode: number;
    errorMessage: string;
    user: InstanceType<typeof User>;
}

interface TokenInterface {
    userId: string;
    iat: number;
    exp: number;
}

export async function refreshToken(token: string): Promise<TokenReturn> {
    const tokenReturn: TokenReturn = {
        newRefreshToken: '',
        accessToken: '',
        errorCode: 500,
        errorMessage: 'Error Occurs',
        user: new User()
    };

    const foundUser = await User.findOne({ refreshToken: token }).populate('roles');
    // Detected refresh token reuse!
    if (!foundUser) {
        try {
            tokenReturn.errorCode = 403;
            tokenReturn.errorMessage = 'Forbidden Error';
            const decoded = await verify(token,
                process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY');
            if (!decoded) {
                throw new Error();
            }
            const hackedUser = await User.findOne({ userId: (decoded as TokenInterface).userId });
            if (hackedUser) {
                hackedUser.refreshToken = "";
                const result = await hackedUser.save();
            };
            return tokenReturn;
        } catch {
            return tokenReturn;
        }
       
        // verify(
        //     token,
        //     process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
        //     async (err, decoded) => {
        //         if (err) {
        //             tokenReturn.errorCode = 403;
        //             tokenReturn.errorMessage = 'Forbidden Error verify refresh token';
        //             return tokenReturn;
        //         }
        //         const hackedUser = await User.findOne({ userId: (decoded as TokenInterface).userId });
        //         if (hackedUser) {
        //             hackedUser.refreshToken = "";
        //             const result = await hackedUser.save();
        //         };
        //     }
        // )
        // tokenReturn.errorCode = 403;
        // tokenReturn.errorMessage = 'Forbidden No user found ' + token;
        // return tokenReturn;
    }
    // evaluate jwt 
    try {
        const decoded = await verify(token,
            process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY');

        if (!decoded) {
            throw new Error();
        }
        if (foundUser && (foundUser.userId !== (decoded as TokenInterface).userId)) {
            throw new Error();
        };
        const accessToken = sign(
            { "userId": foundUser.userId, "roles": foundUser.roles },
            process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY',
            { expiresIn: '5m' }
        );
        console.log("generate new access token " , accessToken)
        const newRefreshToken = sign(
            { "userId": foundUser.userId },
            process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
            { expiresIn: '1d' }
        );
        foundUser.refreshToken = newRefreshToken;
        
        await foundUser.save();

        foundUser.password = "";
        foundUser.refreshToken = '';
        tokenReturn.errorCode = 0;
        tokenReturn.errorMessage = '';
        tokenReturn.accessToken = accessToken;
        tokenReturn.newRefreshToken = newRefreshToken;
        tokenReturn.user = foundUser;
        return tokenReturn;
    } catch {
        if (foundUser) {
            foundUser.refreshToken = "";
            await foundUser.save();
        }
        tokenReturn.errorCode = 403;
        tokenReturn.errorMessage = 'Forbidden user id not match';
        return tokenReturn;
    }
    // verify(
    //     token,
    //     process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
    //     async (err, decoded) => {
    //         if (err) {
    //             if (foundUser) {
    //                 foundUser.refreshToken = "";
    //                 await foundUser.save();
    //             }
    //         }
    //         if (err || (foundUser && (foundUser.userId !== (decoded as TokenInterface).userId))) {
    //             tokenReturn.errorCode = 403;
    //             tokenReturn.errorMessage = 'Forbidden user id not match';
    //             return tokenReturn;
    //         }

    //         console.log('I am signing new token');
    //         //sign a new access token
    //         const accessToken = sign(
    //             { "userId": foundUser.userId, "roles": foundUser.roles },
    //             process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY',
    //             { expiresIn: '10s' }
    //         );

    //         //Generate new refresh token
    //         const newRefreshToken = sign(
    //             { "userId": foundUser.userId },
    //             process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
    //             { expiresIn: '1d' }
    //         );

    //         console.log('Save refresh token successfully');
    //         // return new refresh token and access token to controller
    //         tokenReturn.errorCode = 0;
    //         tokenReturn.errorMessage = '';
    //         tokenReturn.accessToken = accessToken;
    //         tokenReturn.newRefreshToken = newRefreshToken;
    //         tokenReturn.user = foundUser;
    //         console.log("Return ", JSON.stringify(tokenReturn))

    //         // Saving refreshToken with current user
    //         foundUser.refreshToken = newRefreshToken;
    //         const saveUser = await foundUser.save();
    //         return tokenReturn;
    //     }
    // );

    // console.log('here rto return default ');
    // return tokenReturn;
}


