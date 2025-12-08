/**
 * Generate OTP verification email template
 * @param {string} name - User's name
 * @param {string} otp - 6-digit OTP code
 * @returns {string} HTML email template
 */
const getOTPEmailTemplate = (name, otp) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - CeyCanvas</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #666666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .otp-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            color: #ffffff;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .otp-code {
            font-size: 42px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .expiry-notice {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .expiry-notice p {
            margin: 0;
            color: #856404;
            font-size: 14px;
        }
        .security-notice {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        .security-notice h3 {
            color: #333333;
            font-size: 16px;
            margin: 0 0 10px 0;
        }
        .security-notice p {
            color: #666666;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            color: #6c757d;
            font-size: 14px;
            margin: 5px 0;
        }
        .brand {
            color: #667eea;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 CeyCanvas</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello ${name},</p>
            <p class="message">
                Thank you for registering as an artist on CeyCanvas! To complete your registration, 
                please verify your email address by entering the verification code below.
            </p>
            
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
            </div>

            <div class="expiry-notice">
                <p>⏰ <strong>This code will expire in 15 minutes.</strong> Please enter it soon to complete your registration.</p>
            </div>

            <p class="message">
                Enter this code in the verification window to activate your artist account and start 
                showcasing your amazing artwork to the world!
            </p>

            <div class="security-notice">
                <h3>🔒 Security Notice</h3>
                <p>
                    If you didn't request this verification code, please ignore this email. 
                    Never share this code with anyone. CeyCanvas will never ask you for this code via phone or email.
                </p>
            </div>
        </div>
        <div class="footer">
            <p>Best regards,</p>
            <p><span class="brand">The CeyCanvas Team</span></p>
            <p style="margin-top: 20px; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = {
    getOTPEmailTemplate,
};
