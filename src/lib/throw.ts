import { jsonPreview } from "./preview";
import { JsonValueReadonly } from "./types";

/**
 * Throws an error indicating that a {@link JsonValueReadonly} did not match the expected type or value.
 */
export function jsonThrowWithExpected(
  expected: string,
  found: JsonValueReadonly,
): never {
  throw new Error(`JSON: Expected: ${expected} (Found: ${jsonPreview(found)})`);
}

// TODO - this should be internal probably
