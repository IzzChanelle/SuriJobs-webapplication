// ============================================
// routes/services.js v2
// ============================================

const express = require("express");
const db = require("../db");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", optionalAuth, async (req, res) => {
    try {
        const { search, branche, district, price } = req.query;
        let sql = "SELECT * FROM services WHERE 1=1";
        const params = [];

        if (search) {
            sql += " AND (name LIKE ? OR description LIKE ? OR branche LIKE ?)";
            const s = `%${search}%`;
            params.push(s, s, s);
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
        if (price) {
            const arr = price.split(",");
            sql += ` AND price_range IN (${arr.map(() => "?").join(",")})`;
            params.push(...arr);
        }
        sql += " ORDER BY created_at DESC";
        const [services] = await db.query(sql, params);

        if (req.user) {
            const [saved] = await db.query(
                "SELECT item_id FROM saved_items WHERE user_id = ? AND item_type = 'service'",
                [req.user.id]
            );
            const set = new Set(saved.map(s => s.item_id));
            services.forEach(s => { s.is_saved = set.has(s.id); });
        }
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        await db.query("UPDATE services SET views = views + 1 WHERE id = ?", [req.params.id]);
        const [rows] = await db.query("SELECT * FROM services WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Niet gevonden" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, description, branche, district, price_range, image_url, contact } = req.body;
        if (!name) return res.status(400).json({ error: "Naam verplicht" });
        const [result] = await db.query(
            `INSERT INTO services (posted_by, name, description, branche, district, price_range, image_url, contact)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, name, description, branche, district, price_range, image_url, contact]
        );
        res.json({ id: result.insertId, message: "Dienst geplaatst" });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT posted_by FROM services WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Niet gevonden" });
        if (rows[0].posted_by !== req.user.id) return res.status(403).json({ error: "Niet toegestaan" });
        await db.query("DELETE FROM services WHERE id = ?", [req.params.id]);
        res.json({ message: "Verwijderd" });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

module.exports = router;
