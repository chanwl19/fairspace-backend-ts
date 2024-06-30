import {NextFunction, Request, Response} from "express";
import { body, check, validationResult } from 'express-validator';
import { ApiError } from '../models/apiError';
import * as userService from '../services/userService';

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    await check("userId", "userId cannot be blank").isLength({min: 9, max: 9}).run(req);
    await check("password", "Password must be at least 10 characters long").isLength({ min: 10 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
    await check("roleIds", "Please select role").isArray({ min: 1}).run(req);
    await check("email", "Email is not a valid centennial email").isEmail().matches(/^[A-Za-z0-9]+@my\.centennialcollege\.ca$/).run(req);
    await body("email").normalizeEmail().run(req);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ApiError('Validation failed.', 422, errors.array()));
    }

    const response = await userService.signup(req.body.userId, req.body.password, req.body.email, req.body.roleIds);

    if (response.errorCode !== 0) {
        return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
    }

    res.status(201).json({ 'message': 'user created'});
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.headers?.userId as string;
        if (!userId){
            return next(new ApiError("No user found", 404, []));
        };
        const response = await userService.getUser(userId);
    
        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }
        res.status(200).json({ 'user': response.user});
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }   
}