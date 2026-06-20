import { type JsonValue, type JsonValueReadonly } from "..";

/**
 * Returns a string representation of a {@link JsonValue}.
 */
export function jsonStringify(
  value: JsonValue | JsonValueReadonly,
  config?: { pretty?: boolean },
): string {
  return JSON.stringify(value, null, config?.pretty ? 2 : undefined);
}
