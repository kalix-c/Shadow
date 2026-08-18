const statusTypes = new Set([
  "ready",
  "mqtt_connected",
  "mqtt_sync_recovered",
  "mqtt_closed_before_connect",
  "mqtt_error",
  "mqtt_sync_unavailable",
  "mqtt_queue_blocked",
  "mqtt_connect_timeout",
  "mqtt_recovery_attempt",
  "mqtt_recovery_escalated",
  "stop_listen",
  "account_inactive"
]);

export function normalizeMqttCallback(primary, secondary) {
  const candidate = secondary ?? primary;

  if (!candidate || typeof candidate !== "object") {
    return {
      kind: "transport_error",
      type: "mqtt_error",
      error: "Messenger returned an invalid MQTT callback."
    };
  }

  if (candidate.type === "mqtt_unparsed") {
    return {
      kind: "diagnostic",
      type: "mqtt_unparsed",
      topic: typeof candidate.topic === "string" ? candidate.topic : "unknown",
      shape: Array.isArray(candidate.shape) ? candidate.shape.filter((key) => typeof key === "string") : []
    };
  }

  if (candidate.type === "mqtt_bootstrap_outcome") {
    return {
      kind: "diagnostic",
      type: "mqtt_bootstrap_outcome",
      status: typeof candidate.status === "string" ? candidate.status : "unknown",
      source: typeof candidate.source === "string" ? candidate.source : "unknown",
      reason: typeof candidate.reason === "string" ? candidate.reason : undefined
    };
  }

  if (statusTypes.has(candidate.type)) {
    return {
      kind: candidate.type === "mqtt_error" || candidate.type === "mqtt_sync_unavailable" || candidate.type === "mqtt_queue_blocked" || candidate.type === "mqtt_connect_timeout" || candidate.type === "mqtt_recovery_escalated" || candidate.type === "stop_listen" || candidate.type === "account_inactive" || candidate.type === "mqtt_closed_before_connect"
        ? "transport_error"
        : "status",
      type: candidate.type,
      error: typeof candidate.error === "string" ? candidate.error : undefined,
      attempt: Number.isInteger(candidate.attempt) && candidate.attempt > 0 ? candidate.attempt : undefined,
      code: typeof candidate.code === "string" ? candidate.code : undefined
    };
  }

  if (candidate.type === "mqtt_topic") {
    return {
      kind: "diagnostic",
      type: "mqtt_topic",
      topic: typeof candidate.topic === "string" ? candidate.topic : "unknown"
    };
  }

  return { kind: "event", event: candidate };
}
