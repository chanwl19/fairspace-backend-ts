"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const encryptKey = process.env.ENCRYPT_KEY || 'MY_SECRET_KEY';
const algorithm = 'aes-256-ctr';
const ivLength = 32;
function encrypt(text) {
    try {
        const iv = crypto_1.default.randomBytes(ivLength);
        const cipher = crypto_1.default.createCipheriv(algorithm, encryptKey, iv);
        let encrypted = cipher.update(text, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        console.log("IN encrypted " + encrypted);
        return encrypted;
    }
    catch (error) {
        console.log(error);
    }
    return "";
}
exports.encrypt = encrypt;
function decrypt(encryptedText) {
    const iv = crypto_1.default.randomBytes(ivLength);
    const decipher = crypto_1.default.createDecipheriv(algorithm, encryptKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
exports.decrypt = decrypt;
