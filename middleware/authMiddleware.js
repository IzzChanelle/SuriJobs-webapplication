const jwt = require("jsonwebtoken");
require("dotenv").config();

function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Geen token aanwezig" });
    }
    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Ongeldig of verlopen token" });
    }
}

function optionalAuth(req, res, next) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
        try {
            const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {}
    }
    next();
}

module.exports = { authMiddleware, optionalAuth };