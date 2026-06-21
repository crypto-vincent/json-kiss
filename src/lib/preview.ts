import { jsonStringify } from "./stringify";
import { JsonValueReadonly } from "./types";

/**
 * Returns a short, human-readable preview string of a {@link JsonValueReadonly}.
 */
export function jsonPreview(value: JsonValueReadonly): string {
  // TODO - better implementation
  const stringified = jsonStringify(value);
  if (stringified.length > 20) {
    return stringified.slice(0, 20) + "...";
  }
  return stringified;
}
