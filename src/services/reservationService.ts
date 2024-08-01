import mongoose from 'mongoose';
import { Reservation } from '../models/reservation';
import { Facility } from '../models/facility';
import { checkSameDate } from '../utils/dateUtils';
import { User } from '../models/user';

interface BasicReturn {
    errorCode: number;
    errorMessage: string;
}

export async function createReservation(userId: string, facilityId: string, startDate: string, endDate: string, sess: mongoose.mongo.ClientSession | undefined = undefined): Promise<BasicReturn> {

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
        //check if start date and end date valid
        let startDt;
        let endDt;
        try {
            startDt = new Date(startDate);
            endDt = new Date(endDate);
        } catch {
            createReservationReturn.errorCode = 500;
            createReservationReturn.errorMessage = "Date is not valid";
            return createReservationReturn;
        }

        if (startDt >= endDt) {
            createReservationReturn.errorCode = 500;
            createReservationReturn.errorMessage = "Start date must be before end date";
            return createReservationReturn;
        }

        if (!checkSameDate(startDt, endDt)) {
            createReservationReturn.errorCode = 500;
            createReservationReturn.errorMessage = "Only same date reservatio is allowed";
            return createReservationReturn;
        };

        //Check if user exists
        const user = await User.findById(userId);
        if (!user) {
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
        const facilityOpenDt = new Date(startDate);
        const facilityCloseDt = new Date(endDt);
        facilityOpenDt.setHours(openTimeArr[0], openTimeArr[1], 0, 0);
        facilityCloseDt.setHours(closeTimeArr[0], closeTimeArr[1], 0, 0);

        if (startDt < facilityOpenDt || endDt > facilityCloseDt) {
            createReservationReturn.errorCode = 404;
            createReservationReturn.errorMessage = "Facility is closed during the period";
            return createReservationReturn;
        }

        const isOverlapped = await checkOverlapReservation(facilityId.toString(), startDt, endDt, (sess || undefined));
        if (isOverlapped) {
            createReservationReturn.errorCode = 409;
            createReservationReturn.errorMessage = "The timeslot is already reserved";
            return createReservationReturn;
        }

        //create reservation if not exist
        const newReservations = await Reservation.create([{
            reserveStartTime: startDt,
            reserveEndTime: endDt,
            status: 'A',
            facility: facility,
            user: user
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

export async function updateReservation(userId: string, reservationId: string, facilityId: string, startDt: string, endDt: string, status: string): Promise<BasicReturn> {
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
        const user = await User.findById(userId);
        if (!user) {
            updateReservationReturn.errorCode = 404;
            updateReservationReturn.errorMessage = "User not found";
            return updateReservationReturn;
        }

        reservation.status = status;
        await reservation.save({ session: sess });

        if (status === 'D') {
            const createReservationResponse = await createReservation(userId, facilityId, startDt, endDt, sess);
            console.log('createReservationResponse ', createReservationResponse)
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

        await sess.commitTransaction();
    } catch (err) {
        console.log('err ', err)
        updateReservationReturn.errorCode = 500;
        updateReservationReturn.errorMessage = 'Error Occurs';
    } finally {
        sess.endSession();
    }
    return updateReservationReturn;
}

export async function checkOverlapReservation(facilityId: string, reserveStartDt: Date, reserveEndDt: Date, sess: mongoose.mongo.ClientSession | undefined = undefined): Promise<boolean> {

    if (!sess) {
        return true;
    }
    const duplicateReservations = await Reservation.find({
        $or: [
            { facility: facilityId, status: 'A', reserveStartTime: { $lte: reserveStartDt }, reserveEndTime: { $gte: reserveEndDt } }, //case 1 new reservation is in the middle of an existing reservation
            { facility: facilityId, status: 'A', reserveStartTime: { $gte: reserveStartDt }, reserveEndTime: { $lte: reserveEndDt } }, //case 2 new reservation covers an existing reservation
            { facility: facilityId, status: 'A', reserveStartTime: { $gt: reserveStartDt, $lt: reserveEndDt } }, // case 3 new reservation end date overlaps with an exsiting reservation
            { facility: facilityId, status: 'A', reserveEndTime: { $gt: reserveStartDt, $lt: reserveEndDt } } // case 4 new reservation start date overlaps with an exsiting reservation
        ]
    }, null, { session: sess })

    if (duplicateReservations && duplicateReservations.length > 0) {
        return true;
    }
    return false;
}