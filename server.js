const express = require("express");
const fs = require("fs/promises");
const http = require("http");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const messagesPath = path.join(__dirname, "data", "messages.json");

const smtpPort = Number(process.env.SMTP_PORT || 587);
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/summary", (_req, res) => {
  res.json({
    heartRate: 72,
    waterIntake: 2.4,
    steps: 6840,
    sleepHours: 7.8,
    highlights: [
      { title: "Recovery balance", detail: "Sleep and hydration are in a healthy range for today." },
      { title: "Movement goal", detail: "A short evening walk will comfortably push you past 7,500 steps." },
      { title: "Stress note", detail: "A two-minute breathing break is recommended before your next task block." }
    ]
  });
});

app.get("/api/reminders", (_req, res) => {
  res.json([
    { time: "08:30", title: "Morning medication", note: "Take after breakfast with water." },
    { time: "13:00", title: "Hydration reset", note: "Drink one glass of water and stretch for two minutes." },
    { time: "21:30", title: "Sleep preparation", note: "Reduce screen time and start a calm night routine." }
  ]);
});

app.post("/api/checkin", (req, res) => {
  const { name, energy, stress, sleep, hydration } = req.body;

  const recommendations = {
    focus: "Maintain a calm, steady routine today.",
    nextStep: "Start with water, light movement, and one priority task.",
    encouragement: "Small consistent actions are enough for meaningful progress."
  };

  if (stress === "high" || sleep === "poor") {
    recommendations.focus = "Reduce overload and support recovery first.";
    recommendations.nextStep = "Choose a lighter schedule, add a breathing break, and avoid skipping meals.";
  } else if (energy === "high" && hydration === "great") {
    recommendations.focus = "Use your stronger energy for a productive and active day.";
    recommendations.nextStep = "Protect momentum with movement, hydration, and a steady meal schedule.";
  } else if (hydration === "low") {
    recommendations.focus = "Rebuild hydration and maintain stable energy.";
    recommendations.nextStep = "Drink water now and pair it with a short reset before your next activity.";
  }

  res.json({
    greeting: `Hello ${name}, here is your Healora guidance.`,
    message: `Your check-in shows energy is ${energy}, stress is ${stress}, sleep was ${sleep}, and hydration is ${hydration}.`,
    ...recommendations
  });
});

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      status: "Missing information",
      message: "Please fill in your name, email, and message."
    });
  }

  const entry = {
    id: Date.now(),
    name,
    email,
    message,
    receivedAt: new Date().toISOString()
  };

  try {
    const toAddress = process.env.CONTACT_TO_EMAIL;
    const fromAddress = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER;
    const missingConfig = [
      ["SMTP_HOST", process.env.SMTP_HOST],
      ["SMTP_PORT", process.env.SMTP_PORT],
      ["SMTP_SECURE", process.env.SMTP_SECURE],
      ["SMTP_USER", process.env.SMTP_USER],
      ["SMTP_PASS", process.env.SMTP_PASS],
      ["CONTACT_FROM_EMAIL", process.env.CONTACT_FROM_EMAIL],
      ["CONTACT_TO_EMAIL", toAddress]
    ].filter(([, value]) => !value).map(([key]) => key);

    if (missingConfig.length > 0) {
      return res.status(500).json({
        status: "Email not configured",
        message: process.env.VERCEL
          ? `Email is not configured on this Vercel deployment yet. Go to Project Settings -> Environment Variables, add ${missingConfig.join(", ")}, save, and redeploy.`
          : `Email is not configured locally yet. Add ${missingConfig.join(", ")} to your .env file and restart the server.`
      });
    }

    await mailTransporter.sendMail({
      from: fromAddress,
      to: toAddress,
      replyTo: email,
      subject: `Healora contact from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message
      ].join("\n"),
      html: `
        <h2>New Healora Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `
    });

    try {
      const raw = await fs.readFile(messagesPath, "utf8");
      const items = JSON.parse(raw);
      items.push(entry);
      await fs.writeFile(messagesPath, JSON.stringify(items, null, 2));
    } catch (storageError) {
      console.warn("Local message storage skipped:", storageError.message);
    }
  } catch (error) {
    console.error("Contact send failed:", error);
    const smtpHint = error && error.code === "EAUTH";
    const providerName = String(process.env.SMTP_HOST || "").includes("brevo")
      ? "Brevo"
      : String(process.env.SMTP_HOST || "").includes("gmail")
        ? "Gmail"
        : "your SMTP provider";
    const smtpResponse = String(error?.response || "").trim();
    const sendHint =
      error && (error.code === "EENVELOPE" || smtpResponse.includes("sender") || smtpResponse.includes("Sender"));

    return res.status(500).json({
      status: "Message failed",
      message: smtpHint
        ? `SMTP login failed for ${providerName}. Check SMTP_USER and SMTP_PASS in your .env file.`
        : sendHint
          ? `Email send failed. Check that CONTACT_FROM_EMAIL is a valid sender verified in ${providerName}.${smtpResponse ? ` Server response: ${smtpResponse}` : ""}`
          : `We could not send your email right now. Please check SMTP configuration and try again.${smtpResponse ? ` Server response: ${smtpResponse}` : ""}`
    });
  }

  return res.json({
    status: "Message sent successfully",
    message: "Your inquiry was emailed to the Healora team and saved in local project data."
  });
});

const startServer = (port) => {
  const server = http.createServer(app);

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${port} is busy. Trying port ${port + 1}...`);
      startServer(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, () => {
    console.log(`Healora server is running on http://localhost:${port}`);
  });
};

if (require.main === module) {
  startServer(DEFAULT_PORT);
}

module.exports = app;
