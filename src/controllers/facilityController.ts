import { NextFunction, Request, Response } from "express";
import { check, validationResult } from 'express-validator';
import { ApiError } from '../models/apiError';
import * as facilityService from '../services/facilityService';

export async function createFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        await check("location", "location cannot be blank").not().isEmpty().run(req);
        await check("type", "type cannot be blank").not().isEmpty().run(req);
        await check("openTime", "openTime cannot be blank").not().isEmpty().run(req);
        await check("closeTime", "closeTime cannot be blank").not().isEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError('Validation failed.', 422, errors.array()));
        }

        const response = await facilityService.createFacility(req.body.location, req.body.type, req.body.openTime, req.body.closeTime, req.body.capacity, req.body.seatNumber);

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }

        res.status(201).json({ 'message': 'facility created' });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }
}

export async function updateFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

        const response = await facilityService.updateFacility(req.body._id, req.body.location, req.body.type, req.body.openTime, req.body.closeTime, req.body.capacity, req.body.seatNumber);

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }

        res.status(201).json({ 'message': 'facility updated' });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }
}

export async function getFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const response = await facilityService.getFacility();

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }
        res.status(200).json({ 'facilities': response.facilities });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }
}

export async function deleteFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        console.log("Id in controller is  ", req.body._id);
        const response = await facilityService.deleteFacility(req.body._id);

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }
        res.status(200).json({ 'message': 'Facility deleted' });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }
}
