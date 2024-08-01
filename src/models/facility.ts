import { Schema, model } from 'mongoose';

const facilitySchema = new Schema({
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    openTime: {
        type: String,
        required: true
    },
    closeTime: {
        type: String,
        required: true
    },
    capacity: {
        type: Number
    },
    seatNumber: {
        type: Number
    }
},
    {
        timestamps: true,
    }
);

export const Facility = model('facilities', facilitySchema);