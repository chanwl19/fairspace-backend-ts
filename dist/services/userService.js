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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUser = exports.signup = void 0;
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const bcryptjs_1 = require("bcryptjs");
const encryptText_1 = require("../middlewares/encryptText");
function signup(userId, password, email, roleIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const signupReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        //check if user exist
        const duplicatedUser = yield user_1.User.findOne({ $or: [{ userId: userId }, { email: email }] });
        if (duplicatedUser) {
            signupReturn.errorCode = 409;
            signupReturn.errorMessage = 'User already exists';
            return signupReturn;
        }
        //check if role exists
        const roles = yield role_1.Role.find({ roleId: roleIds });
        if (!roles || roles.length === 0) {
            signupReturn.errorCode = 404;
            signupReturn.errorMessage = 'Role not found';
            return signupReturn;
        }
        ;
        //create user if not exist
        yield user_1.User.create({
            userId: userId,
            password: yield (0, bcryptjs_1.hash)(password, 12),
            email: email,
            status: 'A',
            roles: roles
        });
        signupReturn.errorCode = 0;
        signupReturn.errorMessage = '';
        return signupReturn;
    });
}
exports.signup = signup;
function getUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userReturn = {
            user: new user_1.User(),
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        try {
            const user = yield user_1.User.findOne({ userId: userId }).select('-password -refreshToken -createdAt -updatedAt').populate('roles');
            if (!user) {
                userReturn.errorCode = 404;
                userReturn.errorMessage = 'User not found';
                return userReturn;
            }
            userReturn.user = user;
            userReturn.errorCode = 0;
            userReturn.errorMessage = "";
        }
        catch (_a) {
            userReturn.errorCode = 500;
            userReturn.errorMessage = 'Error Occurs';
            return userReturn;
        }
        return userReturn;
    });
}
exports.getUser = getUser;
function updateUser(phoneNo, image, _id) {
    return __awaiter(this, void 0, void 0, function* () {
        const updateReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        try {
            const user = yield user_1.User.findById(_id);
            if (!user) {
                updateReturn.errorCode = 404;
                updateReturn.errorMessage = 'User not found';
                return updateReturn;
            }
            user.phoneNo = (0, encryptText_1.encrypt)(phoneNo);
            user.image = image;
            yield user.save();
            updateReturn.errorCode = 0;
            updateReturn.errorMessage = "";
        }
        catch (_a) {
            updateReturn.errorCode = 500;
            updateReturn.errorMessage = 'Error Occurs';
            return updateReturn;
        }
        return updateReturn;
    });
}
exports.updateUser = updateUser;
