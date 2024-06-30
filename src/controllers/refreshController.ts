import {NextFunction, Request, Response} from "express";
import { ApiError } from '../models/apiError';
import { cookie } from '../config/config'
import * as refreshService from '../services/refreshService';

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return next(new ApiError('Unauthorized User', 401, []));
    };
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', cookie);

    const response = await refreshService.refreshToken(refreshToken);
    if (response.errorCode !== 0) {
        return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
    }

    // Set refresh cookie
    res.cookie('jwt', response.newRefreshToken, cookie);
    res.status(201).json({ 'message': 'refresh token generated', 'token' : response.accessToken});
}
