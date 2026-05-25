const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/conversations", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const sql = `
            SELECT DISTINCT u.id, u.name, u.photo,
                (SELECT message FROM messages WHERE (from_user_id = ? AND to_user_id = u.id) OR (from_user_id = u.id AND to_user_id = ?) ORDER BY created_at DESC LIMIT 1) AS last_message,
                (SELECT created_at FROM messages WHERE (from_user_id = ? AND to_user_id = u.id) OR (from_user_id = u.id AND to_user_id = ?) ORDER BY created_at DESC LIMIT 1) AS last_message_time,
                (SELECT COUNT(*) FROM messages WHERE to_user_id = ? AND from_user_id = u.id AND is_read = FALSE) AS unread_count
            FROM messages m JOIN users u ON (u.id = m.from_user_id OR u.id = m.to_user_id)
            WHERE (m.from_user_id = ? OR m.to_user_id = ?) AND u.id != ?
            ORDER BY last_message_time DESC
        `;
        const [rows] = await db.query(sql, [userId, userId, userId, userId, userId, userId, userId, userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const currentId = req.user.id;
        const otherId = req.params.userId;
        const [rows] = await db.query(
            `SELECT * FROM messages WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?) ORDER BY created_at ASC`,
            [currentId, otherId, otherId, currentId]
        );
        await db.query(`UPDATE messages SET is_read = TRUE WHERE from_user_id = ? AND to_user_id = ? AND is_read = FALSE`, [otherId, currentId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

router.post("/:userId", authMiddleware, async (req, res) => {
    try {
        const fromId = req.user.id;
        const toId = req.params.userId;
        const { message } = req.body;
        if (!message || !message.trim()) return res.status(400).json({ error: "Bericht mag niet leeg zijn" });
        await db.query(`INSERT INTO messages (from_user_id, to_user_id, message) VALUES (?, ?, ?)`, [fromId, toId, message.trim()]);
        const [sender] = await db.query("SELECT name FROM users WHERE id = ?", [fromId]);
        await db.query(`INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, 'message', ?, ?, ?)`,
            [toId, `Nieuw bericht van ${sender[0].name}`, message.substring(0, 100), `/chat.html?user=${fromId}`]);
        res.json({ message: "Verzonden" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

module.exports = router;