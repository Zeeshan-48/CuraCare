import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: port,
      secure: port === 465, // true for 465, false for other ports (like 587)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000, // 10 seconds timeout
      socketTimeout: 10000,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CuraCare <noreply@curacare.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
    // Do not crash the server/request, just return false so calling route can handle gracefully
    return false;
  }
};

export default sendEmail;
