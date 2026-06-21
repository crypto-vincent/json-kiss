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
  for (const key in object) {
    const value = object[key];
    if (value !== undefined) {
      copy[key] = jsonValueDeepCopy(value);
    }
  }
  return copy;
}

export function jsonValueDeepCopy(value: JsonValueReadonly): JsonValue {
  return visitor(value);
}

const visitor = jsonVisitor<JsonValue>({
  null: () => null,
  boolean: (value) => value,
  number: (value) => value,
  string: (value) => value,
  array: (value) => jsonArrayDeepCopy(value),
  object: (value) => jsonObjectDeepCopy(value),
});
