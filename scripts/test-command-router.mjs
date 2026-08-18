import assert from "node:assert/strict";
import { dispatchCommandEvent } from "../src/shadow/CommandRouter.js";

const records = [];
let dispatches = 0;
const responder = {
  parse: () => ({ name: "مساعدة" }),
  async dispatch(event) {
    dispatches += 1;
    assert.equal(event.type, "message");
    return { handled: true, command: "مساعدة" };
  }
};
const telemetry = { emit: (record) => records.push(record) };

const result = await dispatchCommandEvent({
  event: { type: "message", body: ".مساعدة", threadID: "fixture-thread", messageID: "fixture-message" },
  responder,
  telemetry
});
assert.equal(result.admitted, true);
assert.equal(dispatches, 1);
assert.deepEqual(records, [
  { signal: "EVENT_MESSAGE_ROUTED", command_kind: "help", dedupe: "new" },
  { signal: "COMMAND_OUTCOME", command_kind: "help", outcome: "responded" }
]);

const invalid = await dispatchCommandEvent({ event: { type: "message", body: "", threadID: "fixture-thread" }, responder, telemetry });
assert.equal(invalid.admitted, false);
assert.equal(dispatches, 1);

const typing = await dispatchCommandEvent({ event: { type: "typ" }, responder, telemetry });
assert.equal(typing.admitted, false);
assert.equal(dispatches, 1);

console.log("Command router test passed: valid command fixture dispatches once while invalid and typing events do not reach the engine.");
