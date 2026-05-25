const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

db.getConnection()
    .then(conn => {
        console.log("✅ MySQL connected to database:", process.env.DB_NAME);
        conn.release();
    })
    .catch(err => {
        console.error("❌ MySQL connection failed:", err.message);
    });

module.exports = db;