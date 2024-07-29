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
exports.resetPassword = exports.deleteUser = exports.updateUser = exports.getUsers = exports.getUserById = exports.signup = void 0;
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const bcryptjs_1 = require("bcryptjs");
const dotenv_1 = __importDefault(require("dotenv"));
const sendEmail_1 = __importDefault(require("../middlewares/sendEmail"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = require("jsonwebtoken");
dotenv_1.default.config();
function signup(userId, password, email, roleIds, firstName, middleName, lastName, phoneNo) {
    return __awaiter(this, void 0, void 0, function* () {
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        const signupReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        //check if user exist
        const duplicatedUser = yield user_1.User.findOne({ $or: [{ userId: userId }, { email: email }] });
        if (duplicatedUser && duplicatedUser.status !== 'D') {
            signupReturn.errorCode = 409;
            signupReturn.errorMessage = 'User already exists';
            return signupReturn;
        }
        //check if role exists
        const roles = yield role_1.Role.find({ roleId: roleIds });
        const resetPasswordToken = (0, jsonwebtoken_1.sign)({ "userId": userId }, process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY', { expiresIn: '2d' });
        if (!roles || roles.length === 0) {
            signupReturn.errorCode = 404;
            signupReturn.errorMessage = 'Role not found';
            return signupReturn;
        }
        ;
        yield (0, sendEmail_1.default)("donotreply@fairspace.com", email, "Welcome to FairSpace", "<h1>Welcome to FairSpace</h1><p>Please set your new password at <a href='https://fairspace.netlify.app/resetPassword?token=" + resetPasswordToken + "'>Reset Password</a></p>");
        //create user if not exist
        yield user_1.User.create({
            userId: userId,
            //password: await hash(password, 12),
            email: email,
            status: 'I',
            roles: roles,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName
        });
        signupReturn.errorCode = 0;
        signupReturn.errorMessage = '';
        yield sess.commitTransaction();
        return signupReturn;
    });
}
exports.signup = signup;
function getUserById(userId) {
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
exports.getUserById = getUserById;
function getUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const usersReturn = {
            users: [],
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        try {
            const users = yield user_1.User.find({}).select('-password -refreshToken -createdAt -updatedAt').populate('roles');
            usersReturn.users = users;
            usersReturn.errorCode = 0;
            usersReturn.errorMessage = "";
        }
        catch (_a) {
            usersReturn.errorCode = 500;
            usersReturn.errorMessage = 'Error Occurs';
            return usersReturn;
        }
        return usersReturn;
    });
}
exports.getUsers = getUsers;
function updateUser(phoneNo, image, idKey, password, email, roleIds, firstName, middleName, lastName) {
    return __awaiter(this, void 0, void 0, function* () {
        const updateReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        try {
            const user = yield user_1.User.findById(idKey);
            if (!user) {
                updateReturn.errorCode = 404;
                updateReturn.errorMessage = 'User not found';
                return updateReturn;
            }
            ;
            // if (image) {
            //     const blob = await uploadImage(image);
            //     user.image = blob?.downloadUrl;
            // }
            if (phoneNo) {
                user.phoneNo = phoneNo;
            }
            if (email) {
                user.email = email;
            }
            if (firstName) {
                user.firstName = firstName;
            }
            if (middleName) {
                user.middleName = middleName;
            }
            if (lastName) {
                user.middleName = lastName;
            }
            yield user.save();
            updateReturn.errorCode = 0;
            updateReturn.errorMessage = "";
            return updateReturn;
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
function deleteUser(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleteReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        try {
            yield user_1.User.findByIdAndDelete(_id);
            deleteReturn.errorCode = 0;
            deleteReturn.errorMessage = "";
        }
        catch (_a) {
            deleteReturn.errorCode = 500;
            deleteReturn.errorMessage = 'Error Occurs';
        }
        return deleteReturn;
    });
}
exports.deleteUser = deleteUser;
function resetPassword(userId, password, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const resetPasswordReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        try {
            let user;
            if (userId) {
                user = yield user_1.User.findOne({ userId: userId });
            }
            if (token) {
                try {
                    const decoded = yield (0, jsonwebtoken_1.verify)(token, process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY');
                    console.log("token id ", decoded);
                    if (!decoded) {
                        resetPasswordReturn.errorCode = 404;
                        resetPasswordReturn.errorMessage = "Token has already expired";
                        return resetPasswordReturn;
                    }
                    user = yield user_1.User.findOne({ userId: decoded.userId });
                }
                catch (_a) {
                    resetPasswordReturn.errorCode = 404;
                    resetPasswordReturn.errorMessage = "Token has already expired";
                    return resetPasswordReturn;
                }
            }
            if (!user) {
                resetPasswordReturn.errorCode = 404;
                resetPasswordReturn.errorMessage = "No user found";
                return resetPasswordReturn;
            }
            user.password = yield (0, bcryptjs_1.hash)(password, 12);
            user.status = 'A';
            yield user.save();
            sess.commitTransaction();
            resetPasswordReturn.errorCode = 0;
            resetPasswordReturn.errorMessage = "";
        }
        catch (_b) {
            resetPasswordReturn.errorCode = 500;
            resetPasswordReturn.errorMessage = 'Error Occurs';
        }
        return resetPasswordReturn;
    });
}
exports.resetPassword = resetPassword;
