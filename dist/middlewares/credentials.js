"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const allowedOrigins = process.env.ALLOW_ORIGINS || ["http://localhost:3000"];
const env = process.env.ENV || 'dev';
function credentials(req, res, next) {
    const origin = req.headers.origin;
    if (env === 'dev') {
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    else {
        if (allowedOrigins.includes(origin || "")) {
            res.header('Access-Control-Allow-Credentials', 'true');
        }
    }
    next();
}
exports.credentials = credentials;
