"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const mongoose_1 = require("mongoose");
const roleSchema = new mongoose_1.Schema({
    roleId: {
        type: Number,
        required: true
    },
    roleName: {
        type: String,
        required: true
    },
    endPoints: [{
            type: String
        }],
    pages: [{
            menu: { type: String, required: true },
            component: { type: String, required: true },
            path: { type: String, required: true }
        }]
}, {
    timestamps: true,
});
exports.Role = (0, mongoose_1.model)('roles', roleSchema);
