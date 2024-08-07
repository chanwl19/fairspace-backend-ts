import mongoose from 'mongoose';
import { Facility } from '../models/facility';

interface BasicReturn {
    errorCode: number;
    errorMessage: string;
}

interface FacilitiesReturn extends BasicReturn {
    facilities: InstanceType<typeof Facility>[];
}

export async function createFacility(location: string, type: string, openTime: string, closeTime: string, capacity: number, seatNumber: number): Promise<BasicReturn> {

    const createFacilityReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        //check if facility exist
        let duplicateFacilities = [];
        if (type === 'R'){
            duplicateFacilities = await Facility.find({status: 'A', type: type, location: location });
        } else {
            duplicateFacilities = await Facility.find({ status: 'A', type: type, location: location, seatNumber: seatNumber  });
        }

        if (duplicateFacilities && duplicateFacilities.length > 0) {
            createFacilityReturn.errorCode = 409;
            createFacilityReturn.errorMessage = 'Facility already exists';
            return createFacilityReturn;
        }
        //create facility if not exist
        await Facility.create([{
            location: location,
            type: type,
            status: 'A',
            openTime: openTime,
            closeTime: closeTime,
            capacity: capacity,
            seatNumber: seatNumber
        }], {session: sess});

        createFacilityReturn.errorCode = 0;
        createFacilityReturn.errorMessage = '';
        await sess.commitTransaction();
    } catch {
        createFacilityReturn.errorCode = 500;
        createFacilityReturn.errorMessage = 'Error Occurs';
    } finally {
        sess.endSession();
    }
    return createFacilityReturn;
}

export async function updateFacility(_id: string, location: string, type: string, openTime: string, closeTime: string, capacity: number, seatNumber: number): Promise<BasicReturn> {

    const updateFacilityReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        //check if facility exist
        let facility = await Facility.findById(_id);
        
        if (!facility) {
            updateFacilityReturn.errorCode = 404;
            updateFacilityReturn.errorMessage = 'Facility cannot be found';
            return updateFacilityReturn;
        }

        let duplicateFacilities = [];
        if (type === 'R'){
            duplicateFacilities = await Facility.find({status: 'A', type: type, location: location });
        } else {
            duplicateFacilities = await Facility.find({ status: 'A', type: type, location: location, seatNumber: seatNumber  });
        }

        if (duplicateFacilities && duplicateFacilities.length > 0) {
            updateFacilityReturn.errorCode = 409;
            updateFacilityReturn.errorMessage = 'Facility already exists';
            return updateFacilityReturn;
        }

        //create facility if not exist
        if (location) facility.location = location;
        if (type) facility.type = type;
        if (openTime) facility.openTime = openTime;
        if (closeTime) facility.closeTime = closeTime;
        if (capacity && type ==='R' ) facility.capacity = capacity ;
        if (seatNumber && type ==='D' ) facility.seatNumber = seatNumber ;
        await facility.save({session: sess});

        updateFacilityReturn.errorCode = 0;
        updateFacilityReturn.errorMessage = '';
        await sess.commitTransaction();
    } catch {
        updateFacilityReturn.errorCode = 500;
        updateFacilityReturn.errorMessage = 'Error Occurs';
    } finally {
        sess.endSession();
    }
    return updateFacilityReturn;
}

export async function getFacility(): Promise<FacilitiesReturn> {

    const getFacilityReturn: FacilitiesReturn = {
        facilities: [],
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        //get all facilities 
        const facilities = await Facility.find({status: 'A'});
        getFacilityReturn.facilities = facilities;
        getFacilityReturn.errorCode = 0;
        getFacilityReturn.errorMessage = '';
    } catch {
        getFacilityReturn.errorCode = 500;
        getFacilityReturn.errorMessage = 'Error Occurs';
    } finally {
        sess.endSession();
    }
    return getFacilityReturn;
}

export async function deleteFacility(_id: string): Promise<BasicReturn> {
    const deleteFacilityReturn: BasicReturn = {
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };
    const sess = await mongoose.startSession();
    sess.startTransaction();
    try {
        //get all facilities 
        const facilities = await Facility.findByIdAndUpdate(_id, { status: "D" },{ session: sess});
        deleteFacilityReturn.errorCode = 0;
        deleteFacilityReturn.errorMessage = '';
        await sess.commitTransaction();
    } catch {
        deleteFacilityReturn.errorCode = 500;
        deleteFacilityReturn.errorMessage = 'Error Occurs';
    } finally {
        sess.endSession();
    }
    return deleteFacilityReturn;
}
