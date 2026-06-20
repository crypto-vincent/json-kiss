import { type JsonValue } from "..";

/**
 * Parses a JSON string into a {@link JsonValue}.
 * @param jsonString The JSON string to parse.
 * @returns The parsed {@link JsonValue}.
 */
export function jsonParse(
  jsonString: string,
  // config?: { lenient?: boolean },
): JsonValue {
  return JSON.parse(jsonString) as JsonValue;
}
