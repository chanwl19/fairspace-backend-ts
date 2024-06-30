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
exports.isAuthorized = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = require("jsonwebtoken");
const apiError_1 = require("../models/apiError");
dotenv_1.default.config();
function isAuthorized(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // const header = req.headers?.authorization;
            // if (!header) {
            //     return next(new ApiError("Unauthoized", 401, []));
            // }
            // const accessToken = header.split(' ')[1];
            const accessToken = req.body.token;
            const decoded = (0, jsonwebtoken_1.verify)(accessToken, process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY');
            const userId = decoded.userId;
            const roles = decoded.roles;
            if (!roles) {
                throw new apiError_1.ApiError("Forbidden", 403, []);
            }
            const isAllowAccess = checkAllowAccess(roles, req.originalUrl, req.method);
            if (!isAllowAccess) {
                throw new apiError_1.ApiError("Forbidden", 403, []);
            }
            else {
                req.headers.userId = userId;
                next();
            }
        }
        catch (_a) {
            return next(new apiError_1.ApiError("Forbidden", 403, []));
        }
        ;
    });
}
exports.isAuthorized = isAuthorized;
function checkAllowAccess(roles, endPoint, method) {
    if (roles.length === 0) {
        return false;
    }
    const allowAccess = roles.filter(role => role.endPoints.includes(endPoint + ',' + method.toUpperCase()));
    if (allowAccess && allowAccess.length > 0) {
        return true;
    }
    return false;
}
