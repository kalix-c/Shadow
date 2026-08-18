const supportedTypes = new Set(["message", "message_reply"]);

export function toCommandEvent(event) {
  if (!event || typeof event !== "object" || !supportedTypes.has(event.type)) {
    return { accepted: false, reason: "event_type" };
  }

  if (typeof event.body !== "string" || event.body.trim().length === 0) {
    return { accepted: false, reason: "missing_body" };
  }

  if (typeof event.threadID !== "string" || event.threadID.length === 0) {
    return { accepted: false, reason: "missing_thread" };
  }

  return { accepted: true, event };
}

export function commandKind(parsed) {
  const name = String(parsed?.name || "");
  if (name === "مساعدة" || name === "help") return "help";
  if (name === "اوامر" || name === "أوامر" || name === "commands") return "commands";
  return "unknown";
}
