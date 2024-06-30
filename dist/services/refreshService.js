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
function refreshToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenReturn = {
            newRefreshToken: '',
            accessToken: '',
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        const foundUser = yield user_1.User.findOne({ refreshToken: refreshToken });
        // Detected refresh token reuse!
        if (!foundUser) {
            yield (0, jsonwebtoken_1.verify)(refreshToken, process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY', (err, decoded) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    tokenReturn.errorCode = 403;
                    tokenReturn.errorMessage = 'Forbidden';
                    return tokenReturn;
                }
                const hackedUser = yield user_1.User.findOne({ userId: decoded.userId });
                if (hackedUser) {
                    hackedUser.refreshToken = "";
                    const result = yield hackedUser.save();
                }
                ;
            }));
            tokenReturn.errorCode = 403;
            tokenReturn.errorMessage = 'Forbidden';
            return tokenReturn;
        }
        // evaluate jwt 
        yield (0, jsonwebtoken_1.verify)(refreshToken, process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY', (err, decoded) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                if (foundUser) {
                    foundUser.refreshToken = "";
                    const result = yield foundUser.save();
                }
            }
            if (err || (foundUser && (foundUser.userId !== decoded.userId))) {
                tokenReturn.errorCode = 403;
                tokenReturn.errorMessage = 'Forbidden';
                return tokenReturn;
            }
            //sign a new access token
            const accessToken = (0, jsonwebtoken_1.sign)({ "userId": foundUser.userId, "roles": foundUser.roles }, process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY', { expiresIn: '10s' });
            //Generate new refresh token
            const newRefreshToken = (0, jsonwebtoken_1.sign)({ "userId": foundUser.userId }, process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY', { expiresIn: '1h' });
            // Saving refreshToken with current user
            foundUser.refreshToken = newRefreshToken;
            const result = yield foundUser.save();
            // return new refresh token and access token to controller
            tokenReturn.errorCode = 0;
            tokenReturn.errorMessage = '';
            tokenReturn.accessToken = accessToken;
            tokenReturn.newRefreshToken = newRefreshToken;
            return tokenReturn;
        }));
        return tokenReturn;
    });
}
exports.refreshToken = refreshToken;
