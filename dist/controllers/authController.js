"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.logout = exports.login = void 0;
const express_validator_1 = require("express-validator");
const apiError_1 = require("../models/apiError");
const authService = __importStar(require("../services/authService"));
const config_1 = require("../config/config");
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, express_validator_1.check)("userId", "userId cannot be blank").isLength({ min: 1 }).run(req);
        yield (0, express_validator_1.check)("password", "Password cannot be blank").isLength({ min: 1 }).run(req);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new apiError_1.ApiError('Validation failed.', 422, errors.array()));
        }
        const response = yield authService.login(req.body.userId, req.body.password);
        if (response.errorCode !== 0) {
            return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }
        res.cookie('jwt', response.refreshToken, config_1.cookie);
        res.status(200).json({ 'token': response.accessToken, 'user': response.user });
    });
}
exports.login = login;
function logout(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookies = req.cookies;
        if (!cookies) {
            res.status(204);
            return;
        }
        const refreshToken = cookies.jwt;
        if (!refreshToken) {
            res.status(204);
            return;
        }
        const response = yield authService.logout(req.body.user._id.toString());
        if (response !== 0) {
            res.status(204);
        }
        res.clearCookie('jwt', config_1.cookie);
        res.status(204).json({ 'token': 'Logout successfully' });
    });
}
exports.logout = logout;
