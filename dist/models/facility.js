"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Facility = void 0;
const mongoose_1 = require("mongoose");
const facilitySchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
exports.Facility = (0, mongoose_1.model)('facilities', facilitySchema);
