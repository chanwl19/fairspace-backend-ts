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
exports.updateUser = exports.getUser = exports.signup = void 0;
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const bcryptjs_1 = require("bcryptjs");
const encryptText_1 = require("../middlewares/encryptText");
const dotenv_1 = __importDefault(require("dotenv"));
const fileUpload_1 = require("../middlewares/fileUpload");
dotenv_1.default.config();
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
//export async function updateUser(phoneNo: string, image: Express.Multer.File, idKey: string): Promise<BasicReturn> {
function updateUser(phoneNo, image, idKey) {
    return __awaiter(this, void 0, void 0, function* () {
        // const storage = new Storage(getGCPCredentials());
        // const bucket = storage.bucket(process.env.BUCKET_NAME || 'fairspace_image');
        const updateReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        try {
            const user = yield user_1.User.findById(idKey);
            // let url = process.env.GCP_URL_PREFIX || 'https://storage.cloud.google.com/fairspace_image/';
            if (!user) {
                updateReturn.errorCode = 404;
                updateReturn.errorMessage = 'User not found';
                return updateReturn;
            }
            ;
            // if (image) {
            //     const url = await uploadFile(image);
            // const fileName = await syncFile(image);
            // url = url + fileName;
            // const extArray = image.mimetype.split("/");
            // const extension = extArray[extArray.length - 1];
            // const fileName = uuidv4() + '.' + extension;
            // url = url+ fileName;
            // console.log("IN upload file");
            // console.log("originalname " , image.originalname);
            // console.log("mimetype " , image.mimetype);
            // const blob = bucket.file(fileName);
            // const blobStream = blob.createWriteStream();
            // blobStream.on("finish", () => {
            //      url = url + fileName;
            //      console.log("Success");
            // });
            // blobStream.on("error", (error) => {
            //     console.log("error ", error.message );
            // });
            // blobStream.end(image.buffer);
            // }
            console.log("Start to upload ", new Date().toLocaleString());
            yield (0, fileUpload_1.uploadImage)(image);
            console.log("End to upload ", new Date().toLocaleString());
            if (phoneNo) {
                user.phoneNo = (0, encryptText_1.encrypt)(phoneNo);
            }
            console.log("Finisg encrpty at ", new Date().toLocaleString());
            //user.image = url;
            yield user.save();
            console.log("Finisg save at ", new Date().toLocaleString());
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
