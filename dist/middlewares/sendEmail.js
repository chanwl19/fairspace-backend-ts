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
Object.defineProperty(exports, "__esModule", { value: true });
const resend_1 = require("resend");
function sendEmail(from, to, subject, html) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
            console.log(process.env.RESEND_API_KEY);
            const result = yield resend.emails.send({
                from: from,
                to: to,
                subject: subject,
                html: html
            });
            console.log("Send email done ", result);
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = sendEmail;
