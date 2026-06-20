import { type JsonValue, type JsonValueReadonly } from "..";
import { jsonStringify } from "./stringify";

/**
 * Returns a short, human-readable preview string of a {@link JsonValue}.
 */
export function jsonPreview(value: JsonValue | JsonValueReadonly): string {
  // TODO - better implementation
  const stringified = jsonStringify(value);
  if (stringified.length > 20) {
    return stringified.slice(0, 20) + "...";
  }
  return stringified;
}
