import { Resend } from 'resend';

export default async function sendEmail(from: string, to: string, subject: string, html: string) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        console.log(process.env.RESEND_API_KEY)
        const result = await resend.emails.send({
            from: from,
            to: to,
            subject: subject,
            html: html
        });
        console.log("Send email done ", result)
    } catch (err) {
        console.log(err)
    }
}