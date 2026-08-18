import assert from "node:assert/strict";
import { ShadowResponseEngine } from "../src/shadow/ShadowResponseEngine.js";

const calls = [];
const api = {
  async sendMessage(...args) {
    calls.push(args);
    return { messageID: "safe-test-id" };
  },
};

let executed = null;
const helpCommand = {
  name: "اوامر",
  aliases: ["مساعدة"],
  cooldowns: 0,
  async execute(context) {
    executed = context;
    await context.api.sendMessage("ok", context.event.threadID, context.event.messageID);
  },
};

const client = {
  commands: new Map([["اوامر", helpCommand]]),
  aliases: new Map([["مساعدة", "اوامر"]]),
  cooldowns: new Map(),
  handler: { reply: new Map(), reactions: new Map() },
  config: { prefix: ".", ADMIN_IDS: [], botEnabled: true },
};

const engine = new ShadowResponseEngine({
  api,
  client,
  createContext: async ({ event, args }) => ({ api, event, args }),
});

const result = await engine.dispatch({
  type: "message",
  body: ".مساعدة",
  threadID: "test-thread",
  messageID: "test-message",
  senderID: "test-sender",
  isGroup: true,
});

assert.equal(result.handled, true);
assert.equal(result.command, "اوامر");
assert.equal(result.outcome, "responded");
assert.equal(executed.args.length, 0);
assert.equal(calls.length, 1);
const commandsResult = await engine.dispatch({
  type: "message",
  body: ".اوامر",
  threadID: "test-thread",
  messageID: "test-message-2",
  senderID: "test-sender",
  isGroup: true,
});
assert.equal(commandsResult.outcome, "responded");
assert.equal(calls.length, 2);
assert.deepEqual(await engine.dispatch({ type: "message", body: "مساعدة" }), { handled: false, outcome: "ignored" });

const failingEngine = new ShadowResponseEngine({
  api: { async sendMessage() { throw new Error("fixture failure"); } },
  client,
  createContext: async ({ event, args }) => ({ api: { async sendMessage() { throw new Error("fixture failure"); } }, event, args }),
});
const failed = await failingEngine.dispatch({
  type: "message",
  body: ".مساعدة",
  threadID: "test-thread",
  messageID: "test-message",
  senderID: "test-sender",
});
assert.equal(failed.outcome, "send_failed");
console.log("SHADOW_RESPONSE_ENGINE_OK");
