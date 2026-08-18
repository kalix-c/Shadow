import { commandKind, toCommandEvent } from "./CommandEvent.js";

export async function dispatchCommandEvent({ event, responder, telemetry }) {
  if (!responder || typeof responder.dispatch !== "function") {
    return { handled: false, outcome: "ignored", admitted: false };
  }

  const commandEvent = toCommandEvent(event);
  const isReaction = event?.type === "message_reaction";
  if (!commandEvent.accepted && !isReaction) {
    telemetry?.emit({ signal: "COMMAND_OUTCOME", command_kind: "unknown", outcome: "ignored" });
    return { handled: false, outcome: "ignored", admitted: false };
  }

  const kind = commandEvent.accepted ? commandKind(responder.parse(commandEvent.event)) : "unknown";
  if (commandEvent.accepted) {
    telemetry?.emit({ signal: "EVENT_MESSAGE_ROUTED", command_kind: kind, dedupe: "new" });
  }

  const result = await responder.dispatch(event);
  if (commandEvent.accepted) {
    telemetry?.emit({ signal: "COMMAND_OUTCOME", command_kind: kind, outcome: result?.handled ? "responded" : "ignored" });
  }

  return { ...result, admitted: commandEvent.accepted };
}
