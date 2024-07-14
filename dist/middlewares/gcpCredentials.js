"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getGCPCredentials() {
    var _a;
    // for Vercel, use environment variables
    return process.env.GCP_PRIVATE_KEY
        ? {
            credentials: {
                client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
                private_key: (_a = process.env.GCP_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.split(String.raw `\n`).join('\n'),
            },
            projectId: process.env.GCP_PROJECT_ID,
        }
        : {};
}
exports.default = getGCPCredentials;
;
