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
        verify(
            token,
            process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
            async (err, decoded) => {
                if (err) {
                    tokenReturn.errorCode = 403;
                    tokenReturn.errorMessage = 'Forbidden Error verify refresh token';
                    return tokenReturn;
                }
                const hackedUser = await User.findOne({ userId: (decoded as TokenInterface).userId });
                if (hackedUser) {
                    hackedUser.refreshToken = "";
                    const result = await hackedUser.save();
                };
            }
        )
        tokenReturn.errorCode = 403;
        tokenReturn.errorMessage = 'Forbidden No user found ' + token;
        return tokenReturn;
    }
    console.log('before verify jwt');
    // evaluate jwt 
    verify(
        token,
        process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
        async (err, decoded) => {
            if (err) {
                if (foundUser) {
                    foundUser.refreshToken = "";
                    await foundUser.save();
                }
            }
            if (err || (foundUser && (foundUser.userId !== (decoded as TokenInterface).userId))) {
                tokenReturn.errorCode = 403;
                tokenReturn.errorMessage = 'Forbidden user id not match';
                return tokenReturn;
            }

            console.log('I am signing new token');
            //sign a new access token
            const accessToken = sign(
                { "userId": foundUser.userId, "roles": foundUser.roles },
                process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY',
                { expiresIn: '10s' }
            );

            //Generate new refresh token
            const newRefreshToken = sign(
                { "userId": foundUser.userId },
                process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
                { expiresIn: '1d' }
            );

            // Saving refreshToken with current user
            foundUser.refreshToken = newRefreshToken;
            const saveUser = await foundUser.save().exec();

            console.log('Save refresh token successfully');
            // return new refresh token and access token to controller
            tokenReturn.errorCode = 0;
            tokenReturn.errorMessage = '';
            tokenReturn.accessToken = accessToken;
            tokenReturn.newRefreshToken = newRefreshToken;
            tokenReturn.user = foundUser;
            console.log("Return ", JSON.stringify(tokenReturn))
            //return tokenReturn;
        }
    );

    console.log('here rto return default ');
    return tokenReturn;
}


