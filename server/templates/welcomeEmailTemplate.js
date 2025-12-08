const getWelcomeEmailTemplate = (name) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CeyCanvas</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                                CeyCanvas
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 14px; letter-spacing: 0.5px;">
                                Where Art Meets Passion
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                                Welcome to CeyCanvas, ${name}! 🎨
                            </h2>
                            
                            <p style="margin: 0 0 15px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                We're thrilled to have you join our vibrant community of art enthusiasts and collectors!
                            </p>
                            
                            <p style="margin: 0 0 15px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                CeyCanvas is your gateway to discovering and acquiring stunning original artworks from talented artists around the world. Whether you're looking to start your collection or add to it, you're in the right place.
                            </p>
                            
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px;">
                                <h3 style="margin: 0 0 10px 0; color: #333333; font-size: 18px; font-weight: 600;">
                                    What You Can Do:
                                </h3>
                                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                                    <li>Browse our curated collection of original artworks</li>
                                    <li>Connect with talented artists</li>
                                    <li>Add pieces to your wishlist</li>
                                    <li>Securely purchase art you love</li>
                                    <li>Track your orders and collection</li>
                                </ul>
                            </div>
                            
                            <p style="margin: 0 0 25px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                Ready to explore? Start browsing our collection and find the perfect piece that speaks to you.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="https://ceycanvas.com" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">
                                            Explore Artworks
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                Need help? Contact us at 
                                <a href="mailto:support@ceycanvas.com" style="color: #667eea; text-decoration: none;">support@ceycanvas.com</a>
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} CeyCanvas. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

module.exports = { getWelcomeEmailTemplate };
