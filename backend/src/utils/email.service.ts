import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  sendTemporaryPassword: async (to: string, name: string, tempPassword: string) => {
    try {
      const mailOptions = {
        from: `"Reimbursement System" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Welcome to the Reimbursement System - Your Login Credentials',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Welcome, ${name}!</h2>
            <p>Your company administrator has created an account for you on the Reimbursement Management System.</p>
            <p>You can login using this email address and the temporary password below:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 18px; margin: 20px 0; display: inline-block;">
              <strong>${tempPassword}</strong>
            </div>
            <p><em>Please make sure to log in and change your password as soon as possible.</em></p>
            <p>Best regards,<br/>The Reimbursement Team</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  },
};
