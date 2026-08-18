const SAFE_SOURCES = new Set(["facebook_html", "messenger_html"]);

function safeOutcome(result) {
  const outcome = { status: result.status, source: result.source };
  if (result.status !== "success") outcome.reason = result.reason;
  return outcome;
}

/**
 * Resolve sources in priority order. The selector never combines fields from
 * different sources and never exposes source HTML through its result.
 */
export function selectMqttBootstrap({ providers, getHtml, allowFixture = false } = {}) {
  if (!Array.isArray(providers) || typeof getHtml !== "function") {
    return {
      result: { status: "unavailable", source: "messenger_html", reason: "source_unavailable" },
      outcomes: []
    };
  }

  const outcomes = [];
  let finalResult = { status: "unavailable", source: "messenger_html", reason: "source_unavailable" };

  for (const provider of providers) {
    if (!provider || typeof provider.resolve !== "function") continue;
    if (!SAFE_SOURCES.has(provider.source) && !(allowFixture && provider.source === "injected_fixture")) continue;

    const result = provider.resolve({ html: getHtml(provider.source) });
    outcomes.push(safeOutcome(result));
    finalResult = result;
    if (result.status === "success") return { result, outcomes };
  }

  return { result: finalResult, outcomes };
}
