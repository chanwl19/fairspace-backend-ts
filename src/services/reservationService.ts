import mongoose from 'mongoose';
import { Reservation } from '../models/reservation';
import { Facility } from '../models/facility';
import { checkSameDate, checkOverlappTime } from '../utils/dateUtils';
import { User } from '../models/user';

interface BasicReturn {
    errorCode: number;
    errorMessage: string;
}

interface GetReservationReturn extends BasicReturn {
    reservations: InstanceType<typeof Reservation>[];
}

interface TimeSlot {
    startDt: Date;
    endDt: Date;
}

interface FacilityAvailableTimeSlot {
    facility: InstanceType<typeof Facility>;
    timeSlots: TimeSlot[]
}

interface GetAvailableFacilityReturn extends BasicReturn {
    facilityAvailableTimeSlots: FacilityAvailableTimeSlot[];
}


export async function createReservation(userId: string, facilityId: string, startDate: Date, endDate: Date, sess: mongoose.mongo.ClientSession | undefined = undefined): Promise<BasicReturn> {

    const createReservationReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    let passInSess = true;

    if (!sess) {
        passInSess = false;
        sess = await mongoose.startSession();
        sess.startTransaction();
    }

    try {
        if (startDate >= endDate) {
            createReservationReturn.errorCode = 500;
            createReservationReturn.errorMessage = "Start date must be before end date";
            return createReservationReturn;
        }

        if (!checkSameDate(startDate, endDate)) {
            createReservationReturn.errorCode = 500;
            createReservationReturn.errorMessage = "Only same date reservatio is allowed";
            return createReservationReturn;
        };

        //Check if user exists
        const user = await User.find({ userId: userId });
        if (!user || user.length === 0) {
            createReservationReturn.errorCode = 404;
            createReservationReturn.errorMessage = "User not found";
            return createReservationReturn;
        }

        //check if facility exists
        const facility = await Facility.findById(facilityId);
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

        const reservations = await Reservation.find({ facility: facility, status: 'A', reserveStartTime: { $gte: reserveDateLowerBound, $lt: reserveDateUpperBound } });
        if (reservations && reservations.length > 0) {
            const overLappedReservations = reservations.filter(reservation => {
                return checkOverlappTime(reservation.reserveStartTime, reservation.reserveEndTime, startDate, endDate);
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
        const newReservations = await Reservation.create([{
            reserveStartTime: startDate,
            reserveEndTime: endDate,
            status: 'A',
            facility: facility,
            userId: userId
        }], { session: sess });
        createReservationReturn.errorCode = 0;
        createReservationReturn.errorMessage = '';
        if (!passInSess) {
            await sess!.commitTransaction();
        }
    } catch (err) {
        createReservationReturn.errorCode = 500;
        createReservationReturn.errorMessage = 'Error Occurs';
    } finally {
        if (!passInSess) {
            await sess!.endSession();
        }
    }
    return createReservationReturn;
}

export async function updateReservation(userId: string, reservationId: string, facilityId: string, startDt: Date, endDt: Date, status: string): Promise<BasicReturn> {
    const updateReservationReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        //check if reservation exists
        const reservation = await Reservation.findById(reservationId);
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
        await reservation.save({ session: sess });

        if (status === 'D') {
            const createReservationResponse = await createReservation(userId, facilityId, startDt, endDt, sess);
            if (createReservationResponse.errorCode !== 0) {
                updateReservationReturn.errorCode = createReservationResponse.errorCode;
                updateReservationReturn.errorMessage = createReservationResponse.errorMessage;
                return updateReservationReturn;
            }
        }

        updateReservationReturn.errorCode = 0;
        updateReservationReturn.errorMessage = '';

        await sess.commitTransaction();
    } catch (err) {
        updateReservationReturn.errorCode = 500;
        updateReservationReturn.errorMessage = 'Error Occurs';
    } finally {
        sess.endSession();
    }
    return updateReservationReturn;
}

export async function getReservation(userId: string): Promise<GetReservationReturn> {
    const getReservationReturn: GetReservationReturn = {
        reservations: [],
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        //check find reservation base on userId
        const reservations = await Reservation.find({ userId: userId, status: { $ne: 'D' } }).populate('facility').sort({ reserveStartTime: 1 });
        getReservationReturn.reservations = reservations;
        getReservationReturn.errorCode = 0;
        getReservationReturn.errorMessage = '';
    } catch (err) {
        getReservationReturn.errorCode = 500;
        getReservationReturn.errorMessage = 'Error Occurs';
    }
    return getReservationReturn;
}

export async function getAvailableTimeSlot(facilityType: string, reserveDate: Date, reservationId: string): Promise<GetAvailableFacilityReturn> {
    const getAvailableFacilityReturn: GetAvailableFacilityReturn = {
        facilityAvailableTimeSlots: [],
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        //convert reserve date
        const facilities = await Facility.find({ type: facilityType, status: 'A' });
        const facilityAvailableTimeSlots: FacilityAvailableTimeSlot[] = [];

        if (!facilities || facilities.length === 0) {
            getAvailableFacilityReturn.errorCode = 404;
            getAvailableFacilityReturn.errorMessage = 'No facility not found';
            return getAvailableFacilityReturn;
        }
        await Promise.all(facilities.map(async facility => {
            const facilityAvailableTimeSlot: FacilityAvailableTimeSlot = {
                facility: facility,
                timeSlots: []
            };
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
            const existingReservations = await Reservation.find({
                facility: facility, status: 'A',
                reserveStartTime: { $gte: reserveDateLowerBound, $lt: reserveDateUpperBound }
            });
            const reserveStartDt = new Date(facilityOpenDt.getTime());
            const reserveEndDt = new Date(facilityOpenDt.getTime());

            while (reserveStartDt < facilityCloseDt) {
                reserveEndDt.setMinutes(reserveStartDt.getMinutes() + 30);
                if (existingReservations && existingReservations.length > 0) {
                    const overLappedReservations = existingReservations.filter(existingReservation => {
                        return (checkOverlappTime(existingReservation.reserveStartTime, existingReservation.reserveEndTime,
                            new Date(reserveStartDt.getTime()), new Date(reserveEndDt.getTime()))
                            && existingReservation._id.toString() !== reservationId);
                    });
                    if (overLappedReservations && overLappedReservations.length > 0) {
                        reserveStartDt.setMinutes(reserveStartDt.getMinutes() + 30);
                        continue;
                    }
                }
                const timeSlot: TimeSlot = {
                    startDt: new Date(reserveStartDt.getTime()),
                    endDt: new Date(reserveEndDt.getTime())
                };
                facilityAvailableTimeSlot.timeSlots.push(timeSlot);
                reserveStartDt.setMinutes(reserveStartDt.getMinutes() + 30);
            }
            facilityAvailableTimeSlots.push(facilityAvailableTimeSlot);
            getAvailableFacilityReturn.facilityAvailableTimeSlots = facilityAvailableTimeSlots;
        }))

        getAvailableFacilityReturn.facilityAvailableTimeSlots = facilityAvailableTimeSlots;
        getAvailableFacilityReturn.errorCode = 0;
        getAvailableFacilityReturn.errorMessage = '';
    } catch (err) {
        getAvailableFacilityReturn.errorCode = 500;
        getAvailableFacilityReturn.errorMessage = 'Error Occurs';
    }
    return getAvailableFacilityReturn;

}

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