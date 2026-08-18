/**
 * Extract only the two non-secret values required to create a Messenger MQTT
 * sync queue. The function is intentionally pure so it can be tested without
 * a network request, cookie jar, or persisted session.
 */
export function extractMqttBootstrap(html) {
  if (typeof html !== "string" || html.length === 0) return null;

  const normalized = html
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/gi, '"');

  const sequenceMatch = normalized.match(/(?:iris_seq_id|irisSeqID)\s*["']?\s*[:=]\s*["']?([0-9]+)/i);
  const endpointMatch = normalized.match(/(?:mqtt_endpoint|endpoint)\s*["']?\s*[:=]\s*["']?(wss:\/\/[^"'\s,}]+)/i);

  if (!sequenceMatch || !endpointMatch || !/^[1-9][0-9]*$/.test(sequenceMatch[1])) return null;

  try {
    const endpoint = endpointMatch[1];
    const region = new URL(endpoint).searchParams.get("region");
    if (!region || !/^[a-z0-9_-]+$/i.test(region)) return null;

    return {
      endpoint,
      sequenceId: sequenceMatch[1],
      region: region.toUpperCase()
    };
  } catch {
    return null;
  }
}
