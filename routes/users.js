const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/search", authMiddleware, async (req, res) => {
    try {
        const { q, role, district } = req.query;
        let sql = `SELECT u.id, u.name, u.email, u.photo, u.active_mode, u.has_business,
                          p.district, p.bio, p.job_title
                   FROM users u LEFT JOIN profiles p ON p.user_id = u.id
                   WHERE u.id != ?`;
        const params = [req.user.id];
        if (q) {
            sql += " AND (u.name LIKE ? OR p.job_title LIKE ?)";
            const like = `%${q}%`;
            params.push(like, like);
        }
        if (role === "individual") sql += " AND u.active_mode = 'individual'";
        else if (role === "business") sql += " AND u.has_business = TRUE";
        if (district && district !== "alle") {
            sql += " AND p.district = ?";
            params.push(district);
        }
        sql += " ORDER BY u.name LIMIT 50";
        const [users] = await db.query(sql, params);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fout" });
    }
});

module.exports = router;