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
exports.getUser = exports.signup = void 0;
const express_validator_1 = require("express-validator");
const apiError_1 = require("../models/apiError");
const userService = __importStar(require("../services/userService"));
function signup(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, express_validator_1.check)("userId", "userId cannot be blank").isLength({ min: 9, max: 9 }).run(req);
        yield (0, express_validator_1.check)("password", "Password must be at least 10 characters long").isLength({ min: 10 }).run(req);
        yield (0, express_validator_1.check)("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
        yield (0, express_validator_1.check)("roleIds", "Please select role").isArray({ min: 1 }).run(req);
        yield (0, express_validator_1.check)("email", "Email is not a valid centennial email").isEmail().matches(/^[A-Za-z0-9]+@my\.centennialcollege\.ca$/).run(req);
        yield (0, express_validator_1.body)("email").normalizeEmail().run(req);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new apiError_1.ApiError('Validation failed.', 422, errors.array()));
        }
        const response = yield userService.signup(req.body.userId, req.body.password, req.body.email, req.body.roleIds);
        if (response.errorCode !== 0) {
            return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }
        res.status(201).json({ 'message': 'user created' });
    });
}
exports.signup = signup;
function getUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                return next(new apiError_1.ApiError("No user found", 404, []));
            }
            ;
            const response = yield userService.getUser(userId);
            if (response.errorCode !== 0) {
                return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
            }
            res.status(200).json({ 'user': response.user });
        }
        catch (_b) {
            return next(new apiError_1.ApiError("Error Occurs", 500, []));
        }
    });
}
exports.getUser = getUser;
