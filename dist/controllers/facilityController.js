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
exports.deleteFacility = exports.getFacility = exports.updateFacility = exports.createFacility = void 0;
const express_validator_1 = require("express-validator");
const apiError_1 = require("../models/apiError");
const facilityService = __importStar(require("../services/facilityService"));
function createFacility(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, express_validator_1.check)("location", "location cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("type", "type cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("openTime", "openTime cannot be blank").not().isEmpty().run(req);
            yield (0, express_validator_1.check)("closeTime", "closeTime cannot be blank").not().isEmpty().run(req);
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return next(new apiError_1.ApiError('Validation failed.', 422, errors.array()));
            }
            const response = yield facilityService.createFacility(req.body.location, req.body.type, req.body.openTime, req.body.closeTime, req.body.capacity, req.body.seatNumber);
            if (response.errorCode !== 0) {
                return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
            }
            res.status(201).json({ 'message': 'facility created' });
        }
        catch (_a) {
            return next(new apiError_1.ApiError("Error Occurs", 500, []));
        }
    });
}
exports.createFacility = createFacility;
function updateFacility(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield facilityService.updateFacility(req.body._id, req.body.location, req.body.type, req.body.openTime, req.body.closeTime, req.body.capacity, req.body.seatNumber);
            if (response.errorCode !== 0) {
                return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
            }
            res.status(201).json({ 'message': 'facility updated' });
        }
        catch (_a) {
            return next(new apiError_1.ApiError("Error Occurs", 500, []));
        }
    });
}
exports.updateFacility = updateFacility;
function getFacility(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield facilityService.getFacility();
            if (response.errorCode !== 0) {
                return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
            }
            res.status(200).json({ 'facilities': response.facilities });
        }
        catch (_a) {
            return next(new apiError_1.ApiError("Error Occurs", 500, []));
        }
    });
}
exports.getFacility = getFacility;
function deleteFacility(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Id in controller is  ", req.body._id);
            const response = yield facilityService.deleteFacility(req.body._id);
            if (response.errorCode !== 0) {
                return next(new apiError_1.ApiError(response.errorMessage || "Error Occurs", response.errorCode || 500, []));
            }
            res.status(200).json({ 'message': 'Facility deleted' });
        }
        catch (_a) {
            return next(new apiError_1.ApiError("Error Occurs", 500, []));
        }
    });
}
exports.deleteFacility = deleteFacility;
