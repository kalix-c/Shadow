import assert from "node:assert/strict";
import { createBootstrapProvider } from "../src/shadow/BootstrapProvider.js";
import { selectMqttBootstrap } from "../src/shadow/BootstrapSelector.js";
import { extractMqttBootstrap } from "../src/shadow/extractMqttBootstrap.js";
import { mqttBootstrapFixtures } from "./fixtures/mqtt-bootstrap-fixtures.mjs";

for (const [name, fixture] of Object.entries(mqttBootstrapFixtures)) {
  assert.deepEqual(extractMqttBootstrap(fixture.html), fixture.expected, name);
}

assert.equal(extractMqttBootstrap("<html>no bootstrap</html>"), null);
assert.equal(extractMqttBootstrap(null), null);

const fixtureProvider = createBootstrapProvider("injected_fixture");
assert.deepEqual(fixtureProvider.resolve({ html: mqttBootstrapFixtures.modernEscaped.html }), {
  status: "success",
  source: "injected_fixture",
  region: "NORTH",
  sequenceId: "111111"
});
assert.deepEqual(fixtureProvider.resolve({ html: mqttBootstrapFixtures.missingSequence.html }), {
  status: "unavailable",
  source: "injected_fixture",
  reason: "missing_sequence"
});
assert.deepEqual(fixtureProvider.resolve({ html: mqttBootstrapFixtures.missingRegion.html }), {
  status: "invalid",
  source: "injected_fixture",
  reason: "source_parse_failed"
});
assert.deepEqual(fixtureProvider.resolve({ html: mqttBootstrapFixtures.nonWebSocketEndpoint.html }), {
  status: "invalid",
  source: "injected_fixture",
  reason: "source_parse_failed"
});
assert.deepEqual(createBootstrapProvider("unknown").resolve(), {
  status: "unavailable",
  source: "injected_fixture",
  reason: "source_unavailable"
});

const facebookProvider = createBootstrapProvider("facebook_html");
const messengerProvider = createBootstrapProvider("messenger_html");
const selected = selectMqttBootstrap({
  providers: [facebookProvider, messengerProvider],
  getHtml(source) {
    return source === "facebook_html" ? mqttBootstrapFixtures.missingSequence.html : mqttBootstrapFixtures.legacyInline.html;
  }
});
assert.deepEqual(selected.result, {
  status: "success",
  source: "messenger_html",
  region: "WEST",
  sequenceId: "222222"
});
assert.deepEqual(selected.outcomes, [
  { status: "unavailable", source: "facebook_html", reason: "missing_sequence" },
  { status: "success", source: "messenger_html" }
]);

let secondProviderRead = false;
const firstSuccess = selectMqttBootstrap({
  providers: [facebookProvider, messengerProvider],
  getHtml(source) {
    if (source === "messenger_html") secondProviderRead = true;
    return mqttBootstrapFixtures.modernEscaped.html;
  }
});
assert.equal(firstSuccess.result.source, "facebook_html");
assert.equal(secondProviderRead, false);

console.log("SHADOW_SYNC_BOOTSTRAP_TEST_OK");
