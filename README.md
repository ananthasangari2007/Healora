# Healora Smart Intelligent Personal Health Assistant

GitHub Repository: https://github.com/ananthasangari2007/Healora

Healora is a clean multi-page intelligent personal health assistant website built with HTML, CSS, JavaScript, and a simple Express backend.

## Pages

- Home
- Features
- Dashboard
- Assistant
- Programs
- Contact

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Real email setup for Contact form

`POST /api/contact` can now send real emails using SMTP.

1. Install dependencies:
```bash
npm install
```
2. Create `.env` from `.env.example` and fill your values:
```bash
copy .env.example .env
```
3. Update `.env`:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- `SMTP_USER`, `SMTP_PASS`
- `CONTACT_TO_EMAIL` (where you want to receive messages)
- `CONTACT_FROM_EMAIL` (optional, defaults to `SMTP_USER`)
4. Start server:
```bash
npm start
```

### What to enter in each field

- `SMTP_USER`: the email login your SMTP provider gives you.
- `SMTP_PASS`: the SMTP password, API key, or Gmail App Password.
- `CONTACT_TO_EMAIL`: the inbox where you want to receive contact-form messages.
- `CONTACT_FROM_EMAIL`: the sender address used by the app when it sends the email.

For Gmail SMTP:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=yourgmail@gmail.com`
- `SMTP_PASS` must be a Gmail App Password, not your normal Gmail password
- `CONTACT_FROM_EMAIL` should usually be the same as `SMTP_USER`
- `CONTACT_TO_EMAIL` can be the same Gmail address or any inbox you want to receive messages in

If you do not have App Passwords enabled, Gmail SMTP usually will not work with Nodemailer using only your normal password. In that case use one of these options:

1. Turn on Google 2-Step Verification, then create an App Password and place that in `SMTP_PASS`.
2. Use another SMTP provider like Brevo, which gives you an SMTP login and key without needing your Gmail password.

### Example `.env` for Gmail

```env
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your-16-character-app-password
CONTACT_FROM_EMAIL=yourgmail@gmail.com
CONTACT_TO_EMAIL=yourgmail@gmail.com
```

### Example `.env` for Brevo

```env
PORT=3000
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-brevo-smtp-login
SMTP_PASS=your-brevo-smtp-key
CONTACT_FROM_EMAIL=your-verified-sender@example.com
CONTACT_TO_EMAIL=yourgmail@gmail.com
```

## Backend routes

- `GET /api/summary`
- `GET /api/reminders`
- `POST /api/checkin`
- `POST /api/contact`

## Deploy on Vercel

This project can be deployed to Vercel as an Express app with a `public/` folder for static files.

### Before deploying

- Push the project to GitHub
- Keep `.env` out of GitHub
- Add these Environment Variables in Vercel Project Settings:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `CONTACT_FROM_EMAIL`
  - `CONTACT_TO_EMAIL`

### Deploy steps

1. Go to `https://vercel.com/new`
2. Import your GitHub repo
3. Keep the default project settings
4. Add the environment variables listed above
5. Click `Deploy`

### Important note for Vercel

Vercel serves static files from `public/` and runs the Express app as a serverless function. Local file storage is not persistent there, so contact messages should not rely on `data/messages.json` for permanent storage. Email sending will still work if SMTP is configured.
