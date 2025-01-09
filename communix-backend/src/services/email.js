const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    // Create a transporter object using your email provider's SMTP settings or API key
    const transporter = nodemailer.createTransport({
      // Example using Gmail:
      // service: 'gmail',
      // auth: {
      //   user: process.env.EMAIL_USER, 
      //   pass: process.env.EMAIL_PASSWORD 
      // }

      // Example using SendGrid:
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: {
        user: 'team@communix.co',
        pass: 'Communix@54' 
      }
    });
    console.log(transporter); 

    // Add Nodemailer event listeners here:
    transporter.on('idle', () => {
      console.log('Connection to GoDaddy SMTP server is idle.');
    });

    transporter.on('error', (err) => {
      console.error('Nodemailer error:', err);
    });

    // Define the email options
    const mailOptions = {
      from: 'team@communix.co', // Sender address (e.g., 'no-reply@communix.co')
      to: userEmail, 
      subject: 'Welcome to Communix!', 
      html: `<!DOCTYPE html>
  <html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Communix!</title>
  <style>
    /* General styles */
    body {
      font-family: sans-serif; 
      margin: 0;
      padding: 0;
      background-color: #f8f9fa; /* Matches your website background */
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #007bff; /* Matches your primary color */
      color: #fff;
      padding: 20px;
      text-align: center;
    }
    .content {
      background-color: #fff;
      padding: 20px;
    }
    .footer {
      background-color: #333; /* Darker color for contrast */
      color: #fff;
      text-align: center;
      padding: 10px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Communix!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Welcome to Communix! We're thrilled to have you join our growing community of students and professionals.</p>
      <p>Get ready to connect with like-minded individuals, share your knowledge, and collaborate on exciting projects.</p>
      <p><b>Stay tuned for upcoming updates</b> as we continue to add new features and improve your Communix experience.</p> 
      <p>In the meantime, you can:</p>
      <ul>
        <li>Explore our website: [Link to your website]</li>
        <li>Follow us on social media: [Links to your social media pages]</li>
      </ul>
      <p>We can't wait to see you contribute to the Communix community!</p>
      <p>Best regards,</p>
      <p>The Communix Team</p>
    </div>
    <div class="footer">
      &copy; 2024 Communix. All rights reserved.
    </div>
  </div>
</body>
</html>`
      // You can also use HTML for the email body:
      // html: `<h1>Welcome to Communix, ${userName}!</h1><p>Start exploring...</p>` 
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    // You might want to handle the error more gracefully, 
    // e.g., by logging it to an error tracking service or retrying.
  }
};

module.exports = { sendWelcomeEmail };