import express from "express";
import config from "./KaguyaSetUp/config.js";
import { log } from "./src/logger/index.js";

const app = express();

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "Shadow Bot",
    status: "running",
    message: "حديقة الظل تعمل من خلف الكواليس."
  });
});

app.listen(config.port, () => {
  log([
    { message: "[ SHADOW HEALTH ]: ", color: "purple" },
    { message: `Listening on port ${config.port}`, color: "green" }
  ]);
});
