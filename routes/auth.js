// ============================================
// routes/auth.js — Authentication v2
// ============================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const db = require("../db");
const { sendVerificationEmail, sendResetEmail } = require("../mailer");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

// POST /api/auth/register — accepts account_type
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, account_type } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: "Vul alle velden in" });
        if (password.length < 6) return res.status(400).json({ error: "Wachtwoord min. 6 tekens" });

        const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) return res.status(400).json({ error: "Email is al geregistreerd" });

        const hash = await bcrypt.hash(password, 10);
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const mode = account_type === "business" ? "business" : "individual";
        const hasBusiness = account_type === "business";

        const [result] = await db.query(
            "INSERT INTO users (name, email, password, verify_token, active_mode, has_business) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, hash, verifyToken, mode, hasBusiness]
        );

        await db.query("INSERT INTO profiles (user_id) VALUES (?)", [result.insertId]);
        if (hasBusiness) {
            await db.query("INSERT INTO companies (user_id, company_name) VALUES (?, ?)", [result.insertId, name]);
        }

        try {
            await sendVerificationEmail(email, verifyToken);
        } catch (e) { console.error("Mail failed:", e.message); }

        res.json({ message: "Account aangemaakt! Check je email.", userId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

// GET /api/auth/verify/:token
router.get("/verify/:token", async (req, res) => {
    try {
        const [users] = await db.query("SELECT id FROM users WHERE verify_token = ?", [req.params.token]);
        if (users.length === 0) return res.redirect(`${process.env.FRONTEND_URL}/login.html?verified=failed`);

        await db.query("UPDATE users SET verified = TRUE, verify_token = NULL WHERE id = ?", [users[0].id]);
        await db.query(
            "INSERT INTO notifications (user_id, type, title, body) VALUES (?, 'system', ?, ?)",
            [users[0].id, "Welkom bij SuriJobs!", "Je account is geactiveerd."]
        );
        res.redirect(`${process.env.FRONTEND_URL}/login.html?verified=success`);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Vul alle velden in" });

        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(400).json({ error: "Email of wachtwoord onjuist" });
        const user = users[0];
        if (!user.password) return res.status(400).json({ error: "Dit account gebruikt Google login" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Email of wachtwoord onjuist" });
        if (!user.verified) return res.status(400).json({ error: "Bevestig eerst je email" });

        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user.id, name: user.name, email: user.email, photo: user.photo,
                active_mode: user.active_mode, has_business: !!user.has_business
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

// POST /api/auth/google
router.post("/google", async (req, res) => {
    try {
        const { credential, account_type } = req.body;
        if (!credential) return res.status(400).json({ error: "Geen Google credential" });

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { sub: googleId, email, name, picture } = ticket.getPayload();

        let [users] = await db.query("SELECT * FROM users WHERE google_id = ? OR email = ?", [googleId, email]);
        let user;
        if (users.length === 0) {
            const mode = account_type === "business" ? "business" : "individual";
            const hasBusiness = account_type === "business";
            const [result] = await db.query(
                "INSERT INTO users (name, email, google_id, verified, photo, active_mode, has_business) VALUES (?, ?, ?, TRUE, ?, ?, ?)",
                [name, email, googleId, picture, mode, hasBusiness]
            );
            await db.query("INSERT INTO profiles (user_id) VALUES (?)", [result.insertId]);
            if (hasBusiness) await db.query("INSERT INTO companies (user_id, company_name) VALUES (?, ?)", [result.insertId, name]);
            await db.query(
                "INSERT INTO notifications (user_id, type, title, body) VALUES (?, 'system', ?, ?)",
                [result.insertId, "Welkom bij SuriJobs!", "Je account is aangemaakt via Google."]
            );
            user = { id: result.insertId, name, email, photo: picture, active_mode: mode, has_business: hasBusiness };
        } else {
            user = users[0];
            if (!user.google_id) {
                await db.query("UPDATE users SET google_id = ?, verified = TRUE WHERE id = ?", [googleId, user.id]);
            }
        }

        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user.id, name: user.name, email: user.email, photo: user.photo,
                active_mode: user.active_mode, has_business: !!user.has_business
            }
        });
    } catch (err) {
        console.error("Google login error:", err);
        res.status(500).json({ error: "Google login mislukt" });
    }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is verplicht" });

        const [users] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.json({ message: "Als email bestaat, is reset link verstuurd" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000);
        await db.query("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?", [resetToken, expires, users[0].id]);
        await sendResetEmail(email, resetToken);
        res.json({ message: "Als email bestaat, is reset link verstuurd" });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: "Vul alles in" });
        if (password.length < 6) return res.status(400).json({ error: "Min. 6 tekens" });

        const [users] = await db.query("SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()", [token]);
        if (users.length === 0) return res.status(400).json({ error: "Ongeldige of verlopen token" });

        const hash = await bcrypt.hash(password, 10);
        await db.query("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?", [hash, users[0].id]);
        res.json({ message: "Wachtwoord gereset. Log nu in." });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, name, email, photo, verified, active_mode, has_business FROM users WHERE id = ?",
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ error: "Niet gevonden" });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

// POST /api/auth/mode — switch between individual/business
router.post("/mode", authMiddleware, async (req, res) => {
    try {
        const { mode } = req.body;
        if (!["individual", "business"].includes(mode)) return res.status(400).json({ error: "Ongeldig" });

        // If switching to business but doesn't have one yet, create empty company
        if (mode === "business") {
            const [comps] = await db.query("SELECT user_id FROM companies WHERE user_id = ?", [req.user.id]);
            if (comps.length === 0) {
                await db.query("INSERT INTO companies (user_id, company_name) VALUES (?, ?)", [req.user.id, req.user.name]);
            }
            await db.query("UPDATE users SET active_mode = ?, has_business = TRUE WHERE id = ?", [mode, req.user.id]);
        } else {
            await db.query("UPDATE users SET active_mode = ? WHERE id = ?", [mode, req.user.id]);
        }
        res.json({ mode });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

module.exports = router;
