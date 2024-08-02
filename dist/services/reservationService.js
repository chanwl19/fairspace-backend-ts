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
exports.getAvailableTimeSlot = exports.getReservation = exports.updateReservation = exports.createReservation = void 0;
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
            if (startDate >= endDate) {
                createReservationReturn.errorCode = 500;
                createReservationReturn.errorMessage = "Start date must be before end date";
                return createReservationReturn;
            }
            if (!(0, dateUtils_1.checkSameDate)(startDate, endDate)) {
                createReservationReturn.errorCode = 500;
                createReservationReturn.errorMessage = "Only same date reservatio is allowed";
                return createReservationReturn;
            }
            ;
            //Check if user exists
            const user = yield user_1.User.find({ userId: userId });
            if (!user || user.length === 0) {
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
            const facilityOpenDt = new Date(startDate.getTime());
            const facilityCloseDt = new Date(endDate.getTime());
            facilityOpenDt.setHours(openTimeArr[0], openTimeArr[1], 0, 0);
            facilityCloseDt.setHours(closeTimeArr[0], closeTimeArr[1], 0, 0);
            if (startDate < facilityOpenDt || endDate > facilityCloseDt) {
                createReservationReturn.errorCode = 404;
                createReservationReturn.errorMessage = "Facility is closed during the period";
                return createReservationReturn;
            }
            const reserveDateLowerBound = new Date(startDate.getTime());
            reserveDateLowerBound.setHours(0, 0, 0, 0);
            const reserveDateUpperBound = new Date(reserveDateLowerBound.getTime());
            reserveDateUpperBound.setDate(reserveDateLowerBound.getDate() + 1);
            const reservations = yield reservation_1.Reservation.find({ facility: facility, status: 'A', reserveStartTime: { $gte: reserveDateLowerBound, $lt: reserveDateUpperBound } });
            if (reservations && reservations.length > 0) {
                const overLappedReservations = reservations.filter(reservation => {
                    return (0, dateUtils_1.checkOverlappTime)(reservation.reserveStartTime, reservation.reserveEndTime, startDate, endDate);
                });
                if (overLappedReservations && overLappedReservations.length > 0) {
                    createReservationReturn.errorCode = 409;
                    createReservationReturn.errorMessage = "The timeslot is already reserved";
                    return createReservationReturn;
                }
            }
            // const isOverlapped = await checkOverlapReservation(facilityId.toString(), startDate, endDate, (sess || undefined));
            // if (isOverlapped) {
            //     createReservationReturn.errorCode = 409;
            //     createReservationReturn.errorMessage = "The timeslot is already reserved";
            //     return createReservationReturn;
            // }
            //create reservation if not exist
            const newReservations = yield reservation_1.Reservation.create([{
                    reserveStartTime: startDate,
                    reserveEndTime: endDate,
                    status: 'A',
                    facility: facility,
                    userId: userId
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
            if (reservation.userId !== userId) {
                updateReservationReturn.errorCode = 404;
                updateReservationReturn.errorMessage = "User Id does not match";
                return updateReservationReturn;
            }
            if (reservation.status !== 'A') {
                updateReservationReturn.errorCode = 404;
                updateReservationReturn.errorMessage = "Reservation not found";
                return updateReservationReturn;
            }
            reservation.status = status;
            yield reservation.save({ session: sess });
            if (status === 'D') {
                const createReservationResponse = yield createReservation(userId, facilityId, startDt, endDt, sess);
                if (createReservationResponse.errorCode !== 0) {
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
function getReservation(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const getReservationReturn = {
            reservations: [],
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        try {
            //check find reservation base on userId
            const reservations = yield reservation_1.Reservation.find({ userId: userId, status: { $ne: 'D' } }).populate('facility').sort({ reserveStartTime: 1 });
            getReservationReturn.reservations = reservations;
            getReservationReturn.errorCode = 0;
            getReservationReturn.errorMessage = '';
        }
        catch (err) {
            getReservationReturn.errorCode = 500;
            getReservationReturn.errorMessage = 'Error Occurs';
        }
        return getReservationReturn;
    });
}
exports.getReservation = getReservation;
function getAvailableTimeSlot(facilityType, reserveDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const getAvailableFacilityReturn = {
            facilityAvailableTimeSlots: [],
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        try {
            //convert reserve date
            const facilities = yield facility_1.Facility.find({ type: facilityType, status: 'A' });
            const facilityAvailableTimeSlots = [];
            if (!facilities || facilities.length === 0) {
                getAvailableFacilityReturn.errorCode = 404;
                getAvailableFacilityReturn.errorMessage = 'No facility not found';
                return getAvailableFacilityReturn;
            }
            yield Promise.all(facilities.map((facility) => __awaiter(this, void 0, void 0, function* () {
                const facilityOpenDt = new Date(reserveDate.getTime());
                const facilityCloseDt = new Date(reserveDate.getTime());
                const reserveDateLowerBound = new Date(reserveDate.getTime());
                const reserveDateUpperBound = new Date(reserveDate.getTime());
                const openTimes = (facility.openTime.split(':')).map(Number);
                const closeTimes = (facility.closeTime.split(':')).map(Number);
                facilityOpenDt.setHours(openTimes[0], openTimes[1], 0, 0);
                facilityCloseDt.setHours(closeTimes[0], closeTimes[1], 0, 0);
                reserveDateLowerBound.setHours(0, 0, 0, 0);
                reserveDateUpperBound.setDate(reserveDateLowerBound.getDate() + 1);
                const existingReservations = yield reservation_1.Reservation.find({ facility: facility, status: 'A', reserveStartTime: { $gte: reserveDateLowerBound, $lt: reserveDateUpperBound } });
                const reserveStartDt = new Date(facilityOpenDt.getTime());
                const reserveEndDt = new Date(facilityOpenDt.getTime());
                while (reserveStartDt < facilityCloseDt) {
                    reserveEndDt.setMinutes(reserveStartDt.getMinutes() + 30);
                    if (existingReservations && existingReservations.length > 0) {
                        const overLappedReservations = existingReservations.filter(existingReservation => {
                            return (0, dateUtils_1.checkOverlappTime)(existingReservation.reserveStartTime, existingReservation.reserveEndTime, new Date(reserveStartDt.getTime()), new Date(reserveEndDt.getTime()));
                        });
                        if (overLappedReservations && overLappedReservations.length > 0) {
                            reserveStartDt.setMinutes(reserveStartDt.getMinutes() + 30);
                            continue;
                        }
                    }
                    const avaliableTimeSlot = {
                        facility: facility,
                        startDt: new Date(reserveStartDt.getTime()),
                        endDt: new Date(reserveEndDt.getTime())
                    };
                    facilityAvailableTimeSlots.push(avaliableTimeSlot);
                    getAvailableFacilityReturn.facilityAvailableTimeSlots.push(avaliableTimeSlot);
                    reserveStartDt.setMinutes(reserveStartDt.getMinutes() + 30);
                }
            })));
            getAvailableFacilityReturn.facilityAvailableTimeSlots = facilityAvailableTimeSlots;
            getAvailableFacilityReturn.errorCode = 0;
            getAvailableFacilityReturn.errorMessage = '';
        }
        catch (err) {
            getAvailableFacilityReturn.errorCode = 500;
            getAvailableFacilityReturn.errorMessage = 'Error Occurs';
        }
        return getAvailableFacilityReturn;
    });
}
exports.getAvailableTimeSlot = getAvailableTimeSlot;
// export async function checkOverlapReservation(facilityId: string, reserveStartDt: Date, reserveEndDt: Date, sess: mongoose.mongo.ClientSession | undefined = undefined): Promise<boolean> {
//     if (!sess) {
//         return true;
//     }
//     const duplicateReservations = await Reservation.find({
//         $or: [
//             { facility: facilityId, status: 'A', reserveStartTime: { $lte: reserveStartDt }, reserveEndTime: { $gte: reserveEndDt } }, //case 1 new reservation is in the middle of an existing reservation
//             { facility: facilityId, status: 'A', reserveStartTime: { $gte: reserveStartDt }, reserveEndTime: { $lte: reserveEndDt } }, //case 2 new reservation covers an existing reservation
//             { facility: facilityId, status: 'A', reserveStartTime: { $gt: reserveStartDt, $lt: reserveEndDt } }, // case 3 new reservation end date overlaps with an exsiting reservation
//             { facility: facilityId, status: 'A', reserveEndTime: { $gt: reserveStartDt, $lt: reserveEndDt } } // case 4 new reservation start date overlaps with an exsiting reservation
//         ]
//     }, null, { session: sess })
//     if (duplicateReservations && duplicateReservations.length > 0) {
//         return true;
//     }
//     return false;
// }
