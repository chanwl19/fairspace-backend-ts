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
exports.getAvailableTimeSlot = exports.getRservation = exports.updateReservation = exports.createReservation = void 0;
const express_validator_1 = require("express-validator");
const apiError_1 = require("../models/apiError");
const reservationService = __importStar(require("../services/reservationService"));
function createReservation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, express_validator_1.check)("facilityId", "facility id cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("userId", "user id cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("reserveStartDt", "reservation start date cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("reserveEndDt", "reservation end date cannot be blank").not().isEmpty().run(req);
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return next(new apiError_1.ApiError('Validation failed.', 422, errors.array()));
            }
            const reserveStartDt = new Date(req.body.reserveStartDt);
            const reserveEndDt = new Date(req.body.reserveEndDt);
            if (isNaN(reserveStartDt.getTime()) || isNaN(reserveEndDt.getTime())) {
                return next(new apiError_1.ApiError('Invalid date format for reservation start end date', 500, []));
            }
            const response = yield reservationService.createReservation(req.body.userId, req.body.facilityId, reserveStartDt, reserveEndDt);
            if (response.errorCode !== 0) {
                return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
            }
            res.status(201).json({ 'message': 'reservation created' });
        }
        catch (_a) {
            return next(new apiError_1.ApiError("Error Occurs", 500, []));
        }
    });
}
exports.createReservation = createReservation;
function updateReservation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, express_validator_1.check)("facilityId", "facility id cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("userId", "user id cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("reservationId", "reservation id cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("reserveStartDt", "reservation start date cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("reserveEndDt", "reservation end date cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("status", "status cannot be blank").not().isEmpty().run(req);
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return next(new apiError_1.ApiError('Validation failed.', 422, errors.array()));
            }
            const reserveStartDt = new Date(req.body.reserveStartDt);
            const reserveEndDt = new Date(req.body.reserveEndDt);
            if (isNaN(reserveStartDt.getTime()) || isNaN(reserveEndDt.getTime())) {
                return next(new apiError_1.ApiError('Invalid date format for reservation start end date', 500, []));
            }
            const response = yield reservationService.updateReservation(req.body.userId, req.body.reservationId, req.body.facilityId, reserveStartDt, reserveEndDt, req.body.status);
            if (response.errorCode !== 0) {
                return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
            }
            res.status(201).json({ 'message': 'reservation updated' });
        }
        catch (_a) {
            return next(new apiError_1.ApiError("Error Occurs", 500, []));
        }
    });
}
exports.updateReservation = updateReservation;
function getRservation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.query.userId;
            if (!userId) {
                return next(new apiError_1.ApiError('User Id cannot be empty', 404, []));
            }
            const response = yield reservationService.getReservation(userId.toString());
            if (response.errorCode !== 0) {
                return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
            }
            res.status(201).json({ 'message': 'get reservation successfully', 'reservations': response.reservations });
        }
        catch (_a) {
            return next(new apiError_1.ApiError("Error Occurs", 500, []));
        }
    });
}
exports.getRservation = getRservation;
function getAvailableTimeSlot(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const facilityType = req.query.facilityType;
            const reserveDateStr = req.query.reserveDate;
            const reservationIdStr = req.query.reservationId;
            if (!facilityType || !reserveDateStr) {
                return next(new apiError_1.ApiError('Facilty Type and Reserve Date cannot be empty', 404, []));
            }
            if (facilityType.toString() !== 'D' && facilityType.toString() !== 'R') {
                return next(new apiError_1.ApiError('Invalid Facilty Type', 500, []));
            }
            const reserveDate = new Date(reserveDateStr.toString());
            if (isNaN(reserveDate.getTime())) {
                return next(new apiError_1.ApiError('Invalid Reserve Date format', 500, []));
            }
            let reservationId = '1';
            if (reservationIdStr) {
                reservationId = reservationIdStr.toString();
            }
            const response = yield reservationService.getAvailableTimeSlot(facilityType.toString(), reserveDate, reservationId);
            if (response.errorCode !== 0) {
                return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
            }
            res.status(201).json({ 'message': 'get available timeslots successfully', 'timeslots': response.facilityAvailableTimeSlots });
        }
        catch (_a) {
            return next(new apiError_1.ApiError("Error Occurs", 500, []));
        }
    });
}
exports.getAvailableTimeSlot = getAvailableTimeSlot;
