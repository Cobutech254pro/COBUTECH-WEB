const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const sendVerificationEmail = async (email, code, type = 'account_verification') => {
    const subject = type === 'password_reset'
        ? 'Your Cobutech Password Reset Code'
        : 'Your Cobutech Account Verification Code';
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0d0d0d; color: #ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <img src="https://raw.githubusercontent.com/Cobutech254pro/COBUTECH-WEB/main/Cobutech/Cobutechimages/cobue.jpg" alt="Cobutech Logo" width="100" />
          </td>
        </tr>
        <tr>
          <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
            <h2 style="color: #ffffff;">${subject}</h2>
            <p style="color: #cccccc;">
              ${type === 'password_reset'
                ? 'You requested to reset your Cobutech account password.'
                : 'Thank you for signing up for Cobutech!'}
            </p>
            <p style="color: #cccccc;">𝐘𝐨𝐮𝐫 𝐜𝐨𝐝𝐞 𝐢𝐬:</p>
            <div style="margin: 20px auto; padding: 15px; background-color: #262626; display: inline-block; font-size: 24px; color: #00bfff; font-weight: bold;">
              ${code}
            </div>
            <p style="color: #999999;">𝐓𝐡𝐢𝐬 𝐜𝐨𝐝𝐞 𝐰𝐢𝐥𝐥 𝐞𝐱𝐩𝐢𝐫𝐞 𝐢𝐧 2 𝐦𝐢𝐧𝐮𝐭𝐞𝐬.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 20px;">
            <a href="https://github.com/Cobutech254pro/COBUTECH-WEB/blob/main/Cobutech/Cobutechhtml/cobuc.html" style="background-color: #0077ff; padding: 10px 20px; color: #ffffff; text-decoration: none; border-radius: 5px;">
              𝐍𝐞𝐞𝐝 𝐇𝐞𝐥𝐩?
            </a>
          </td>
        </tr>
        <tr>
          <td style="background-color: #121212; padding: 30px; text-align: center;">
            <p style="color: #666666;">𝐅𝐨𝐥𝐥𝐨𝐰 𝐮𝐬:</p>
            <a href="#"><img src="https://raw.githubusercontent.com/Cobutech254pro/COBUTECH-WEB/main/Cobutech/Cobutechimages/facebook.png" alt="Facebook" width="24" style="margin: 0 5px;"></a>
            <a href="#"><img src="https://raw.githubusercontent.com/Cobutech254pro/COBUTECH-WEB/main/Cobutech/Cobutechimages/twitter.png" alt="Twitter" width="24" style="margin: 0 5px;"></a>
            <a href="#"><img src="https://raw.githubusercontent.com/Cobutech254pro/COBUTECH-WEB/main/Cobutech/Cobutechimages/instagram.png" alt="Instagram" width="24" style="margin: 0 5px;"></a>
            <p style="color: #444444; font-size: 12px; margin-top: 20px;">
              © 𝐂𝐨𝐛𝐮𝐭𝐞𝐜𝐡. 𝐄𝐦𝐩𝐨𝐰𝐞𝐫𝐢𝐧𝐠 𝐭𝐡𝐞 𝐰𝐨𝐫𝐥𝐝 𝐭𝐡𝐫𝐨𝐮𝐠𝐡 𝐝𝐢𝐠𝐢𝐭𝐚𝐥 𝐢𝐧𝐧𝐨𝐯𝐚𝐭𝐢𝐨𝐧.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
    try {
        const mailOptions = {
            from: `"𝐂𝐎𝐁𝐔-𝐓𝐄𝐂𝐇 𝐈𝐍𝐃𝐔𝐒𝐓𝐑𝐘" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        return false;
    }
};
module.exports = sendVerificationEmail;
