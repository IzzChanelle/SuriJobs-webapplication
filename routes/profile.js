// ============================================
// routes/profile.js v2
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
        cb(null, "profile-" + req.user.id + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", authMiddleware, async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, name, email, photo, verified, active_mode, has_business FROM users WHERE id = ?",
            [req.user.id]
        );
        const [profiles] = await db.query("SELECT * FROM profiles WHERE user_id = ?", [req.user.id]);
        const [skills] = await db.query("SELECT skill FROM skills WHERE user_id = ?", [req.user.id]);
        res.json({
            user: users[0] || null,
            profile: profiles[0] || null,
            skills: skills.map(s => s.skill)
        });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.put("/", authMiddleware, async (req, res) => {
    try {
        const {
            first_name, last_name, phone, age, district, bio,
            branche, work_type, experience_level,
            school, education, start_year, end_year,
            company, job_title, work_period, work_location
        } = req.body;

        await db.query(
            `UPDATE profiles SET
                first_name=?, last_name=?, phone=?, age=?, district=?, bio=?,
                branche=?, work_type=?, experience_level=?,
                school=?, education=?, start_year=?, end_year=?,
                company=?, job_title=?, work_period=?, work_location=?
             WHERE user_id = ?`,
            [
                first_name || null, last_name || null, phone || null,
                age || null, district || null, bio || null,
                branche || null, work_type || null, experience_level || null,
                school || null, education || null, start_year || null, end_year || null,
                company || null, job_title || null, work_period || null, work_location || null,
                req.user.id
            ]
        );

        if (first_name || last_name) {
            const fullName = `${first_name || ""} ${last_name || ""}`.trim();
            if (fullName) await db.query("UPDATE users SET name = ? WHERE id = ?", [fullName, req.user.id]);
        }
        res.json({ message: "Profiel opgeslagen" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

router.post("/photo", authMiddleware, upload.single("photo"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Geen foto" });
        const url = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
        await db.query("UPDATE users SET photo = ? WHERE id = ?", [url, req.user.id]);
        res.json({ photo: url });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.post("/skills", authMiddleware, async (req, res) => {
    try {
        const { skill } = req.body;
        if (!skill || !skill.trim()) return res.status(400).json({ error: "Leeg" });
        await db.query("INSERT INTO skills (user_id, skill) VALUES (?, ?)", [req.user.id, skill.trim()]);
        res.json({ message: "Toegevoegd" });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.delete("/skills/:skill", authMiddleware, async (req, res) => {
    try {
        await db.query(
            "DELETE FROM skills WHERE user_id = ? AND skill = ?",
            [req.user.id, req.params.skill]
        );
        res.json({ message: "Verwijderd" });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.get("/completion", authMiddleware, async (req, res) => {
    try {
        const [profiles] = await db.query("SELECT * FROM profiles WHERE user_id = ?", [req.user.id]);
        if (profiles.length === 0) return res.json({ percentage: 0 });
        const p = profiles[0];
        const fields = ["first_name","last_name","phone","age","district","bio","branche","work_type","experience_level","school","education","company","job_title"];
        let filled = 0;
        fields.forEach(f => { if (p[f]) filled++; });
        res.json({ percentage: Math.round((filled / fields.length) * 100) });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.post("/save", authMiddleware, async (req, res) => {
    try {
        const { item_type, item_id } = req.body;
        if (!["job", "service", "market"].includes(item_type)) return res.status(400).json({ error: "Ongeldig" });

        const [existing] = await db.query(
            "SELECT id FROM saved_items WHERE user_id = ? AND item_type = ? AND item_id = ?",
            [req.user.id, item_type, item_id]
        );
        if (existing.length > 0) {
            await db.query("DELETE FROM saved_items WHERE id = ?", [existing[0].id]);
            return res.json({ saved: false });
        } else {
            await db.query(
                "INSERT INTO saved_items (user_id, item_type, item_id) VALUES (?, ?, ?)",
                [req.user.id, item_type, item_id]
            );
            return res.json({ saved: true });
        }
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.get("/saved", authMiddleware, async (req, res) => {
    try {
        const [jobs] = await db.query(
            `SELECT j.*, 'job' AS item_type FROM jobs j
             JOIN saved_items s ON s.item_id = j.id
             WHERE s.user_id = ? AND s.item_type = 'job'`,
            [req.user.id]
        );
        const [services] = await db.query(
            `SELECT sv.*, 'service' AS item_type FROM services sv
             JOIN saved_items s ON s.item_id = sv.id
             WHERE s.user_id = ? AND s.item_type = 'service'`,
            [req.user.id]
        );
        const [market] = await db.query(
            `SELECT m.*, 'market' AS item_type FROM market_items m
             JOIN saved_items s ON s.item_id = m.id
             WHERE s.user_id = ? AND s.item_type = 'market'`,
            [req.user.id]
        );
        res.json({ jobs, services, market });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

module.exports = router;
