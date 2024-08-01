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
exports.checkOverlapReservation = exports.updateReservation = exports.createReservation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reservation_1 = require("../models/reservation");
const facility_1 = require("../models/facility");
const dateUtils_1 = require("../utils/dateUtils");
const user_1 = require("../models/user");
function createReservation(userId_1, facilityId_1, startDate_1, endDate_1) {
    return __awaiter(this, arguments, void 0, function* (userId, facilityId, startDate, endDate, sess = undefined) {
        const createReservationReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        let passInSess = true;
        if (!sess) {
            passInSess = false;
            sess = yield mongoose_1.default.startSession();
            sess.startTransaction();
        }
        try {
            //check if start date and end date valid
            let startDt;
            let endDt;
            try {
                startDt = new Date(startDate);
                endDt = new Date(endDate);
            }
            catch (_a) {
                createReservationReturn.errorCode = 500;
                createReservationReturn.errorMessage = "Date is not valid";
                return createReservationReturn;
            }
            if (startDt >= endDt) {
                createReservationReturn.errorCode = 500;
                createReservationReturn.errorMessage = "Start date must be before end date";
                return createReservationReturn;
            }
            if (!(0, dateUtils_1.checkSameDate)(startDt, endDt)) {
                createReservationReturn.errorCode = 500;
                createReservationReturn.errorMessage = "Only same date reservatio is allowed";
                return createReservationReturn;
            }
            ;
            //Check if user exists
            const user = yield user_1.User.findById(userId);
            if (!user) {
                createReservationReturn.errorCode = 404;
                createReservationReturn.errorMessage = "User not found";
                return createReservationReturn;
            }
            //check if facility exists
            const facility = yield facility_1.Facility.findById(facilityId);
            if (!facility) {
                createReservationReturn.errorCode = 404;
                createReservationReturn.errorMessage = "Facility not found";
                return createReservationReturn;
            }
            //Set open and close time
            const openTimeArr = (facility.openTime.split(':')).map(Number);
            const closeTimeArr = (facility.closeTime.split(':')).map(Number);
            const facilityOpenDt = new Date(startDate);
            const facilityCloseDt = new Date(endDt);
            facilityOpenDt.setHours(openTimeArr[0], openTimeArr[1], 0, 0);
            facilityCloseDt.setHours(closeTimeArr[0], closeTimeArr[1], 0, 0);
            if (startDt < facilityOpenDt || endDt > facilityCloseDt) {
                createReservationReturn.errorCode = 404;
                createReservationReturn.errorMessage = "Facility is closed during the period";
                return createReservationReturn;
            }
            const isOverlapped = yield checkOverlapReservation(facilityId.toString(), startDt, endDt, (sess || undefined));
            if (isOverlapped) {
                createReservationReturn.errorCode = 409;
                createReservationReturn.errorMessage = "The timeslot is already reserved";
                return createReservationReturn;
            }
            //create reservation if not exist
            const newReservations = yield reservation_1.Reservation.create([{
                    reserveStartTime: startDt,
                    reserveEndTime: endDt,
                    status: 'A',
                    facility: facility,
                    user: user
                }], { session: sess });
            createReservationReturn.errorCode = 0;
            createReservationReturn.errorMessage = '';
            if (!passInSess) {
                yield sess.commitTransaction();
            }
        }
        catch (err) {
            createReservationReturn.errorCode = 500;
            createReservationReturn.errorMessage = 'Error Occurs';
        }
        finally {
            if (!passInSess) {
                yield sess.endSession();
            }
        }
        return createReservationReturn;
    });
}
exports.createReservation = createReservation;
function updateReservation(userId, reservationId, facilityId, startDt, endDt, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const updateReservationReturn = {
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        try {
            //check if reservation exists
            const reservation = yield reservation_1.Reservation.findById(reservationId);
            if (!reservation) {
                updateReservationReturn.errorCode = 404;
                updateReservationReturn.errorMessage = "Reservation not found";
                return updateReservationReturn;
            }
            //Check if user exists 
            const user = yield user_1.User.findById(userId);
            if (!user) {
                updateReservationReturn.errorCode = 404;
                updateReservationReturn.errorMessage = "User not found";
                return updateReservationReturn;
            }
            reservation.status = status;
            yield reservation.save({ session: sess });
            if (status === 'D') {
                const createReservationResponse = yield createReservation(userId, facilityId, startDt, endDt, sess);
                console.log('createReservationResponse ', createReservationResponse);
                if (createReservationResponse.errorCode !== 0) {
                    console.log('response code isnot zero ', createReservationResponse.errorCode);
                    console.log('response code isnot zero ', createReservationResponse.errorMessage);
                    updateReservationReturn.errorCode = createReservationResponse.errorCode;
                    updateReservationReturn.errorMessage = createReservationResponse.errorMessage;
                    return updateReservationReturn;
                }
            }
            updateReservationReturn.errorCode = 0;
            updateReservationReturn.errorMessage = '';
            yield sess.commitTransaction();
        }
        catch (err) {
            console.log('err ', err);
            updateReservationReturn.errorCode = 500;
            updateReservationReturn.errorMessage = 'Error Occurs';
        }
        finally {
            sess.endSession();
        }
        return updateReservationReturn;
    });
}
exports.updateReservation = updateReservation;
function checkOverlapReservation(facilityId_1, reserveStartDt_1, reserveEndDt_1) {
    return __awaiter(this, arguments, void 0, function* (facilityId, reserveStartDt, reserveEndDt, sess = undefined) {
        if (!sess) {
            return true;
        }
        const duplicateReservations = yield reservation_1.Reservation.find({
            $or: [
                { facility: facilityId, status: 'A', reserveStartTime: { $lte: reserveStartDt }, reserveEndTime: { $gte: reserveEndDt } }, //case 1 new reservation is in the middle of an existing reservation
                { facility: facilityId, status: 'A', reserveStartTime: { $gte: reserveStartDt }, reserveEndTime: { $lte: reserveEndDt } }, //case 2 new reservation covers an existing reservation
                { facility: facilityId, status: 'A', reserveStartTime: { $gt: reserveStartDt, $lt: reserveEndDt } }, // case 3 new reservation end date overlaps with an exsiting reservation
                { facility: facilityId, status: 'A', reserveEndTime: { $gt: reserveStartDt, $lt: reserveEndDt } } // case 4 new reservation start date overlaps with an exsiting reservation
            ]
        }, null, { session: sess });
        if (duplicateReservations && duplicateReservations.length > 0) {
            return true;
        }
        return false;
    });
}
exports.checkOverlapReservation = checkOverlapReservation;
