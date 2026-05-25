const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const upload = multer({ dest: "uploads/" });
app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Geen bestand" });
    const url = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
    res.json({ url });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/services", require("./routes/services"));
app.use("/api/market", require("./routes/market"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/company", require("./routes/companies"));
app.use("/api/users", require("./routes/users"));
app.use("/api/messages", require("./routes/messages"));

app.get("/", (req, res) => res.json({ service: "SuriJobs API", status: "running", version: "2.0.0" }));

app.use((req, res) => res.status(404).json({ error: "Endpoint niet gevonden" }));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Server fout" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 SuriJobs API v2 running at http://localhost:${PORT}`));