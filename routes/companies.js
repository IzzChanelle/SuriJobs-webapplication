// ============================================
// routes/companies.js — business profile
// ============================================

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "..", "uploads");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, "logo-" + req.user.id + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/company — my company profile
router.get("/", authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM companies WHERE user_id = ?", [req.user.id]);
        res.json(rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

// PUT /api/company — update
router.put("/", authMiddleware, async (req, res) => {
    try {
        const { company_name, branche, district, description, website, phone, email, founded_year, size } = req.body;
        await db.query(
            `INSERT INTO companies (user_id, company_name, branche, district, description, website, phone, email, founded_year, size)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                company_name=VALUES(company_name), branche=VALUES(branche), district=VALUES(district),
                description=VALUES(description), website=VALUES(website), phone=VALUES(phone),
                email=VALUES(email), founded_year=VALUES(founded_year), size=VALUES(size)`,
            [req.user.id, company_name || null, branche || null, district || null,
             description || null, website || null, phone || null, email || null,
             founded_year || null, size || null]
        );
        await db.query("UPDATE users SET has_business = TRUE WHERE id = ?", [req.user.id]);
        res.json({ message: "Bedrijf opgeslagen" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

// POST /api/company/logo
router.post("/logo", authMiddleware, upload.single("logo"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Geen logo geüpload" });
        const url = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
        await db.query(
            "INSERT INTO companies (user_id, logo_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE logo_url = VALUES(logo_url)",
            [req.user.id, url]
        );
        res.json({ logo_url: url });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

// GET /api/company/stats — dashboard stats
router.get("/stats", authMiddleware, async (req, res) => {
    try {
        // Total views across my jobs
        const [viewsRow] = await db.query(
            "SELECT COALESCE(SUM(views), 0) AS total_views FROM jobs WHERE posted_by = ?",
            [req.user.id]
        );
        // Total apps
        const [appsRow] = await db.query(
            `SELECT COUNT(*) AS total_applications
             FROM applications a JOIN jobs j ON a.job_id = j.id
             WHERE j.posted_by = ?`,
            [req.user.id]
        );
        // Active jobs
        const [jobsRow] = await db.query(
            "SELECT COUNT(*) AS active_jobs FROM jobs WHERE posted_by = ?",
            [req.user.id]
        );
        // Accepted apps
        const [acceptedRow] = await db.query(
            `SELECT COUNT(*) AS accepted
             FROM applications a JOIN jobs j ON a.job_id = j.id
             WHERE j.posted_by = ? AND a.status = 'accepted'`,
            [req.user.id]
        );

        const totalViews = viewsRow[0].total_views;
        const totalApps = appsRow[0].total_applications;
        const conversion = totalViews > 0 ? ((totalApps / totalViews) * 100).toFixed(1) : 0;

        res.json({
            total_views: totalViews,
            total_applications: totalApps,
            active_jobs: jobsRow[0].active_jobs,
            accepted: acceptedRow[0].accepted,
            conversion_rate: conversion
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

module.exports = router;
