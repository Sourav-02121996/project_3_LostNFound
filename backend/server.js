const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables from the project root or backend folder
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

const express = require("express");
const cors = require("cors");

// Import routes
const userRoutes = require("./routes/users");
const itemRoutes = require("./routes/items");
const notificationRoutes = require("./routes/notifications");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/notifications", notificationRoutes);

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Central error handler to avoid leaking stack traces
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
