import {NextFunction, Request, Response} from "express";
import { check, validationResult } from 'express-validator';
import { ApiError } from '../models/apiError';
import * as authService from '../services/authService';
import { cookie } from '../config/config'

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    await check("userId", "userId cannot be blank").isLength({min: 1}).run(req);
    await check("password", "Password cannot be blank").isLength({min: 1}).run(req);

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        return next(new ApiError('Validation failed.', 422, errors.array()));
    }

    const response = await authService.login(req.body.userId, req.body.password);

    if (response.errorCode !== 0) {
        return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
    }

    res.cookie('jwt', response.refreshToken, cookie);
    res.status(200).json({ 'token' : response.accessToken, 'roles': response.user.roles, 'userId' : response.user.userId });
}
