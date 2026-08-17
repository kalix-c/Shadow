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
        `${connectedMarker}\t\tglobalCallback(null, { type: "mqtt_connected" });\n`
      );
    }

    return source;
  },
  "MQTT status signals"
);
