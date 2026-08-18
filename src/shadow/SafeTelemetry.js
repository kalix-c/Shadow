const forbiddenKeys = new Set([
  "body",
  "text",
  "html",
  "cookie",
  "cookies",
  "appState",
  "session",
  "token",
  "threadID",
  "threadId",
  "messageID",
  "messageId",
  "senderID",
  "senderId",
  "error",
  "exception"
]);

const allowedFields = {
  BOOTSTRAP_OUTCOME: new Set(["signal", "status", "source", "reason"]),
  MQTT_PHASE_CHANGED: new Set(["signal", "phase", "attempt", "error_code"]),
  EVENT_CLASSIFIED: new Set(["signal", "event_type", "classification"]),
  EVENT_MESSAGE_ROUTED: new Set(["signal", "command_kind", "dedupe"]),
  COMMAND_OUTCOME: new Set(["signal", "command_kind", "outcome"]),
  RESPONSE_SEND_OUTCOME: new Set(["signal", "command_kind", "outcome", "error_code"])
};

function isSafeScalar(value) {
  return typeof value === "string" || typeof value === "number";
}

export class SafeTelemetry {
  constructor(sink = () => {}) {
    this.sink = typeof sink === "function" ? sink : () => {};
  }

  emit(record) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return false;
    const allowed = allowedFields[record.signal];
    if (!allowed) return false;

    const keys = Object.keys(record);
    if (keys.some((key) => forbiddenKeys.has(key) || !allowed.has(key))) return false;
    if (keys.some((key) => key !== "signal" && !isSafeScalar(record[key]))) return false;

    try {
      this.sink(Object.freeze({ ...record }));
      return true;
    } catch {
      return false;
    }
  }
}
