const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

app.use("/legacy", express.static(path.join(__dirname, "..", "frontend")));
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

app.get("*", (_req, res) => {
  const reactIndex = path.join(__dirname, "..", "client", "dist", "index.html");
  res.sendFile(reactIndex, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
    }
  });
});

app.listen(PORT, () => {
  console.log(`Smart Traffic Light Control server running on http://localhost:${PORT}`);
  console.log("Algorithm: Priority Scheduling");
});
