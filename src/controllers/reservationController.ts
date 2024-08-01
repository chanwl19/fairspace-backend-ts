import { NextFunction, Request, Response } from "express";
import { check, validationResult } from 'express-validator';
import { ApiError } from '../models/apiError';
import * as reservationService from '../services/reservationService';

export async function createReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        await check("facilityId", "facility id cannot be blank").not().isEmpty().run(req);
        await check("userId", "user id cannot be blank").not().isEmpty().run(req);
        await check("reserveStartDt", "reservation start date cannot be blank").not().isEmpty().run(req);
        await check("reserveEndDt", "reservation end date cannot be blank").not().isEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError('Validation failed.', 422, errors.array()));
        }

        const response = await reservationService.createReservation(req.body.userId, req.body.facilityId, req.body.reserveStartDt, req.body.reserveEndDt);

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }

        res.status(201).json({ 'message': 'reservation created' });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }
}

export async function updateReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

        await check("facilityId", "facility id cannot be blank").not().isEmpty().run(req);
        await check("userId", "user id cannot be blank").not().isEmpty().run(req);
        await check("reservationId", "reservation id cannot be blank").not().isEmpty().run(req);
        await check("reserveStartDt", "reservation start date cannot be blank").not().isEmpty().run(req);
        await check("reserveEndDt", "reservation end date cannot be blank").not().isEmpty().run(req);
        await check("status", "status cannot be blank").not().isEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError('Validation failed.', 422, errors.array()));
        }

        const response = await reservationService.updateReservation(req.body.userId, req.body.reservationId, req.body.facilityId, req.body.reserveStartDt, req.body.reserveEndDt, req.body.status);

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }

        res.status(201).json({ 'message': 'reservation updated' });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }
}

