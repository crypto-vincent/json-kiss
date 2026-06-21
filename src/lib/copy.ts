import {
  JsonArray,
  JsonArrayReadonly,
  JsonObject,
  JsonObjectReadonly,
  JsonValue,
  JsonValueReadonly,
} from "./types";
import { jsonVisitor } from "./visitor";

export function jsonArrayDeepCopy(array: JsonArrayReadonly): JsonArray {
  return array.map(jsonValueDeepCopy);
}

export function jsonObjectDeepCopy(object: JsonObjectReadonly): JsonObject {
  const copy: JsonObject = {};
  for (const objectKey in object) {
    const objectValue = object[objectKey];
    if (objectValue !== undefined) {
      copy[objectKey] = jsonValueDeepCopy(objectValue);
    }
  }
  return copy;
}

export const jsonValueDeepCopy: (value: JsonValueReadonly) => JsonValue =
  jsonVisitor<JsonValue>({
    null: () => null,
    boolean: (value) => value,
    number: (value) => value,
    string: (value) => value,
    array: (value) => jsonArrayDeepCopy(value),
    object: (value) => jsonObjectDeepCopy(value),
  });
