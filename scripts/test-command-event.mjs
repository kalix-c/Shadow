import assert from "node:assert/strict";
import { commandKind, toCommandEvent } from "../src/shadow/CommandEvent.js";

const message = { type: "message", body: ".مساعدة", threadID: "fixture-thread" };
assert.equal(toCommandEvent(message).accepted, true);
assert.equal(toCommandEvent(message).event, message);
assert.deepEqual(toCommandEvent({ type: "typ" }), { accepted: false, reason: "event_type" });
assert.deepEqual(toCommandEvent({ type: "message", body: "", threadID: "fixture-thread" }), { accepted: false, reason: "missing_body" });
assert.deepEqual(toCommandEvent({ type: "message", body: ".مساعدة" }), { accepted: false, reason: "missing_thread" });
assert.equal(commandKind({ name: "مساعدة" }), "help");
assert.equal(commandKind({ name: "اوامر" }), "commands");
assert.equal(commandKind({ name: "custom" }), "unknown");

console.log("Command event test passed: only valid textual message events are admitted without copying payload data.");
