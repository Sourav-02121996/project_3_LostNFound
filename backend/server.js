import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import { fileURLToPath } from "url";

import userRoutes from "./routes/users.js";
import itemRoutes from "./routes/items.js";
import notificationRoutes from "./routes/notifications.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.join(__dirname, "../.env"),
  path.join(__dirname, ".env"),
];
const envPath = envPaths.find((candidate) => fs.existsSync(candidate));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/notifications", notificationRoutes);

const frontendBuildPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.use((req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/uploads") ||
      req.path === "/health"
    ) {
      return next();
    }

    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size too large. Maximum size is 5MB." });
    }
    return res
      .status(400)
      .json({ message: err.message || "File upload error." });
  }

  res.status(500).json({ message: "Internal server error." });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
