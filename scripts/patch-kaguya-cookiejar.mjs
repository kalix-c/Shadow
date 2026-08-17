import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(projectRoot, "node_modules", "@trunqkj3n", "kaguya");

function writeIfChanged(relativePath, transform, label) {
  const target = path.join(packageRoot, relativePath);
  const original = fs.readFileSync(target, "utf8");
  const updated = transform(original);

  if (updated === original) {
    console.log(`[Kaguya patch] ${label}: already applied.`);
    return;
  }

  fs.writeFileSync(target, updated, "utf8");
  console.log(`[Kaguya patch] ${label}: applied.`);
}

writeIfChanged(
  "index.js",
  (source) => {
    const originalRestore = `      var str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
      jar.setCookie(str, "http://" + c.domain);`;
    const normalizedRestore = `      // Browser exports commonly use \`name\`, while Kaguya app states use \`key\`.
      // Normalize in memory only; the source session file remains untouched.
      var cookieKey = c.key || c.name;
      if (!cookieKey) {
        return;
      }
      var str = cookieKey + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
      jar.setCookie(str, "http://" + c.domain);`;

    if (!source.includes("var cookieKey = c.key || c.name;")) {
      if (!source.includes(originalRestore)) {
        throw new Error("[Kaguya patch] session restore: expected source fragment was not found.");
      }
      source = source.replace(originalRestore, normalizedRestore);
    }

    if (!source.includes("domain=.messenger.com")) {
      const marker = `      jar.setCookie(str, "http://" + c.domain);`;
      const mirror = `${marker}

      // Messenger uses a separate host. Mirror Facebook-scoped cookies into
      // its compatible domain without ever logging cookie names or values.
      if (String(c.domain).replace(/^\\./, "").endsWith("facebook.com")) {
        var messengerStr = cookieKey + "=" + c.value + "; expires=" + c.expires + "; domain=.messenger.com; path=" + c.path + ";";
        jar.setCookie(messengerStr, "https://www.messenger.com");
      }`;
      if (!source.includes(marker)) {
        throw new Error("[Kaguya patch] Messenger cookie mirror: expected source fragment was not found.");
      }
      source = source.replace(marker, mirror);
    } else {
      source = source.replace("var messengerStr = c.key +", "var messengerStr = cookieKey +");
    }

    return source;
  },
  "session restore"
);

writeIfChanged(
  "utils.js",
  (source) => source.replace(
    `      var c2 = c.replace(/domain=\\.facebook\\.com/, "domain=.messenger.com");
      jar.setCookie(c2, "https://www.messenger.com");`,
    `      var c2 = c.replace(/domain=\\.?(www\\.)?facebook\\.com/i, "domain=.messenger.com");
      if (c2 !== c) {
        jar.setCookie(c2, "https://www.messenger.com");
      }`
  ),
  "response cookie sync"
);

writeIfChanged(
  "src/listenMqtt.js",
  (source) => {
    const errorMarker = `\tmqttClient.on('error', function (err) {\n\t\tlog.error("listenMqtt", err);\n`;
    const connectedMarker = `\tmqttClient.on('connect', function () {\n`;
    const closeMarker = `\tmqttClient.on('close', function () {\n\n\t});\n`;

    if (!source.includes("let shadowMqttConnected = false;")) {
      if (!source.includes(errorMarker)) {
        throw new Error("[Kaguya patch] MQTT connection flag: expected source fragment was not found.");
      }
      source = source.replace(errorMarker, `\tlet shadowMqttConnected = false;\n\n${errorMarker}`);
    }

    if (!source.includes('type: "mqtt_error"')) {
      if (!source.includes(errorMarker)) {
        throw new Error("[Kaguya patch] MQTT error signal: expected source fragment was not found.");
      }
      source = source.replace(
        errorMarker,
        `${errorMarker}\t\tglobalCallback({ type: "mqtt_error", error: err?.message || String(err) }, null);\n`
      );
    }

    if (!source.includes('type: "mqtt_connected"')) {
      if (!source.includes(connectedMarker)) {
        throw new Error("[Kaguya patch] MQTT connection signal: expected source fragment was not found.");
      }
      source = source.replace(
        connectedMarker,
        `${connectedMarker}\t\tshadowMqttConnected = true;\n\t\tglobalCallback(null, { type: "mqtt_connected" });\n`
      );
    }

    if (!source.includes('type: "mqtt_closed_before_connect"')) {
      if (!source.includes(closeMarker)) {
        throw new Error("[Kaguya patch] MQTT close signal: expected source fragment was not found.");
      }
      source = source.replace(
        closeMarker,
        `\tmqttClient.on('close', function () {\n\t\tif (!shadowMqttConnected) {\n\t\t\tglobalCallback({ type: "mqtt_closed_before_connect", error: "WebSocket closed before MQTT connection." }, null);\n\t\t}\n\t});\n`
      );
    }

    const messageMarker = `\tmqttClient.on('message', function (topic, message, _packet) {\n`;
    if (!source.includes('type: "mqtt_topic"')) {
      if (!source.includes(messageMarker)) {
        throw new Error("[Kaguya patch] MQTT topic signal: expected source fragment was not found.");
      }
      source = source.replace(
        messageMarker,
        `${messageMarker}\t\tctx.reportedTopics = ctx.reportedTopics || new Set();\n\t\tif (!ctx.reportedTopics.has(topic)) {\n\t\t\tctx.reportedTopics.add(topic);\n\t\t\tglobalCallback(null, { type: "mqtt_topic", topic });\n\t\t}\n`
      );
    }

    return source;
  },
  "MQTT status signals"
);
