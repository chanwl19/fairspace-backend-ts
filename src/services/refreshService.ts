import { User } from '../models/user';
import { sign, verify } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface TokenReturn{
    newRefreshToken: string;
    accessToken: string; 
    errorCode: number; 
    errorMessage: string;
}

interface TokenInterface {
    userId: string;
    iat: number; 
    exp: number;
}

export async function refreshToken(refreshToken: string): Promise<TokenReturn> {
    const tokenReturn: TokenReturn = {
        newRefreshToken: '',
        accessToken: '',
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    const foundUser = await User.findOne({ refreshToken:  refreshToken});
    // Detected refresh token reuse!
    if (!foundUser) {
        await verify(
            refreshToken,
            process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
            async (err, decoded) => {
                if (err) {
                    tokenReturn.errorCode = 403;
                    tokenReturn.errorMessage = 'Forbidden';
                    return tokenReturn;
                }
                const hackedUser = await User.findOne({ userId: (decoded as TokenInterface).userId});
                if (hackedUser){
                    hackedUser.refreshToken = "";
                    const result = await hackedUser.save();
                };
            }
        )
        tokenReturn.errorCode = 403;
        tokenReturn.errorMessage = 'Forbidden';
        return tokenReturn;
    }
    // evaluate jwt 
    await verify(
        refreshToken,
        process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY',
        async (err, decoded) => {
            if (err) {
                if (foundUser){
                    foundUser.refreshToken = "";
                    const result = await foundUser.save();
                }
            }
            if (err || (foundUser && (foundUser.userId !== (decoded as TokenInterface).userId))) {
                tokenReturn.errorCode = 403;
                tokenReturn.errorMessage = 'Forbidden';
                return tokenReturn;
            }

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
                { expiresIn: '1h' }
            );

            // Saving refreshToken with current user
            foundUser.refreshToken = newRefreshToken;
            const result = await foundUser.save();

            // return new refresh token and access token to controller
            tokenReturn.errorCode = 0;
            tokenReturn.errorMessage = '';
            tokenReturn.accessToken = accessToken;
            tokenReturn.newRefreshToken = newRefreshToken;
            return tokenReturn;
        }
    );
    return tokenReturn;
}


