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

writeIfChanged(
  "src/listenMqtt.js",
  (source) => {
    const legacyTopicsPattern = /([\t ]*)"\/legacy_web_mtouch"\s*\n[\t ]*\/\/ "\/inbox",\s*\n[\t ]*\/\/ "\/mercury",\s*\n[\t ]*\/\/ "\/messaging_events",\s*\n[\t ]*\/\/ "\/orca_message_notifications",/;
    const hasExpandedTopics = ["/inbox", "/mercury", "/messaging_events", "/orca_message_notifications"].every((topic) => source.includes(`"${topic}",`));

    if (!hasExpandedTopics) {
      if (!legacyTopicsPattern.test(source)) {
        throw new Error("[Kaguya patch] MQTT topic list: expected source fragment was not found.");
      }
      source = source.replace(legacyTopicsPattern, (_match, indent) => `${indent}"/legacy_web_mtouch",
${indent}// Keep legacy message channels observable for compatibility. Their payloads
${indent}// are not logged and ordinary commands are still routed only from /t_ms.
${indent}"/inbox",
${indent}"/mercury",
${indent}"/messaging_events",
${indent}"/orca_message_notifications",`);
    }

    if (!source.includes("st: topics.slice(),")) {
      if (!/\bst\s*:\s*\[\],/.test(source)) {
        throw new Error("[Kaguya patch] MQTT connect subscriptions: expected source fragment was not found.");
      }
      source = source.replace(/\bst\s*:\s*\[\],/, "st: topics.slice(),");
    }

    const messengerCookieBlock = `	const cookies = (() => {
		const messengerCookies = ctx.jar.getCookies("https://www.messenger.com").join("; ");
		return messengerCookies || ctx.jar.getCookies("https://www.facebook.com").join("; ");
	})();`;
    if (!source.includes(messengerCookieBlock)) {
      const cookieLinePattern = /[\t ]*const cookies = ctx\.jar\.getCookies\("https:\/\/www\.facebook\.com"\)\.join\("; "\);/;
      if (!cookieLinePattern.test(source)) {
        throw new Error("[Kaguya patch] MQTT cookie origin: expected source fragment was not found.");
      }
      source = source.replace(cookieLinePattern, messengerCookieBlock);
    }

    source = source
      .replace("wss://edge-chat.facebook.com/chat?region=", "wss://edge-chat.messenger.com/chat?region=")
      .replace("wss://edge-chat.facebook.com/chat?sid=", "wss://edge-chat.messenger.com/chat?sid=");

    if (!source.includes("'Origin': 'https://www.messenger.com'")) {
      if (!source.includes("'Origin': 'https://www.facebook.com'")) {
        throw new Error("[Kaguya patch] MQTT Messenger headers: expected source fragment was not found.");
      }
      source = source.replace("'Origin': 'https://www.facebook.com'", "'Origin': 'https://www.messenger.com'");
    }
    if (!source.includes("'Referer': 'https://www.messenger.com/'")) {
      if (!source.includes("'Referer': 'https://www.facebook.com/'")) {
        throw new Error("[Kaguya patch] MQTT Messenger referrer: expected source fragment was not found.");
      }
      source = source.replace("'Referer': 'https://www.facebook.com/'", "'Referer': 'https://www.messenger.com/'");
    }
    if (!source.includes("origin: 'https://www.messenger.com'")) {
      if (!source.includes("origin: 'https://www.facebook.com'")) {
        throw new Error("[Kaguya patch] MQTT WebSocket origin: expected source fragment was not found.");
      }
      source = source.replace("origin: 'https://www.facebook.com'", "origin: 'https://www.messenger.com'");
    }

    return source;
  },
  "MQTT Messenger transport"
);

writeIfChanged(
  "src/listenMqtt.js",
  (source) => {
    const messageMarker = `\tmqttClient.on('message', function (topic, message, _packet) {\n`;
    const tmsLoop = `\t\t\tfor (const i in jsonMessage.deltas) {\n\t\t\t\tconst delta = jsonMessage.deltas[i];\n\t\t\t\tparseDelta(defaultFuncs, api, ctx, globalCallback, { "delta": delta });\n\t\t\t}`;
    const alternateTopicBlock = `\t\t} else if (["/inbox", "/mercury", "/messaging_events", "/orca_message_notifications"].includes(topic)) {\n\t\t\tconst alternateDeltas = collectMessageDeltas(jsonMessage);\n\t\t\tif (alternateDeltas.length > 0) {\n\t\t\t\talternateDeltas.forEach((delta) => parseDelta(defaultFuncs, api, ctx, globalCallback, { "delta": delta }));\n\t\t\t} else {\n\t\t\t\tglobalCallback(null, { type: "mqtt_unparsed", topic, shape: describeMessageShape(jsonMessage) });\n\t\t\t}\n`;

    if (!source.includes("function collectMessageDeltas(jsonMessage)")) {
      if (!source.includes(messageMarker)) {
        throw new Error("[Kaguya patch] alternate delta parser: message handler was not found.");
      }
      const helpers = `function asMqttObject(value) {\n\tif (typeof value !== "string") return value;\n\ttry { return JSON.parse(value); } catch (_error) { return null; }\n}\n\nfunction collectMessageDeltas(jsonMessage) {\n\tconst root = asMqttObject(jsonMessage) || {};\n\tconst containers = [root, asMqttObject(root.payload), asMqttObject(root.data), asMqttObject(root.message)].filter(Boolean);\n\tfor (const container of containers) {\n\t\tconst candidates = [container.deltas, container.delta ? [container.delta] : null];\n\t\tfor (const candidate of candidates) {\n\t\t\tif (!Array.isArray(candidate)) continue;\n\t\t\tconst deltas = candidate.filter((delta) => delta && typeof delta === "object" && typeof delta.class === "string");\n\t\t\tif (deltas.length > 0) return deltas;\n\t\t}\n\t}\n\treturn [];\n}\n\nfunction describeMessageShape(jsonMessage) {\n\tconst root = asMqttObject(jsonMessage) || {};\n\treturn ["deltas", "delta", "payload", "data", "message"].filter((key) => Object.prototype.hasOwnProperty.call(root, key));\n}\n\n`;
      source = source.replace(messageMarker, `${helpers}${messageMarker}`);
    }

    if (!source.includes("const messageDeltas = collectMessageDeltas(jsonMessage);")) {
      if (!source.includes(tmsLoop)) {
        throw new Error("[Kaguya patch] primary delta loop: expected source fragment was not found.");
      }
      source = source.replace(tmsLoop, `\t\t\tconst messageDeltas = collectMessageDeltas(jsonMessage);\n\t\t\tmessageDeltas.forEach((delta) => parseDelta(defaultFuncs, api, ctx, globalCallback, { "delta": delta }));`);
    }

    if (!source.includes('type: "mqtt_unparsed"')) {
      const typingMarker = `\t\t} else if (topic === "/thread_typing" || topic === "/orca_typing_notifications") {`;
      if (!source.includes(typingMarker)) {
        throw new Error("[Kaguya patch] alternate message routing: expected source fragment was not found.");
      }
      source = source.replace(typingMarker, `${alternateTopicBlock}${typingMarker}`);
    }

    return source;
  },
  "MQTT alternate message deltas"
);

writeIfChanged(
  "src/listenMqtt.js",
  (source) => {
    const getSeqMarker = "function getSeqId(defaultFuncs, api, ctx, globalCallback) {";
    const htmlMarker = "\t\t.then(function (resData) {\n\t\t\tconst html = resData.body;";
    const noDataMarker = `\t\t\tif (noMqttData) {
\t\t\t\tapi["htmlData"] = noMqttData;
\t\t\t}

\t\t\tlistenMqtt(defaultFuncs, api, ctx, globalCallback);`;

    if (!source.includes("function shadowExtractMqttBootstrap(html)")) {
      if (!source.includes(getSeqMarker)) {
        throw new Error("[Kaguya patch] MQTT sync bootstrap: getSeqId was not found.");
      }
      const helper = `function shadowExtractMqttBootstrap(html) {
\tif (typeof html !== "string" || html.length === 0) return null;
\tconst normalized = html.replace(/\\\\u002F/gi, "/").replace(/\\\\\\\\\//g, "/").replace(/&amp;/g, "&");
\tconst sequenceMatch = normalized.match(/(?:iris_seq_id|irisSeqID)\\s*["']?\\s*[:=]\\s*["']?([0-9]+)/i);
\tconst endpointMatch = normalized.match(/(?:mqtt_endpoint|endpoint)\\s*["']?\\s*[:=]\\s*["']?(wss:\\/\\/[^"'\\s,}]+)/i);
\tif (!sequenceMatch || !endpointMatch) return null;
\ttry {
\t\tconst endpoint = endpointMatch[1];
\t\tconst region = new URL(endpoint).searchParams.get("region");
\t\treturn region ? { endpoint, sequenceId: sequenceMatch[1], region: region.toUpperCase() } : null;
\t} catch (_error) {
\t\treturn null;
\t}
}

`;
      source = source.replace(getSeqMarker, `${helper}${getSeqMarker}`);
    }

    if (!source.includes('type: "mqtt_sync_recovered"')) {
      if (!source.includes(htmlMarker)) {
        throw new Error("[Kaguya patch] MQTT sync bootstrap: HTML marker was not found.");
      }
      source = source.replace(htmlMarker, `${htmlMarker}
\t\t\tconst shadowBootstrap = shadowExtractMqttBootstrap(html);
\t\t\tif (shadowBootstrap) {
\t\t\t\tctx.lastSeqId = shadowBootstrap.sequenceId;
\t\t\t\tctx.mqttEndpoint = shadowBootstrap.endpoint;
\t\t\t\tctx.region = shadowBootstrap.region;
\t\t\t\tglobalCallback(null, { type: "mqtt_sync_recovered" });
\t\t\t\treturn listenMqtt(defaultFuncs, api, ctx, globalCallback);
\t\t\t}`);
    }

    if (!source.includes('type: "mqtt_sync_unavailable"')) {
      if (!source.includes(noDataMarker)) {
        throw new Error("[Kaguya patch] MQTT sync fallback: expected source fragment was not found.");
      }
      const fallback = `\t\t\tif (noMqttData) {
\t\t\t\treturn utils
\t\t\t\t\t.get("https://www.messenger.com/", jar, null, ctx.globalOptions, { noRef: true })
\t\t\t\t\t.then(utils.saveCookies(jar))
\t\t\t\t\t.then(function (fallbackData) {
\t\t\t\t\t\tconst recovered = shadowExtractMqttBootstrap(fallbackData.body);
\t\t\t\t\t\tif (!recovered) {
\t\t\t\t\t\t\treturn globalCallback({ type: "mqtt_sync_unavailable", error: "Messenger did not provide a usable MQTT sync bootstrap." }, null);
\t\t\t\t\t\t}
\t\t\t\t\t\tctx.lastSeqId = recovered.sequenceId;
\t\t\t\t\t\tctx.mqttEndpoint = recovered.endpoint;
\t\t\t\t\t\tctx.region = recovered.region;
\t\t\t\t\t\tglobalCallback(null, { type: "mqtt_sync_recovered" });
\t\t\t\t\t\treturn listenMqtt(defaultFuncs, api, ctx, globalCallback);
\t\t\t\t\t})
\t\t\t\t\t.catch(function () {
\t\t\t\t\t\treturn globalCallback({ type: "mqtt_sync_unavailable", error: "Messenger sync bootstrap recovery request failed." }, null);
\t\t\t\t\t});
\t\t\t}

\t\t\tlistenMqtt(defaultFuncs, api, ctx, globalCallback);`;
      source = source.replace(noDataMarker, fallback);
    }

    return source;
  },
  "MQTT sync bootstrap recovery"
);

writeIfChanged(
  "src/listenMqtt.js",
  (source) => {
    const listenerMarker = "function listenMqtt(defaultFuncs, api, ctx, globalCallback) {";
    const oldFacebookRecovery = `\t\t\tconst shadowBootstrap = shadowExtractMqttBootstrap(html);
\t\t\tif (shadowBootstrap) {
\t\t\t\tctx.lastSeqId = shadowBootstrap.sequenceId;
\t\t\t\tctx.mqttEndpoint = shadowBootstrap.endpoint;
\t\t\t\tctx.region = shadowBootstrap.region;
\t\t\t\tglobalCallback(null, { type: "mqtt_sync_recovered" });
\t\t\t\treturn listenMqtt(defaultFuncs, api, ctx, globalCallback);
\t\t\t}`;
    const newFacebookRecovery = `\t\t\tconst shadowFacebookBootstrap = shadowResolveMqttBootstrap("facebook_html", html);
\t\t\tshadowEmitBootstrapOutcome(globalCallback, shadowFacebookBootstrap);
\t\t\tif (shadowFacebookBootstrap.status === "success") {
\t\t\t\tshadowApplyMqttBootstrap(ctx, shadowFacebookBootstrap);
\t\t\t\tglobalCallback(null, { type: "mqtt_sync_recovered" });
\t\t\t\treturn listenMqtt(defaultFuncs, api, ctx, globalCallback);
\t\t\t}`;
    const oldMessengerRecovery = `\t\t\t\t\t\tconst recovered = shadowExtractMqttBootstrap(fallbackData.body);
\t\t\t\t\t\tif (!recovered) {
\t\t\t\t\t\t\treturn globalCallback({ type: "mqtt_sync_unavailable", error: "Messenger did not provide a usable MQTT sync bootstrap." }, null);
\t\t\t\t\t\t}
\t\t\t\t\t\tctx.lastSeqId = recovered.sequenceId;
\t\t\t\t\t\tctx.mqttEndpoint = recovered.endpoint;
\t\t\t\t\t\tctx.region = recovered.region;`;
    const newMessengerRecovery = `\t\t\t\t\t\tconst recovered = shadowResolveMqttBootstrap("messenger_html", fallbackData.body);
\t\t\t\t\t\tshadowEmitBootstrapOutcome(globalCallback, recovered);
\t\t\t\t\t\tif (recovered.status !== "success") {
\t\t\t\t\t\t\treturn globalCallback({ type: "mqtt_sync_unavailable", code: "BOOTSTRAP_UNAVAILABLE", reason: recovered.reason }, null);
\t\t\t\t\t\t}
\t\t\t\t\t\tshadowApplyMqttBootstrap(ctx, recovered);`;

    if (!source.includes("function shadowResolveMqttBootstrap")) {
      if (!source.includes(listenerMarker)) {
        throw new Error("[Kaguya patch] MQTT bootstrap contract: listener marker was not found.");
      }
      const helpers = `function shadowResolveMqttBootstrap(sourceName, html) {
\tif (typeof html !== "string" || html.trim().length === 0) return { status: "unavailable", source: sourceName, reason: "source_unavailable" };
\tconst normalized = html.replace(/\\\\u002F/gi, "/").replace(/\\\\\\\\\//g, "/").replace(/&amp;/g, "&").replace(/&quot;/gi, '"');
\tconst sequenceMatch = normalized.match(/(?:iris_seq_id|irisSeqID)\\s*["']?\\s*[:=]\\s*["']?([0-9]+)/i);
\tconst endpointMatch = normalized.match(/(?:mqtt_endpoint|endpoint)\\s*["']?\\s*[:=]\\s*["']?(wss:\\/\\/[^"'\\s,}]+)/i);
\tif (!sequenceMatch) return { status: "unavailable", source: sourceName, reason: "missing_sequence" };
\tif (!endpointMatch) return { status: "unavailable", source: sourceName, reason: "missing_region" };
\tif (!/^[1-9][0-9]*$/.test(sequenceMatch[1])) return { status: "invalid", source: sourceName, reason: "invalid_sequence" };
\ttry {
\t\tconst endpoint = endpointMatch[1];
\t\tconst region = new URL(endpoint).searchParams.get("region");
\t\tif (!region) return { status: "unavailable", source: sourceName, reason: "missing_region" };
\t\tif (!/^[a-z0-9_-]+$/i.test(region)) return { status: "invalid", source: sourceName, reason: "invalid_region" };
\t\treturn { status: "success", source: sourceName, bootstrap: { endpoint, sequenceId: sequenceMatch[1], region: region.toUpperCase() } };
\t} catch (_error) {
\t\treturn { status: "invalid", source: sourceName, reason: "source_parse_failed" };
\t}
}

function shadowHasMqttBootstrap(ctx) {
\treturn /^[1-9][0-9]*$/.test(String(ctx.lastSeqId || "")) && typeof ctx.region === "string" && /^[A-Z0-9_-]+$/.test(ctx.region);
}

function shadowApplyMqttBootstrap(ctx, result) {
\tctx.lastSeqId = result.bootstrap.sequenceId;
\tctx.mqttEndpoint = result.bootstrap.endpoint;
\tctx.region = result.bootstrap.region;
}

function shadowEmitBootstrapOutcome(globalCallback, result) {
\tconst event = { type: "mqtt_bootstrap_outcome", status: result.status, source: result.source };
\tif (result.status !== "success") event.reason = result.reason;
\tglobalCallback(null, event);
}

`;
      source = source.replace(listenerMarker, `${helpers}${listenerMarker}`);
    }

    if (!source.includes('type: "mqtt_queue_blocked"')) {
      source = source.replace(listenerMarker, `${listenerMarker}
\tif (!shadowHasMqttBootstrap(ctx)) {
\t\tglobalCallback({ type: "mqtt_queue_blocked", code: "MQTT_QUEUE_BLOCKED" }, null);
\t\treturn;
\t}`);
    }
    if (source.includes(oldFacebookRecovery)) source = source.replace(oldFacebookRecovery, newFacebookRecovery);
    if (source.includes(oldMessengerRecovery)) source = source.replace(oldMessengerRecovery, newMessengerRecovery);
    if (source.includes("if (noMqttData) {")) source = source.replace("if (noMqttData) {", "if (noMqttData || !shadowHasMqttBootstrap(ctx)) {");

    return source;
  },
  "MQTT bootstrap contract guard"
);

writeIfChanged(
  "src/listenMqtt.js",
  (source) => {
    const listenerMarker = "function listenMqtt(defaultFuncs, api, ctx, globalCallback) {";
    const connectedMarker = "\tmqttClient.on('connect', function () {\n";
    const closeBlock = `\tmqttClient.on('close', function () {\n\t\tif (!shadowMqttConnected) {\n\t\t\tglobalCallback({ type: "mqtt_closed_before_connect", error: "WebSocket closed before MQTT connection." }, null);\n\t\t}\n\t});\n`;
    const boundedCloseBlock = `\tmqttClient.on('close', function () {\n\t\tif (!shadowMqttConnected) {\n\t\t\tglobalCallback({ type: "mqtt_closed_before_connect", error: "WebSocket closed before MQTT connection." }, null);\n\t\t\tif (!shadowMqttRecoveryRequested && ctx.globalOptions.autoReconnect && shadowRequestMqttRecovery(ctx, globalCallback, "MQTT_CLOSED_BEFORE_CONNECT")) {\n\t\t\t\tlistenMqtt(defaultFuncs, api, ctx, globalCallback);\n\t\t\t}\n\t\t}\n\t});\n`;

    if (!source.includes("function shadowRequestMqttRecovery(ctx")) {
      if (!source.includes(listenerMarker)) throw new Error("[Kaguya patch] bounded recovery: listener marker was not found.");
      source = source.replace(listenerMarker, `function shadowRequestMqttRecovery(ctx, globalCallback, code) {
\tconst maxAttempts = 2;
\tctx.shadowMqttRecoveryAttempts = Number.isInteger(ctx.shadowMqttRecoveryAttempts) ? ctx.shadowMqttRecoveryAttempts : 0;
\tif (ctx.shadowMqttRecoveryAttempts >= maxAttempts) {
\t\tglobalCallback({ type: "mqtt_recovery_escalated", code: "MQTT_RECOVERY_ESCALATED" }, null);
\t\treturn false;
\t}
\tctx.shadowMqttRecoveryAttempts += 1;
\tglobalCallback(null, { type: "mqtt_recovery_attempt", attempt: ctx.shadowMqttRecoveryAttempts, code });
\treturn true;
}

${listenerMarker}`);
    }

    if (!source.includes("let shadowMqttRecoveryRequested = false;")) {
      if (!source.includes("let shadowMqttConnected = false;")) throw new Error("[Kaguya patch] bounded recovery: connection flag was not found.");
      source = source.replace("let shadowMqttConnected = false;", "let shadowMqttConnected = false;\n\tlet shadowMqttRecoveryRequested = false;");
    }
    if (!source.includes("MQTT_CONNECT_TIMEOUT")) {
      const recoveryMarker = "let shadowMqttRecoveryRequested = false;";
      const connectWatchdog = `let shadowMqttRecoveryRequested = false;
	const shadowConnectTimeout = setTimeout(function () {
		if (shadowMqttConnected) return;
		shadowMqttRecoveryRequested = true;
		globalCallback({ type: "mqtt_connect_timeout", code: "MQTT_CONNECT_TIMEOUT" }, null);
		mqttClient.end();
		if (ctx.globalOptions.autoReconnect && shadowRequestMqttRecovery(ctx, globalCallback, "MQTT_CONNECT_TIMEOUT")) {
			listenMqtt(defaultFuncs, api, ctx, globalCallback);
		}
	}, 15000);`;
      if (!source.includes(recoveryMarker)) throw new Error("[Kaguya patch] connection watchdog: recovery marker was not found.");
      source = source.replace(recoveryMarker, connectWatchdog);
    }
    if (!source.includes("clearTimeout(shadowConnectTimeout);")) {
      const errorMarker = "\tmqttClient.on('error', function (err) {\n";
      const closeMarker = "\tmqttClient.on('close', function () {\n";
      const connectedMarker = "\tmqttClient.on('connect', function () {\n";
      if (!source.includes(errorMarker) || !source.includes(closeMarker) || !source.includes(connectedMarker)) {
        throw new Error("[Kaguya patch] connection watchdog: lifecycle markers were not found.");
      }
      source = source.replace(errorMarker, `${errorMarker}\t\tclearTimeout(shadowConnectTimeout);\n`);
      source = source.replace(closeMarker, `${closeMarker}\t\tclearTimeout(shadowConnectTimeout);\n`);
      source = source.replace(connectedMarker, `${connectedMarker}\t\tclearTimeout(shadowConnectTimeout);\n`);
    }
    if (!source.includes("shadowMqttConnected = true;")) {
      if (!source.includes(connectedMarker)) throw new Error("[Kaguya patch] bounded recovery: connect marker was not found.");
      source = source.replace(connectedMarker, `${connectedMarker}\t\tshadowMqttConnected = true;\n\t\tctx.shadowMqttRecoveryAttempts = 0;\n`);
    }
    if (!source.includes("shadowMqttRecoveryRequested = true;")) {
      const errorRecovery = `\t\tmqttClient.end();\n\t\tif (ctx.globalOptions.autoReconnect) {\n\t\t\tlistenMqtt(defaultFuncs, api, ctx, globalCallback);\n\t\t} else {`;
      const boundedErrorRecovery = `\t\tshadowMqttRecoveryRequested = true;\n\t\tmqttClient.end();\n\t\tif (ctx.globalOptions.autoReconnect && shadowRequestMqttRecovery(ctx, globalCallback, "MQTT_ERROR")) {\n\t\t\tlistenMqtt(defaultFuncs, api, ctx, globalCallback);\n\t\t} else {`;
      if (!source.includes(errorRecovery)) throw new Error("[Kaguya patch] bounded recovery: error retry block was not found.");
      source = source.replace(errorRecovery, boundedErrorRecovery);
    }
    if (!source.includes("MQTT_CLOSED_BEFORE_CONNECT")) {
      if (!source.includes(closeBlock)) throw new Error("[Kaguya patch] bounded recovery: close block was not found.");
      source = source.replace(closeBlock, boundedCloseBlock);
    }
    if (!source.includes("MQTT_READY_TIMEOUT")) {
      const timeoutRetry = `\t\tconst rTimeout = setTimeout(function () {\n\t\t\tmqttClient.end();\n\t\t\tlistenMqtt(defaultFuncs, api, ctx, globalCallback);\n\t\t}, 5000);`;
      const boundedTimeoutRetry = `\t\tconst rTimeout = setTimeout(function () {\n\t\t\tshadowMqttRecoveryRequested = true;\n\t\t\tmqttClient.end();\n\t\t\tif (shadowRequestMqttRecovery(ctx, globalCallback, "MQTT_READY_TIMEOUT")) {\n\t\t\t\tlistenMqtt(defaultFuncs, api, ctx, globalCallback);\n\t\t\t}\n\t\t}, 5000);`;
      if (!source.includes(timeoutRetry)) throw new Error("[Kaguya patch] bounded recovery: readiness timeout block was not found.");
      source = source.replace(timeoutRetry, boundedTimeoutRetry);
    }
    return source;
  },
  "MQTT bounded recovery"
);

writeIfChanged(
  "src/getThreadInfo.js",
  (source) => {
    const originalCatch = `      .catch(function(err) {
        log.error("getThreadInfoGraphQL", err);
        return callback(err);
      });`;
    const fallbackCatch = `      .catch(function(err) {
        // Facebook may reject this legacy GraphQL document with error 1357004.
        // Kaguya already ships a Mercury-based fallback; use it without logging
        // thread IDs, cookies, or the raw upstream response.
        if (Number(err?.error) === 1357004 && typeof api.getThreadInfoDeprecated === "function") {
          console.warn("[ SHADOW ]: Thread metadata GraphQL unavailable; using compatible fallback.");
          return api.getThreadInfoDeprecated(threadID, callback);
        }
        log.error("getThreadInfoGraphQL", err);
        return callback(err);
      });`;

    if (source.includes("Thread metadata GraphQL unavailable; using compatible fallback.")) {
      return source;
    }
    if (!source.includes(originalCatch)) {
      throw new Error("[Kaguya patch] thread-info fallback: expected source fragment was not found.");
    }
    return source.replace(originalCatch, fallbackCatch);
  },
  "thread-info fallback"
);
