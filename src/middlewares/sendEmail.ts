//import { Resend } from 'resend';
import nodemailer from 'nodemailer';

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

export default async function sendEmail(from: string, to: string, subject: string, html: string): Promise<boolean> {
    
    let transporter;
    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html
    };

    try {
        transporter = nodemailer.createTransport({
            service: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });
        console.log("Create transporter")
    } catch (err) {
        console.log('transporter Error ', err);
        return false;
    }

    try {
        const sendEmail = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' , sendEmail);
        return true;
    } catch (error) {
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
    
}