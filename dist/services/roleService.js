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
exports.getRoles = void 0;
const role_1 = require("../models/role");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        const roleReturn = {
            roles: [],
            errorCode: 500,
            errorMessage: 'Error Occurs'
        };
        try {
            const roles = yield role_1.Role.find();
            roleReturn.roles = roles;
            roleReturn.errorCode = 0;
            roleReturn.errorMessage = "";
        }
        catch (_a) {
            roleReturn.errorCode = 500;
            roleReturn.errorMessage = 'Error Occurs';
        }
        return roleReturn;
    });
}
exports.getRoles = getRoles;
