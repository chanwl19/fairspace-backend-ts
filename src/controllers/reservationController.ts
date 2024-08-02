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

        const reserveStartDt = new Date(req.body.reserveStartDt);
        const reserveEndDt = new Date(req.body.reserveEndDt);

        if (isNaN(reserveStartDt.getTime()) || isNaN(reserveEndDt.getTime())) {
            return next(new ApiError('Invalid date format for reservation start end date', 500, []));
        }

        const response = await reservationService.createReservation(req.body.userId, req.body.facilityId, reserveStartDt, reserveEndDt);

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

        const reserveStartDt = new Date(req.body.reserveStartDt);
        const reserveEndDt = new Date(req.body.reserveEndDt);

        if (isNaN(reserveStartDt.getTime()) || isNaN(reserveEndDt.getTime())) {
            return next(new ApiError('Invalid date format for reservation start end date', 500, []));
        }

        const response = await reservationService.updateReservation(req.body.userId, req.body.reservationId, req.body.facilityId, reserveStartDt, reserveEndDt, req.body.status);

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }

        res.status(201).json({ 'message': 'reservation updated' });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }
}

export async function getRservation(req: Request, res: Response, next: NextFunction): Promise<void>{
    try {

        const userId = req.query.userId;

        if (!userId) {
            return next(new ApiError('User Id cannot be empty', 404, []));
        }

        const response = await reservationService.getReservation(userId.toString());

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }

        res.status(201).json({ 'message': 'get reservation successfully', 'reservations': response.reservations });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }
    
}

export async function getAvailableTimeSlot(req: Request, res: Response, next: NextFunction): Promise<void>{
    
    try {
    
        const facilityType = req.query.facilityType;
        const reserveDateStr = req.query.reserveDate;

        if (!facilityType || !reserveDateStr) {
            return next(new ApiError('Facilty Type and Reserve Date cannot be empty', 404, []));
        }

        if (facilityType.toString() !== 'D' && facilityType.toString() !== 'R') {
            return next(new ApiError('Invalid Facilty Type', 500, []));
        }

        const reserveDate = new Date(reserveDateStr.toString());
       if (isNaN(reserveDate.getTime())) {
            return next(new ApiError('Invalid Reserve Date format', 500, []));
        }

        const response = await reservationService.getAvailableTimeSlot(facilityType.toString(), reserveDate);

        if (response.errorCode !== 0) {
            return next(new ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
        }

        res.status(201).json({ 'message': 'get available timeslots successfully', 'timeslots': response.facilityAvailableTimeSlots });
    } catch {
        return next(new ApiError("Error Occurs", 500, []));
    }   
}


