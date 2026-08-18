import assert from "node:assert/strict";
import { BoundedMqttRecovery } from "../src/shadow/BoundedMqttRecovery.js";

const recovery = new BoundedMqttRecovery({ maxAttempts: 2 });
assert.deepEqual(recovery.request(), { action: "retry", attempt: 1 });
assert.deepEqual(recovery.request(), { action: "retry", attempt: 2 });
assert.deepEqual(recovery.request(), { action: "escalate", attempt: 2 });
recovery.reset();
assert.deepEqual(recovery.request(), { action: "retry", attempt: 1 });

console.log("Bounded MQTT recovery test passed: two retries are allowed, then escalation stops the loop.");
