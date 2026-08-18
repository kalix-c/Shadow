import assert from "node:assert/strict";

process.env.SHADOW_RUNTIME_PROFILE = "core";

const { commandMiddleware } = await import("../src/middleware/commands.middleware.js");
const { eventMiddleware } = await import("../src/middleware/event.middleware.js");
const { ShadowResponseEngine } = await import("../src/shadow/ShadowResponseEngine.js");

global.client = {
  commands: new Map(),
  aliases: new Map(),
  cooldowns: new Map(),
  events: new Map(),
  handler: { reply: new Map(), reactions: new Map() },
  config: { prefix: ".", ADMIN_IDS: [], botEnabled: true },
};

await commandMiddleware();
await eventMiddleware();

assert.deepEqual([...global.client.commands.keys()], ["اوامر"]);
assert.equal(global.client.aliases.get("مساعدة"), "اوامر");
assert.equal(global.client.events.size, 0);

const sent = [];
const api = {
  async sendMessage(...args) {
    sent.push(args);
    return { messageID: "safe-test-id" };
  },
};
const engine = new ShadowResponseEngine({
  api,
  client: global.client,
  createContext: async ({ event, args }) => ({ api, event, args, client: global.client }),
});
const result = await engine.dispatch({
  type: "message",
  body: ".مساعدة",
  threadID: "test-thread",
  messageID: "test-message",
  senderID: "test-sender",
  isGroup: true,
});

assert.equal(result.outcome, "responded");
assert.equal(sent.length, 1);
console.log("SHADOW_CORE_RUNTIME_OK");
