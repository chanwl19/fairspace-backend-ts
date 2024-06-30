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
exports.login = void 0;
const user_1 = require("../models/user");
const jsonwebtoken_1 = require("jsonwebtoken");
const bcryptjs_1 = require("bcryptjs");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function login(userId, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginReturn = {
            refreshToken: '',
            accessToken: '',
            errorCode: 500,
            errorMessage: 'Error Occurs',
            user: new user_1.User()
        };
        //check if user exist
        const user = yield user_1.User.findOne({ userId: userId }).populate('roles');
        if (!user) {
            loginReturn.errorCode = 401;
            loginReturn.errorMessage = 'Invalid user id and password';
            return loginReturn;
        }
        ;
        const isCorrectPassword = yield (0, bcryptjs_1.compare)(password, user.password);
        if (!isCorrectPassword) {
            loginReturn.errorCode = 401;
            loginReturn.errorMessage = 'Invalid user id and password';
            return loginReturn;
        }
        const accessToken = (0, jsonwebtoken_1.sign)({ "userId": user.userId, "roles": user.roles }, process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY', { expiresIn: '60s' });
        const refreshToken = (0, jsonwebtoken_1.sign)({ "userId": user.userId }, process.env.REFRESH_KEY || 'MY_SECRET_REFRESH_KEY', { expiresIn: '1d' });
        const result = yield user_1.User.findByIdAndUpdate(user._id.toString(), { refreshToken: refreshToken });
        user.password = "";
        loginReturn.errorCode = 0;
        loginReturn.errorMessage = '';
        loginReturn.refreshToken = refreshToken;
        loginReturn.accessToken = accessToken;
        loginReturn.user = user;
        return loginReturn;
    });
}
exports.login = login;
