import nodemailer from "nodemailer";

require('dotenv').config()

export default class MailUtil {

    static async sendMail(toAddress: string, bcc: string, subject: string, plainTextBody: string, htmlBody: string) {
        let mailConfig;

        if (process.env.ENVIRONMENT === 'live' || process.env.ENVIRONMENT === 'dev'){
            mailConfig = {
                host: "smtpout.secureserver.net",
                port: 465,
                secure: true,
                requireTLS: true,
                auth: {
                    user: process.env.EMAIL_ADDRESS,
                    pass: process.env.EMAIL_PASSWORD
                }
            }
        }
        else {
            mailConfig = {
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    // Generate user and password on https://ethereal.email/create and update in the below config
                    // To test nodemailer: https://nodemailer.com/smtp/testing/
                    user: 'nicholas.veum@ethereal.email',
                    pass: 'fe5KVEg9vYpAAnhzsg'
                }
            }
        }

        const transporter = nodemailer.createTransport(mailConfig);
        // send mail with defined transport object
        let info = transporter.sendMail({
            from: `"LendInfra" <no-reply@lendinfra.com>`, // sender address
            to: toAddress,// list of receivers
            bcc: bcc,
            subject: subject, // Subject line
            text: plainTextBody, // plain text body
            html: htmlBody, // html body
        }).then(info=>{
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        });
    }
}
