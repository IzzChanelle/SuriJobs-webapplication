const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const { filter, limit = 50 } = req.query;
        let sql = "SELECT * FROM notifications WHERE user_id = ?";
        const params = [req.user.id];
        if (filter === "unread") sql += " AND is_read = FALSE";
        else if (filter === "important") sql += " AND important = TRUE";
        sql += " ORDER BY created_at DESC LIMIT ?";
        params.push(parseInt(limit));
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.get("/unread-count", authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE", [req.user.id]);
        res.json({ count: rows[0].count });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.put("/:id/read", authMiddleware, async (req, res) => {
    try {
        await db.query("UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

router.put("/read-all", authMiddleware, async (req, res) => {
    try {
        await db.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE", [req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server fout" });
    }
});

module.exports = router;