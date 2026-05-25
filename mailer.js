// ============================================
// mailer.js — Nodemailer Gmail transporter
// ============================================

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify on startup
transporter.verify()
    .then(() => console.log("✅ Mailer ready"))
    .catch(err => console.error("❌ Mailer error:", err.message));

// ============================================
// Send verification email
// ============================================
async function sendVerificationEmail(toEmail, token) {
    const link = `${process.env.BACKEND_URL}/api/auth/verify/${token}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f5f5f5;">
            <div style="background: white; padding: 40px; border-radius: 12px;">
                <h1 style="margin: 0;">
                    <span style="color: #c0392b;">Suri</span><span style="color: #0ca043;">Jobs</span>
                </h1>
                <h2 style="color: #1a1a1a;">Bevestig je email adres</h2>
                <p style="color: #555; line-height: 1.6;">
                    Welkom bij SuriJobs! Klik op de knop hieronder om je email adres te bevestigen.
                </p>
                <a href="${link}" style="display: inline-block; background: #0ca043; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px;">
                    Bevestig email
                </a>
                <p style="color: #888; font-size: 13px; margin-top: 30px;">
                    Of kopieer deze link: <br>
                    <a href="${link}">${link}</a>
                </p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"SuriJobs" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Bevestig je SuriJobs account",
        html
    });
}

// ============================================
// Send password reset email
// ============================================
async function sendResetEmail(toEmail, token) {
    const link = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f5f5f5;">
            <div style="background: white; padding: 40px; border-radius: 12px;">
                <h1 style="margin: 0;">
                    <span style="color: #c0392b;">Suri</span><span style="color: #0ca043;">Jobs</span>
                </h1>
                <h2 style="color: #1a1a1a;">Wachtwoord resetten</h2>
                <p style="color: #555; line-height: 1.6;">
                    Klik op de knop hieronder om een nieuw wachtwoord in te stellen. Deze link verloopt over 1 uur.
                </p>
                <a href="${link}" style="display: inline-block; background: #c0392b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px;">
                    Wachtwoord resetten
                </a>
                <p style="color: #888; font-size: 13px; margin-top: 30px;">
                    Heb je deze niet aangevraagd? Negeer deze email.
                </p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"SuriJobs" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Reset je SuriJobs wachtwoord",
        html
    });
}

module.exports = { sendVerificationEmail, sendResetEmail };
