const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendBookingConfirmation(userEmail, bookingDetails) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Booking Confirmation - WanderLust',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #fe424d;">Booking Confirmed!</h2>
          <p>Your booking has been confirmed for:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${bookingDetails.listingTitle}</h3>
            <p><strong>Check-in:</strong> ${bookingDetails.checkin}</p>
            <p><strong>Check-out:</strong> ${bookingDetails.checkout}</p>
            <p><strong>Guests:</strong> ${bookingDetails.guests}</p>
            <p><strong>Total Amount:</strong> ₹${bookingDetails.totalPrice}</p>
          </div>
          <p>Thank you for choosing WanderLust!</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(userEmail, username) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to WanderLust!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #fe424d;">Welcome to WanderLust, ${username}!</h2>
          <p>Thank you for joining our community of travelers and hosts.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Get Started:</h3>
            <ul>
              <li>Browse amazing listings</li>
              <li>Create your own listing</li>
              <li>Connect with fellow travelers</li>
              <li>Leave reviews and build your reputation</li>
            </ul>
          </div>
          <p>Happy traveling!</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordReset(userEmail, resetToken) {
    const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset - WanderLust',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #fe424d;">Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #fe424d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();