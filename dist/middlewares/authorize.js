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
        var _a;
        try {
            if (req.originalUrl === '/user/resetPassword') {
                return next();
            }
            const header = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
            if (!header) {
                return next(new apiError_1.ApiError("Unauthoized", 401, []));
            }
            const accessToken = header.split(' ')[1];
            const decoded = (0, jsonwebtoken_1.verify)(accessToken, process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY');
            const userId = decoded.userId;
            const roles = decoded.roles;
            if (!roles) {
                throw new apiError_1.ApiError("Forbidden", 403, []);
            }
            const isAllowAccess = checkAllowAccess(roles, req.originalUrl.split('?')[0], req.method);
            if (!isAllowAccess) {
                throw new apiError_1.ApiError("Forbidden", 403, []);
            }
            else {
                req.headers.userId = userId;
                next();
            }
        }
        catch (_b) {
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
    console.log('roles ', roles);
    console.log('endPoint ', endPoint, ' method ', method.toUpperCase());
    const allowAccess = roles.filter(role => role.endPoints.includes(endPoint + ',' + method.toUpperCase()));
    console.log('allowAccess ', allowAccess);
    if (allowAccess && allowAccess.length > 0) {
        return true;
    }
    return false;
}
