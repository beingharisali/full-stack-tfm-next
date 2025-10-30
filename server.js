const express = require("express");
const db = require("./config/db");
const dotenv = require("dotenv");

const { notFound, globalErrorHandler } = require("./middlewares/errorHandler");

dotenv.config();
const app = express();

db();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express backend!");
});

app.use(notFound);

app.use(globalErrorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
