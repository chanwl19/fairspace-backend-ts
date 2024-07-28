import nodemailer from 'nodemailer';

export default async function sendEmail(from: string, to: string, subject: string, content: string) {
    const transporter = nodemailer.createTransport({
        service: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: content
    };

    transporter.sendMail(mailOptions, (error, info)=> {
        if (error) {
            console.log(error , " when sending email");
        } else {
            console.log("successfully send email ");
        }
    });
}