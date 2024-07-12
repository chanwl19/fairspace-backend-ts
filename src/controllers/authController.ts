import {NextFunction, Request, Response} from "express";
import { check, validationResult } from 'express-validator';
import { ApiError } from '../models/apiError';
import * as authService from '../services/authService';
import { cookie } from '../config/config'

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    await check("userId", "userId cannot be blank").isLength({min: 1}).run(req);
    await check("password", "Password cannot be blank").isLength({min: 1}).run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ApiError('Validation failed.', 422, errors.array()));
    }

    const response = await authService.login(req.body.userId, req.body.password);

    if (response.errorCode !== 0) {
        return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
    }

    res.cookie('jwt', response.refreshToken, cookie);
    res.status(200).json({ 'token' : response.accessToken, 'user': response.user });
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("user ", JSON.stringify(req.body.user));
    const cookies = req.cookies;
    if (!cookies) {
        res.status(204);
        return;
    }

    const refreshToken = cookies.jwt;
    console.log("RefreshToken " , refreshToken);
    if (!refreshToken) {
        res.status(204);
        return;
    }

    const response = await authService.logout(req.body.user._id.toString());

    if (response !== 0) {
        res.status(204);
    }

    res.clearCookie('jwt', cookie);
    res.status(204).json({ 'token' : 'Logout successfully' });
}
