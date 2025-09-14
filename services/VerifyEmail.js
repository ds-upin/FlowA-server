const nodemailer = require('nodemailer');

const verifySendEmail = async (to, name, username, code) => {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Test-FlowA By Divyanshu" <${process.env.MAIL_USER}>`,
            to: to,
            subject: "Signup Verification Code (Testing Purpose Only)",
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Hi ${name}!</h2>
                    <p>Thank you for creating an account. Your username is <strong>${username}</strong>.</p>
                    <p>Your verification code is:</p>
                    <h1 style="color: #2c3e50;">${code}</h1>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
    } catch (err) {
        console.error('Failed to send verification email:', err);
        throw err; 
    }
};

module.exports = verifySendEmail;
