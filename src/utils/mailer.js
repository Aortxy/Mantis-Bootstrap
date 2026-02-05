const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendCredentials = async (email, { panel, user, pass }) => {
  const mailOptions = {
    from: `"Bot Hosting" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Server Credentials',
    html: `
      <h1>Your Server is Ready!</h1>
      <p>Here are your login details for the Pterodactyl Panel:</p>
      <ul>
        <li><strong>Panel URL:</strong> <a href="${panel}">${panel}</a></li>
        <li><strong>Username:</strong> ${user}</li>
        <li><strong>Password:</strong> ${pass}</li>
      </ul>
      <p>Please change your password after logging in.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendResellerCredentials = async (email, { username, password }) => {
    const mailOptions = {
      from: `"Bot Hosting" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Reseller Account Credentials',
      html: `
        <h1>Welcome to the Reseller Program!</h1>
        <p>Your reseller account has been created. You can now login to our dashboard to manage servers.</p>
        <ul>
          <li><strong>Dashboard:</strong> <a href="${process.env.APP_URL || 'http://localhost:3000'}">${process.env.APP_URL || 'http://localhost:3000'}</a></li>
          <li><strong>Username:</strong> ${username}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
      `,
    };

    return transporter.sendMail(mailOptions);
  };

module.exports = { sendCredentials, sendResellerCredentials };
