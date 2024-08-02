"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reservation = void 0;
const mongoose_1 = require("mongoose");
const reservationSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'facilities'
    },
    userId: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
});
exports.Reservation = (0, mongoose_1.model)('reservations', reservationSchema);
