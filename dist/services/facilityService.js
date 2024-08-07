"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFacility = exports.getFacility = exports.updateFacility = exports.createFacility = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const facility_1 = require("../models/facility");
function createFacility(location, type, openTime, closeTime, capacity, seatNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const createFacilityReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        try {
            //check if facility exist
            let duplicateFacilities = [];
            if (type === 'R') {
                duplicateFacilities = yield facility_1.Facility.find({ status: 'A', type: type, location: location });
            }
            else {
                duplicateFacilities = yield facility_1.Facility.find({ status: 'A', type: type, location: location, seatNumber: seatNumber });
            }
            if (duplicateFacilities && duplicateFacilities.length > 0) {
                createFacilityReturn.errorCode = 409;
                createFacilityReturn.errorMessage = 'Facility already exists';
                return createFacilityReturn;
            }
            //create facility if not exist
            yield facility_1.Facility.create([{
                    location: location,
                    type: type,
                    status: 'A',
                    openTime: openTime,
                    closeTime: closeTime,
                    capacity: capacity,
                    seatNumber: seatNumber
                }], { session: sess });
            createFacilityReturn.errorCode = 0;
            createFacilityReturn.errorMessage = '';
            yield sess.commitTransaction();
        }
        catch (_a) {
            createFacilityReturn.errorCode = 500;
            createFacilityReturn.errorMessage = 'Error Occurs';
        }
        finally {
            sess.endSession();
        }
        return createFacilityReturn;
    });
}
exports.createFacility = createFacility;
function updateFacility(_id, location, type, openTime, closeTime, capacity, seatNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const updateFacilityReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        try {
            //check if facility exist
            let facility = yield facility_1.Facility.findById(_id);
            if (!facility) {
                updateFacilityReturn.errorCode = 404;
                updateFacilityReturn.errorMessage = 'Facility cannot be found';
                return updateFacilityReturn;
            }
            let duplicateFacilities = [];
            if (type === 'R') {
                duplicateFacilities = yield facility_1.Facility.find({ status: 'A', type: type, location: location });
            }
            else {
                duplicateFacilities = yield facility_1.Facility.find({ status: 'A', type: type, location: location, seatNumber: seatNumber });
            }
            if (duplicateFacilities && duplicateFacilities.length > 0) {
                updateFacilityReturn.errorCode = 409;
                updateFacilityReturn.errorMessage = 'Facility already exists';
                return updateFacilityReturn;
            }
            //create facility if not exist
            if (location)
                facility.location = location;
            if (type)
                facility.type = type;
            if (openTime)
                facility.openTime = openTime;
            if (closeTime)
                facility.closeTime = closeTime;
            if (capacity && type === 'R')
                facility.capacity = capacity;
            if (seatNumber && type === 'D')
                facility.seatNumber = seatNumber;
            yield facility.save({ session: sess });
            updateFacilityReturn.errorCode = 0;
            updateFacilityReturn.errorMessage = '';
            yield sess.commitTransaction();
        }
        catch (_a) {
            updateFacilityReturn.errorCode = 500;
            updateFacilityReturn.errorMessage = 'Error Occurs';
        }
        finally {
            sess.endSession();
        }
        return updateFacilityReturn;
    });
}
exports.updateFacility = updateFacility;
function getFacility() {
    return __awaiter(this, void 0, void 0, function* () {
        const getFacilityReturn = {
            facilities: [],
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        try {
            //get all facilities 
            const facilities = yield facility_1.Facility.find({ status: 'A' });
            getFacilityReturn.facilities = facilities;
            getFacilityReturn.errorCode = 0;
            getFacilityReturn.errorMessage = '';
        }
        catch (_a) {
            getFacilityReturn.errorCode = 500;
            getFacilityReturn.errorMessage = 'Error Occurs';
        }
        finally {
            sess.endSession();
        }
        return getFacilityReturn;
    });
}
exports.getFacility = getFacility;
function deleteFacility(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleteFacilityReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        try {
            //get all facilities 
            const facilities = yield facility_1.Facility.findByIdAndUpdate(_id, { status: "D" }, { session: sess });
            deleteFacilityReturn.errorCode = 0;
            deleteFacilityReturn.errorMessage = '';
            yield sess.commitTransaction();
        }
        catch (_a) {
            deleteFacilityReturn.errorCode = 500;
            deleteFacilityReturn.errorMessage = 'Error Occurs';
        }
        finally {
            sess.endSession();
        }
        return deleteFacilityReturn;
    });
}
exports.deleteFacility = deleteFacility;
