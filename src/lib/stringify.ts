import { JsonValueReadonly } from "./types";

/**
 * Returns a string representation of a {@link JsonValueReadonly}.
 */
export function jsonStringify(
  value: JsonValueReadonly,
  config?: { pretty?: boolean },
): string {
  return JSON.stringify(value, null, config?.pretty ? 2 : undefined);
}
