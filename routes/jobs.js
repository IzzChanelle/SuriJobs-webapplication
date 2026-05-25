// ============================================
// routes/jobs.js v2 — with views tracking
// ============================================

const express = require("express");
const db = require("../db");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/jobs
router.get("/", optionalAuth, async (req, res) => {
    try {
        const { search, branche, district, hours, experience_level } = req.query;
        let sql = "SELECT * FROM jobs WHERE 1=1";
        const params = [];

        if (search) {
            sql += " AND (company LIKE ? OR title LIKE ? OR description LIKE ? OR branche LIKE ?)";
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }
        if (branche) {
            const arr = branche.split(",");
            sql += ` AND branche IN (${arr.map(() => "?").join(",")})`;
            params.push(...arr);
        }
        if (district) {
            const arr = district.split(",");
            sql += ` AND district IN (${arr.map(() => "?").join(",")})`;
            params.push(...arr);
        }
        if (hours) {
            const arr = hours.split(",");
            sql += ` AND hours IN (${arr.map(() => "?").join(",")})`;
            params.push(...arr);
        }
        if (experience_level) {
            const arr = experience_level.split(",");
            sql += ` AND experience_level IN (${arr.map(() => "?").join(",")})`;
            params.push(...arr);
        }
        sql += " ORDER BY created_at DESC";

        const [jobs] = await db.query(sql, params);

        if (req.user) {
            const [saved] = await db.query(
                "SELECT item_id FROM saved_items WHERE user_id = ? AND item_type = 'job'",
                [req.user.id]
            );
            const set = new Set(saved.map(s => s.item_id));
            jobs.forEach(j => { j.is_saved = set.has(j.id); });
        }
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

// POST /api/jobs — create (business mode)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { company, title, description, branche, district, hours, experience_level, salary, image_url } = req.body;
        if (!title || !branche) return res.status(400).json({ error: "Titel en branche verplicht" });

        // If business mode, use company name from companies table
        let companyName = company;
        if (!companyName) {
            const [comps] = await db.query("SELECT company_name FROM companies WHERE user_id = ?", [req.user.id]);
            companyName = comps[0]?.company_name || req.user.name;
        }

        const [result] = await db.query(
            `INSERT INTO jobs (posted_by, company, title, description, branche, district, hours, experience_level, salary, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, companyName, title, description, branche, district, hours, experience_level, salary, image_url]
        );
        res.json({ id: result.insertId, message: "Vacature geplaatst" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

// POST /api/jobs/:id/apply
router.post("/:id/apply", authMiddleware, async (req, res) => {
    try {
        const jobId = req.params.id;
        const { message } = req.body;
        const [jobs] = await db.query("SELECT id, company, title, posted_by FROM jobs WHERE id = ?", [jobId]);
        if (jobs.length === 0) return res.status(404).json({ error: "Niet gevonden" });

        await db.query(
            "INSERT INTO applications (user_id, job_id, message) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE message = VALUES(message)",
            [req.user.id, jobId, message || null]
        );

        await db.query(
            "INSERT INTO notifications (user_id, type, title, body) VALUES (?, 'system', ?, ?)",
            [req.user.id, "Sollicitatie verstuurd", `Je hebt gesolliciteerd op ${jobs[0].title} bij ${jobs[0].company}.`]
        );

        if (jobs[0].posted_by) {
            await db.query(
                "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, 'application', ?, ?, ?)",
                [jobs[0].posted_by, "Nieuwe sollicitatie", `Iemand heeft gesolliciteerd op ${jobs[0].title}`, `dashboard.html?job=${jobId}`]
            );
        }
        res.json({ message: "Sollicitatie verstuurd!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

// GET /api/jobs/my/applications — applications I've made
router.get("/my/applications", authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, j.company, j.title, j.image_url
             FROM applications a JOIN jobs j ON a.job_id = j.id
             WHERE a.user_id = ? ORDER BY a.created_at DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

// GET /api/jobs/my/posted — jobs I posted (business)
router.get("/my/posted", authMiddleware, async (req, res) => {
    try {
        const [jobs] = await db.query(
            `SELECT j.*, COUNT(a.id) AS application_count
             FROM jobs j LEFT JOIN applications a ON a.job_id = j.id
             WHERE j.posted_by = ?
             GROUP BY j.id
             ORDER BY j.created_at DESC`,
            [req.user.id]
        );
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

// GET /api/jobs/:id/applicants — for business
router.get("/:id/applicants", authMiddleware, async (req, res) => {
    try {
        // Verify owner
        const [jobs] = await db.query("SELECT posted_by FROM jobs WHERE id = ?", [req.params.id]);
        if (jobs.length === 0 || jobs[0].posted_by !== req.user.id) {
            return res.status(403).json({ error: "Niet toegestaan" });
        }

        const [applicants] = await db.query(
            `SELECT a.id AS application_id, a.status, a.message, a.created_at,
                    u.id AS user_id, u.name, u.email, u.photo,
                    p.phone, p.district, p.bio, p.job_title, p.experience_level
             FROM applications a
             JOIN users u ON a.user_id = u.id
             LEFT JOIN profiles p ON p.user_id = u.id
             WHERE a.job_id = ?
             ORDER BY a.created_at DESC`,
            [req.params.id]
        );
        res.json(applicants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

// GET /api/jobs/:id — increment views
router.get("/:id", optionalAuth, async (req, res) => {
    try {
        await db.query("UPDATE jobs SET views = views + 1 WHERE id = ?", [req.params.id]);
        const [jobs] = await db.query("SELECT * FROM jobs WHERE id = ?", [req.params.id]);
        if (jobs.length === 0) return res.status(404).json({ error: "Niet gevonden" });
        res.json(jobs[0]);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

// PUT /api/jobs/applications/:id — update application status
router.put("/applications/:id", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        if (!["pending", "viewed", "accepted", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Ongeldige status" });
        }

        const [apps] = await db.query(
            `SELECT a.*, j.posted_by, j.title FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE a.id = ?`,
            [req.params.id]
        );
        if (apps.length === 0) return res.status(404).json({ error: "Niet gevonden" });
        if (apps[0].posted_by !== req.user.id) return res.status(403).json({ error: "Niet toegestaan" });

        await db.query("UPDATE applications SET status = ? WHERE id = ?", [status, req.params.id]);

        // Notify applicant
        const titles = {
            accepted: "Gefeliciteerd! Sollicitatie geaccepteerd",
            rejected: "Sollicitatie afgewezen",
            viewed: "Sollicitatie bekeken"
        };
        if (titles[status]) {
            const type = status === "accepted" ? "accept" : status === "rejected" ? "reject" : "system";
            await db.query(
                "INSERT INTO notifications (user_id, type, title, body) VALUES (?, ?, ?, ?)",
                [apps[0].user_id, type, titles[status], `Voor de vacature: ${apps[0].title}`]
            );
        }

        res.json({ message: "Status bijgewerkt" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

// DELETE /api/jobs/:id — delete my job
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const [jobs] = await db.query("SELECT posted_by FROM jobs WHERE id = ?", [req.params.id]);
        if (jobs.length === 0) return res.status(404).json({ error: "Niet gevonden" });
        if (jobs[0].posted_by !== req.user.id) return res.status(403).json({ error: "Niet toegestaan" });

        await db.query("DELETE FROM jobs WHERE id = ?", [req.params.id]);
        res.json({ message: "Verwijderd" });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

module.exports = router;
