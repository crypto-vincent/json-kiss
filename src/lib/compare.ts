import {
  type JsonObjectReadonly,
  type JsonValue,
  type JsonValueReadonly,
} from "..";

/**
 * Returns `true` if two {@link JsonValue}s are deeply equal, or `false` otherwise.
 * @param leftValue The first {@link JsonValue} to compare.
 * @param rightValue The second {@link JsonValue} to compare.
 * @returns `true` if the values are deeply equal, `false` otherwise.
 */
export function jsonIsDeepEqual(
  leftValue: JsonValue | JsonValueReadonly,
  rightValue: JsonValue | JsonValueReadonly,
): boolean {
  if (leftValue === rightValue) {
    return true;
  }
  if (leftValue === null || rightValue === null) {
    return false;
  }
  if (typeof leftValue !== typeof rightValue) {
    return false;
  }
  if (Array.isArray(leftValue)) {
    if (!Array.isArray(rightValue)) {
      return false;
    }
    if (leftValue.length !== rightValue.length) {
      return false;
    }
    for (let i = 0; i < leftValue.length; i++) {
      if (!jsonIsDeepEqual(leftValue[i]!, rightValue[i]!)) {
        return false;
      }
    }
    return true;
  }
  if (typeof leftValue === "object") {
    if (Array.isArray(rightValue)) {
      return false;
    }
    const leftObjectKeys = Object.keys(leftValue);
    const rightObjectKeys = Object.keys(rightValue);
    if (leftObjectKeys.length !== rightObjectKeys.length) {
      return false;
    }
    for (const key of leftObjectKeys) {
      const leftObjectValue = (leftValue as JsonObjectReadonly)[key];
      if (leftObjectValue === undefined) {
        continue;
      }
      const rightObjectValue = (rightValue as JsonObjectReadonly)[key];
      if (rightObjectValue === undefined) {
        return false;
      }
      if (!jsonIsDeepEqual(leftObjectValue, rightObjectValue)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Returns `true` if the first {@link JsonValue} is a deep subset of the second {@link JsonValue}, or `false` otherwise.
 * @param subsetValue The {@link JsonValue} to check as a subset.
 * @param supersetValue The {@link JsonValue} to check as a superset.
 * @returns `true` if the first value is a deep subset of the second value, `false` otherwise.
 */
export function jsonIsDeepSubset(
  subsetValue: JsonValue | JsonValueReadonly,
  supersetValue: JsonValue | JsonValueReadonly,
): boolean {
  if (subsetValue === supersetValue) {
    return true;
  }
  if (subsetValue === null || supersetValue === null) {
    return false;
  }
  if (typeof subsetValue !== typeof supersetValue) {
    return false;
  }
  if (Array.isArray(subsetValue)) {
    if (!Array.isArray(supersetValue)) {
      return false;
    }
    if (subsetValue.length > supersetValue.length) {
      return false;
    }
    for (let index = 0; index < subsetValue.length; index++) {
      if (!jsonIsDeepSubset(subsetValue[index]!, supersetValue[index]!)) {
        return false;
      }
    }
    return true;
  }
  if (typeof subsetValue === "object") {
    if (Array.isArray(supersetValue)) {
      return false;
    }
    for (const key in subsetValue) {
      const subsetObjectValue = (subsetValue as JsonObjectReadonly)[key];
      if (subsetObjectValue === undefined) {
        continue;
      }
      const supersetObjectValue = (supersetValue as JsonObjectReadonly)[key];
      if (supersetObjectValue === undefined) {
        return false;
      }
      if (!jsonIsDeepSubset(subsetObjectValue, supersetObjectValue)) {
        return false;
      }
    }
    return true;
  }
  return false;
}
