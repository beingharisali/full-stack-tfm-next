const express = require("express");
const db = require("./config/db");
const app = express();

db();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express backend!");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
