import http from "node:http";
import config from "./ShadowSetUp/config.js";
import { log } from "./src/logger/index.js";

const server = http.createServer((_req, res) => {
  res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({
    name: "Shadow Bot",
    status: "running",
    message: "حديقة الظل تعمل من خلف الكواليس."
  }));
});

server.listen(config.port, () => {
  log([
    { message: "[ SHADOW HEALTH ]: ", color: "purple" },
    { message: `Listening on port ${config.port}`, color: "green" }
  ]);
});
