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
exports.deleteUser = exports.updateUser = exports.getUsers = exports.getUserById = exports.signup = void 0;
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const bcryptjs_1 = require("bcryptjs");
const encryptText_1 = require("../middlewares/encryptText");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function signup(userId, password, email, roleIds, firstName, middleName, lastName, phoneNo) {
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
        // if (phoneNo) {
        //     phoneNo = encrypt(phoneNo);
        // }
        //create user if not exist
        yield user_1.User.create({
            userId: userId,
            password: yield (0, bcryptjs_1.hash)(password, 12),
            email: email,
            status: 'A',
            roles: roles,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            phoneNo: phoneNo
        });
        signupReturn.errorCode = 0;
        signupReturn.errorMessage = '';
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
                user.phoneNo = (0, encryptText_1.encrypt)(phoneNo);
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
            return deleteReturn;
        }
        catch (_a) {
            deleteReturn.errorCode = 500;
            deleteReturn.errorMessage = 'Error Occurs';
            return deleteReturn;
        }
        return deleteReturn;
    });
}
exports.deleteUser = deleteUser;
