require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const main = async () => {
  try {
    await transporter.verify();
    console.log("SMTP verification succeeded.");
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT || 587}`);
    console.log(`SMTP user: ${process.env.SMTP_USER}`);
  } catch (error) {
    console.error("SMTP verification failed.");
    console.error(`Code: ${error.code || "unknown"}`);
    console.error(`Message: ${error.message || "unknown"}`);
    if (error.response) {
      console.error(`Server response: ${error.response}`);
    }

    if (error.code === "EAUTH") {
      console.error(
        "Hint: For Brevo, SMTP_USER must be your Brevo SMTP login email and SMTP_PASS must be your Brevo SMTP key."
      );
      console.error(
        "Do not use your Gmail password, your Brevo account password, or a Brevo API key here."
      );
    }
  }
};

main();
