import { Schema, model } from 'mongoose';

const reservationSchema = new Schema({
    reserveStartTime: {
        type: Date,
        required: true
    },
    reserveEndTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    facility: {
        type: Schema.Types.ObjectId,
        ref: 'facilities'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
},
{
    timestamps: true,
    }
);

export const Reservation = model('reservations', reservationSchema);