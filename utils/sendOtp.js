const brevo = require("@getbrevo/brevo");

const sendOtp = async (email, otp) => {
  try {
    console.log("Preparing to send OTP email to:", email);
    console.log("Generated OTP:", otp); // FIXED: No longer logging the API Key

    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Secure USB OTP Verification";
    sendSmtpEmail.sender = {
      name: "Secure USB",
      email: process.env.BREVO_SENDER_EMAIL
    };
    sendSmtpEmail.to = [
      { email: email }
    ];
    sendSmtpEmail.textContent = `Your OTP is ${otp}. It will expire in 5 minutes.`;
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial; padding:20px">
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("OTP email sent successfully");

  } catch (error) {
    console.error("Error sending OTP email:", error.response?.body || error.message);
    throw error;
  }
};

module.exports = sendOtp;