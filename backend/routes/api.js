const express = require("express");
const {
  schedule,
  generateRandomTraffic,
  SIMULATION_MODES,
} = require("../algorithm/priorityScheduler");
const { saveSimulation, fetchHistory, clearHistory } = require("../database/db");

const router = express.Router();

const USERS = {
  admin: { password: "admin123", role: "Admin", name: "System Admin" },
  operator: { password: "operator123", role: "Traffic Operator", name: "Traffic Operator" },
};

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = USERS[username?.toLowerCase()];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  res.json({
    success: true,
    user: { username: username.toLowerCase(), role: user.role, name: user.name },
  });
});

router.get("/modes", (_req, res) => {
  const modes = Object.entries(SIMULATION_MODES).map(([id, m]) => ({
    id,
    label: m.label,
    description: m.description,
  }));
  res.json({ success: true, modes });
});

router.post("/simulate", (req, res) => {
  try {
    const { lanes, mode, agingCycles } = req.body;

    if (!lanes || typeof lanes !== "object") {
      return res.status(400).json({ error: "Missing lanes data. Expected { north, south, east, west }." });
    }

    const result = schedule(lanes, { mode: mode || "normal", agingCycles: agingCycles || 0 });
    saveSimulation(result, lanes, mode || "normal");

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history", (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const history = fetchHistory(limit);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/history", (_req, res) => {
  try {
    clearHistory();
    res.json({ success: true, message: "History cleared." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/generate-traffic", (req, res) => {
  try {
    const mode = req.query.mode || "normal";
    const lanes = generateRandomTraffic(mode);
    res.json({ success: true, lanes, mode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/health", (_req, res) => {
  res.json({ status: "ok", algorithm: "Priority Scheduling", modes: Object.keys(SIMULATION_MODES) });
});

module.exports = router;
