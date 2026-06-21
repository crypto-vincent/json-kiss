import { JsonValueReadonly } from "./types";

/**
 * Returns a string representation of a {@link JsonValueReadonly}.
 */
export function jsonStringify(
  value: JsonValueReadonly,
  config?: { indented?: boolean },
): string {
  return JSON.stringify(value, null, config?.indented ? 2 : undefined);
}
