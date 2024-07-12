"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const user_1 = require("../models/user");
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function refreshToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenReturn = {
            newRefreshToken: '',
            accessToken: '',
            errorCode: 500,
            errorMessage: 'Error Occurs',
            user: new user_1.User()
        };
        const foundUser = yield user_1.User.findOne({ refreshToken: token }).populate('roles');
        console.log("In refresh service ", foundUser);
        // Detected refresh token reuse!
        if (!foundUser) {
            console.log("NO user found");
            try {
                tokenReturn.errorCode = 403;
                tokenReturn.errorMessage = 'Forbidden Error';
                const decoded = yield (0, jsonwebtoken_1.verify)(token, process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY');
                if (!decoded) {
                    throw new Error();
                }
                const hackedUser = yield user_1.User.findOne({ userId: decoded.userId });
                if (hackedUser) {
                    hackedUser.refreshToken = "";
                    const result = yield hackedUser.save();
                }
                ;
                return tokenReturn;
            }
            catch (_a) {
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
            const decoded = yield (0, jsonwebtoken_1.verify)(token, process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY');
            if (!decoded) {
                throw new Error();
            }
            if (foundUser && (foundUser.userId !== decoded.userId)) {
                throw new Error();
            }
            ;
            const accessToken = (0, jsonwebtoken_1.sign)({ "userId": foundUser.userId, "roles": foundUser.roles }, process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY', { expiresIn: '10s' });
            const newRefreshToken = (0, jsonwebtoken_1.sign)({ "userId": foundUser.userId }, process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY', { expiresIn: '1d' });
            foundUser.refreshToken = newRefreshToken;
            console.log("update user founduser ", foundUser);
            const saveUser = yield foundUser.save();
            console.log("return result ", saveUser);
            tokenReturn.errorCode = 0;
            tokenReturn.errorMessage = '';
            tokenReturn.accessToken = accessToken;
            tokenReturn.newRefreshToken = newRefreshToken;
            tokenReturn.user = foundUser;
            return tokenReturn;
        }
        catch (_b) {
            console.log("Exception");
            if (foundUser) {
                foundUser.refreshToken = "";
                yield foundUser.save();
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
    });
}
exports.refreshToken = refreshToken;
