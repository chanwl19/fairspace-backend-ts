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
//import { Resend } from 'resend';
const nodemailer_1 = __importDefault(require("nodemailer"));
// export default async function sendEmail(from: string, to: string, subject: string, html: string) {
//     try {
//         const resend = new Resend(process.env.RESEND_API_KEY);
//         console.log(process.env.RESEND_API_KEY)
//         const result = await resend.emails.send({
//             from: from,
//             to: to,
//             subject: subject,
//             html: html
//         });
//     } catch (err) {
//         console.log(err)
//     }
// }
function sendEmail(from, to, subject, html) {
    return __awaiter(this, void 0, void 0, function* () {
        let transporter;
        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };
        try {
            transporter = nodemailer_1.default.createTransport({
                service: process.env.MAIL_HOST,
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD
                }
            });
            console.log("Create transporter");
        }
        catch (err) {
            console.log('transporter Error ', err);
            return false;
        }
        try {
            const sendEmail = yield transporter.sendMail(mailOptions);
            console.log('Email sent: ', sendEmail);
            return true;
        }
        catch (error) {
            console.log('send email error', error);
            return false;
        }
        // transporter.sendMail(mailOptions, (error, info)=> {
        //     if (error) {
        //         console.log('send email error', error);
        //         return false;
        //     } else {
        //         console.log('Email sent: ' + info.response);
        //         return true;
        //     }
        // });
    });
}
exports.default = sendEmail;
