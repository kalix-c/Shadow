import { extractMqttBootstrap } from "./extractMqttBootstrap.js";

const SOURCES = new Set(["facebook_html", "messenger_html", "injected_fixture"]);
const REGION_PATTERN = /^[A-Z0-9_-]+$/;
const SEQUENCE_PATTERN = /^[1-9][0-9]*$/;

function resolveSource(source) {
  return SOURCES.has(source) ? source : "injected_fixture";
}

function hasSequenceCandidate(html) {
  return /(?:iris_seq_id|irisSeqID)\s*["']?\s*[:=]/i.test(html);
}

function hasEndpointCandidate(html) {
  return /(?:mqtt_endpoint|endpoint)\s*["']?\s*[:=]/i.test(html);
}

/**
 * Pure MQTT bootstrap resolver. Results contain only the validated region and
 * sequence, never HTML, endpoint URLs, cookies, session state, or IDs.
 */
export function createBootstrapProvider(source) {
  const safeSource = resolveSource(source);

  return Object.freeze({
    source: safeSource,
    resolve({ html } = {}) {
      if (typeof html !== "string" || html.trim().length === 0) {
        return { status: "unavailable", source: safeSource, reason: "source_unavailable" };
      }

      if (!hasSequenceCandidate(html)) {
        return { status: "unavailable", source: safeSource, reason: "missing_sequence" };
      }

      if (!hasEndpointCandidate(html)) {
        return { status: "unavailable", source: safeSource, reason: "missing_region" };
      }

      const bootstrap = extractMqttBootstrap(html);
      if (!bootstrap) {
        return { status: "invalid", source: safeSource, reason: "source_parse_failed" };
      }

      if (!REGION_PATTERN.test(bootstrap.region)) {
        return { status: "invalid", source: safeSource, reason: "invalid_region" };
      }

      if (!SEQUENCE_PATTERN.test(bootstrap.sequenceId)) {
        return { status: "invalid", source: safeSource, reason: "invalid_sequence" };
      }

      return {
        status: "success",
        source: safeSource,
        region: bootstrap.region,
        sequenceId: bootstrap.sequenceId
      };
    }
  });
}
