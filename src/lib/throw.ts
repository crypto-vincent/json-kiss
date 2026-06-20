import { type JsonValue, type JsonValueReadonly } from "..";
import { jsonPreview } from "./preview";

/**
 * Throws an error indicating that a {@link JsonValue} did not match the expected type or value.
 */
export function jsonThrowWithExpected(
  expected: string,
  found: JsonValue | JsonValueReadonly,
): never {
  throw new Error(`JSON: Expected: ${expected} (Found: ${jsonPreview(found)})`);
}
