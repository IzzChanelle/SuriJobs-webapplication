// ============================================
// routes/market.js v2
// ============================================

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../db");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "..", "uploads");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Alleen afbeeldingen"), false);
    }
});

router.get("/", optionalAuth, async (req, res) => {
    try {
        const { search, category, condition, district } = req.query;
        let sql = `SELECT m.*, u.name AS user_name, u.photo AS user_photo
                   FROM market_items m JOIN users u ON m.user_id = u.id WHERE 1=1`;
        const params = [];
        if (search) {
            sql += " AND (m.name LIKE ? OR m.description LIKE ?)";
            const s = `%${search}%`;
            params.push(s, s);
        }
        if (category) {
            const arr = category.split(",");
            sql += ` AND m.category IN (${arr.map(() => "?").join(",")})`;
            params.push(...arr);
        }
        if (condition) {
            const arr = condition.split(",");
            sql += ` AND m.condition_type IN (${arr.map(() => "?").join(",")})`;
            params.push(...arr);
        }
        if (district) {
            const arr = district.split(",");
            sql += ` AND m.district IN (${arr.map(() => "?").join(",")})`;
            params.push(...arr);
        }
        sql += " ORDER BY m.created_at DESC";
        const [items] = await db.query(sql, params);

        if (req.user) {
            const [saved] = await db.query(
                "SELECT item_id FROM saved_items WHERE user_id = ? AND item_type = 'market'",
                [req.user.id]
            );
            const set = new Set(saved.map(s => s.item_id));
            items.forEach(i => { i.is_saved = set.has(i.id); });
        }
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
    try {
        const { name, price, description, category, condition_type, district, image_url } = req.body;
        if (!name || !price) return res.status(400).json({ error: "Naam en prijs verplicht" });

        let finalImage = image_url || null;
        if (req.file) finalImage = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;

        const [result] = await db.query(
            `INSERT INTO market_items (user_id, name, description, price, category, condition_type, district, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, name, description, price, category, condition_type, district, finalImage]
        );
        res.json({ id: result.insertId, message: "Product geplaatst" });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const [items] = await db.query("SELECT user_id FROM market_items WHERE id = ?", [req.params.id]);
        if (items.length === 0) return res.status(404).json({ error: "Niet gevonden" });
        if (items[0].user_id !== req.user.id) return res.status(403).json({ error: "Niet toegestaan" });
        await db.query("DELETE FROM market_items WHERE id = ?", [req.params.id]);
        res.json({ message: "Verwijderd" });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.get("/my/items", authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM market_items WHERE user_id = ? ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

module.exports = router;
