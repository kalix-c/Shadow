import EventEmitter from "node:events";
import { normalizeMqttCallback } from "./normalizeMqttEvent.js";
import { SafeTelemetry } from "./SafeTelemetry.js";

/**
 * Shadow Messenger transport isolates third-party Messenger clients from the
 * command layer. It never logs or persists message bodies, cookies, or IDs.
 */
class ShadowMessenger extends EventEmitter {
  constructor({ login, appState, options, dedupeTtlMs = 120_000, now = () => Date.now(), telemetry }) {
    super();
    if (typeof login !== "function") {
      throw new TypeError("ShadowMessenger requires a login function.");
    }

    this.login = login;
    this.appState = appState;
    this.options = options;
    this.api = null;
    this.dedupeTtlMs = dedupeTtlMs;
    this.now = now;
    this.seenMessageIds = new Map();
    this.telemetry = telemetry instanceof SafeTelemetry ? telemetry : new SafeTelemetry((record) => this.emit("telemetry", record));
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.login({ appState: this.appState }, this.options, (error, api) => {
        if (error || !api) {
          reject(error instanceof Error ? error : new Error(error?.message || "Messenger login failed."));
          return;
        }

        try {
          api.setOptions(this.options);
          this.api = api;
          this.emit("apiReady", api);
          api.listenMqtt((primary, secondary) => this.#handleMqtt(primary, secondary));
          this.emit("status", { type: "transport_started" });
          resolve(api);
        } catch (listenError) {
          reject(listenError);
        }
      });
    });
  }

  #handleMqtt(primary, secondary) {
    const normalized = normalizeMqttCallback(primary, secondary);

    if (normalized.type === "mqtt_bootstrap_outcome") {
      this.telemetry.emit({
        signal: "BOOTSTRAP_OUTCOME",
        status: normalized.status,
        source: normalized.source,
        ...(normalized.reason ? { reason: normalized.reason } : {})
      });
    } else if (normalized.type === "mqtt_recovery_attempt" || normalized.type === "mqtt_recovery_escalated") {
      this.telemetry.emit({
        signal: "MQTT_PHASE_CHANGED",
        phase: normalized.type === "mqtt_recovery_attempt" ? "retrying" : "escalated",
        ...(normalized.attempt ? { attempt: normalized.attempt } : {}),
        ...(normalized.code ? { error_code: normalized.code } : {})
      });
    } else if (normalized.kind === "event") {
      const eventType = normalized.event?.type === "message" ? "message" : normalized.event?.type === "typ" ? "typ" : "unknown";
      this.telemetry.emit({ signal: "EVENT_CLASSIFIED", event_type: eventType, classification: eventType === "message" ? "routed" : "ignored" });
    }

    if (normalized.kind === "event") {
      if (this.#isDuplicateMessage(normalized.event)) return;
      this.emit("event", normalized.event);
      return;
    }

    if (normalized.kind === "status") {
      this.emit("status", normalized);
      return;
    }

    if (normalized.kind === "diagnostic") {
      this.emit("diagnostic", normalized);
      return;
    }

    this.emit("transportError", normalized);
  }

  #isDuplicateMessage(event) {
    if (event?.type !== "message" || typeof event.messageID !== "string" || event.messageID.length === 0) {
      return false;
    }

    const now = this.now();
    for (const [messageID, expiresAt] of this.seenMessageIds) {
      if (expiresAt <= now) this.seenMessageIds.delete(messageID);
    }

    if (this.seenMessageIds.has(event.messageID)) return true;
    this.seenMessageIds.set(event.messageID, now + this.dedupeTtlMs);
    return false;
  }
}

export { ShadowMessenger };
