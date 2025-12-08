const nodemailer = require('nodemailer');


let transporter = null;

/**
 * Get or create the email transporter
 * @returns {nodemailer.Transporter} The configured transporter
 */
const getTransporter = () => {
    if (!transporter) {
        // Debug: Log SMTP configuration
        console.log('📧 Initializing Email Service...');
        console.log('SMTP_HOST:', process.env.SMTP_HOST);
        console.log('SMTP_PORT:', process.env.SMTP_PORT);
        console.log('SMTP_USER:', process.env.SMTP_USER);
        console.log('SMTP:', process.env.SMTP_USER);
        console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL);

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('❌ SMTP configuration is incomplete! Please check your .env file.');
            throw new Error('SMTP configuration is incomplete');
        }

        // Create reusable transporter object using SMTP transport
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.error('❌ SMTP connection error:', error);
            } else {
                console.log('✅ SMTP server is ready to send emails');
            }
        });
    }
    return transporter;
};

/**
 * Send welcome email to new users
 * @param {string} name - User's name
 * @param {string} email - User's email address
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendWelcomeEmail = async (name, email) => {
    try {
        const { getWelcomeEmailTemplate } = require('../templates/welcomeEmailTemplate');
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Welcome to CeyCanvas - Your Art Journey Begins! 🎨',
            html: getWelcomeEmailTemplate(name),
        };

        const emailTransporter = getTransporter();
        const info = await emailTransporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent successfully to:', email);
        console.log('Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending welcome email to:', email);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send OTP verification email to artists
 * @param {string} name - Artist's name
 * @param {string} email - Artist's email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendOTPEmail = async (name, email, otp) => {
    try {
        const { getOTPEmailTemplate } = require('../templates/otpEmailTemplate');

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Verify Your Email - CeyCanvas Artist Registration 🎨',
            html: getOTPEmailTemplate(name, otp),
        };

        const emailTransporter = getTransporter();
        const info = await emailTransporter.sendMail(mailOptions);
        console.log('✅ OTP email sent successfully to:', email);
        console.log('Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending OTP email to:', email);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendOTPEmail,
};
