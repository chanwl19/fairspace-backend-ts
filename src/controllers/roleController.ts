import { NextFunction, Request, Response } from "express";
import { ApiError } from '../models/apiError';
import * as roleService from '../services/roleService';

export async function getRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const response = await roleService.getRoles();

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }
        res.status(200).json({ 'roles': response.roles });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }
}
