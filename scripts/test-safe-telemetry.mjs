import assert from "node:assert/strict";
import { SafeTelemetry } from "../src/shadow/SafeTelemetry.js";

const records = [];
const telemetry = new SafeTelemetry((record) => records.push(record));

assert.equal(telemetry.emit({ signal: "EVENT_CLASSIFIED", event_type: "message", classification: "routed" }), true);
assert.equal(telemetry.emit({ signal: "EVENT_CLASSIFIED", event_type: "message", classification: "routed", body: ".مساعدة" }), false);
assert.equal(telemetry.emit({ signal: "BOOTSTRAP_OUTCOME", status: "success", source: "facebook_html", cookie: "blocked" }), false);
assert.equal(telemetry.emit({ signal: "EVENT_MESSAGE_ROUTED", command_kind: "help", dedupe: "new", threadID: "blocked" }), false);
assert.deepEqual(records, [{ signal: "EVENT_CLASSIFIED", event_type: "message", classification: "routed" }]);

console.log("Safe telemetry test passed: only allowlisted scalar fields reach the sink.");
