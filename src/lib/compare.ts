import {
  JsonArrayReadonly,
  JsonObjectReadonly,
  JsonValue,
  JsonValueReadonly,
} from "./types";

/**
 * Returns `true` if two {@link JsonValue}s are deeply equal, or `false` otherwise.
 * @param aValue The first {@link JsonValue} to compare.
 * @param bValue The second {@link JsonValue} to compare.
 * @returns `true` if the values are deeply equal, `false` otherwise.
 */
export function jsonIsDeepEqual(
  aValue: JsonValueReadonly,
  bValue: JsonValueReadonly,
): boolean {
  if (aValue === bValue) {
    return true;
  }
  if (aValue === null || bValue === null) {
    return false;
  }
  if (typeof aValue !== typeof bValue) {
    return false;
  }
  if (Array.isArray(aValue)) {
    if (!Array.isArray(bValue)) {
      return false;
    }
    const aArray = aValue as JsonArrayReadonly;
    const bArray = bValue as JsonArrayReadonly;
    if (aArray.length !== bArray.length) {
      return false;
    }
    for (let i = 0; i < aArray.length; i++) {
      if (!jsonIsDeepEqual(aArray[i]!, bArray[i]!)) {
        return false;
      }
    }
    return true;
  }
  if (typeof aValue === "object") {
    if (Array.isArray(bValue)) {
      return false;
    }
    const aObject = aValue as JsonObjectReadonly;
    const bObject = bValue as JsonObjectReadonly;
    for (const aObjectKey in aObject) {
      if (!Object.hasOwn(aObject, aObjectKey)) {
        continue;
      }
      const aObjectValue = aObject[aObjectKey];
      if (aObjectValue === undefined) {
        continue;
      }
      if (!Object.hasOwn(bObject, aObjectKey)) {
        return false;
      }
      const bObjectValue = bObject[aObjectKey];
      if (bObjectValue === undefined) {
        return false;
      }
    }
    for (const bObjectKey in bObject) {
      if (!Object.hasOwn(bObject, bObjectKey)) {
        continue;
      }
      const bObjectValue = bObject[bObjectKey];
      if (bObjectValue === undefined) {
        continue;
      }
      if (!Object.hasOwn(aObject, bObjectKey)) {
        return false;
      }
      const aObjectValue = aObject[bObjectKey];
      if (aObjectValue === undefined) {
        return false;
      }
      if (!jsonIsDeepEqual(aObjectValue, bObjectValue)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Returns `true` if the first {@link JsonValue} is a deep superset of the second {@link JsonValue}, or `false` otherwise.
 * @param supersetValue The {@link JsonValue} to check as a superset.
 * @param subsetValue The {@link JsonValue} to check as a subset.
 * @returns `true` if the first value is a deep subset of the second value, `false` otherwise.
 */
export function jsonIsDeepSubset(
  subsetValue: JsonValueReadonly,
  supersetValue: JsonValueReadonly,
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
    const subsetArray = subsetValue as JsonArrayReadonly;
    const supersetArray = supersetValue as JsonArrayReadonly;
    if (subsetArray.length > supersetArray.length) {
      return false;
    }
    for (let index = 0; index < subsetArray.length; index++) {
      if (!jsonIsDeepSubset(subsetArray[index]!, supersetArray[index]!)) {
        return false;
      }
    }
    return true;
  }
  if (typeof subsetValue === "object") {
    if (Array.isArray(supersetValue)) {
      return false;
    }
    const subsetObject = subsetValue as JsonObjectReadonly;
    const supersetObject = supersetValue as JsonObjectReadonly;
    for (const key in subsetObject) {
      if (!Object.hasOwn(subsetObject, key)) {
        continue;
      }
      const subsetObjectValue = subsetObject[key];
      if (subsetObjectValue === undefined) {
        continue;
      }
      if (!Object.hasOwn(supersetObject, key)) {
        return false;
      }
      const supersetObjectValue = supersetObject[key];
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
