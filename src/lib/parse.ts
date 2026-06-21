import { JsonArray, JsonObject, JsonValue } from "./types";

/**
 * Parses a JSON string into a {@link JsonValue}.
 * @param string The JSON string to parse.
 * @returns The parsed {@link JsonValue}.
 */
export function jsonParse(
  string: string,
  // config?: { lenient?: boolean },
): JsonValue {
  const reader = new Reader(string);
  const result = value(reader);
  whitespace(reader);
  if (reader.peek(1) !== null) {
    throw new Error("Unexpected characters after JSON value");
  }
  return result;
}

class Reader {
  #value: string;
  #index: number;
  constructor(value: string) {
    this.#value = value;
    this.#index = 0;
  }
  peek(count: number): string | null {
    if (this.#index + count > this.#value.length) {
      return null;
    }
    return this.#value.slice(this.#index, this.#index + count);
  }
  read(count: number): string | null {
    if (this.#index + count > this.#value.length) {
      return null;
    }
    const result = this.#value.slice(this.#index, this.#index + count);
    this.#index += count;
    return result;
  }
}

function value(reader: Reader): JsonValue {
  whitespace(reader);
  const peeked = reader.peek(1);
  if (peeked === null) {
    throw new Error("Unexpected end of input");
  }
  if (peeked === `n`) {
    return valueNull(reader);
  }
  if (peeked === `t` || peeked === `f`) {
    return valueBoolean(reader);
  }
  if (
    peeked === `-` ||
    peeked === `+` ||
    peeked === `.` ||
    (peeked >= `0` && peeked <= `9`)
  ) {
    return valueNumber(reader);
  }
  if (peeked === `"` || peeked === `'`) {
    return valueString(reader);
  }
  if (peeked === `[`) {
    return valueArray(reader);
  }
  if (peeked === `{`) {
    return valueObject(reader);
  }
  throw new Error(`Unexpected character "${peeked}"`);
}

function valueNull(reader: Reader): null {
  const read = reader.read(4);
  if (read !== "null") {
    throw new Error(`Expected "null", but found "${read}"`);
  }
  return null;
}

function valueBoolean(reader: Reader): boolean {
  const read = reader.read(4);
  if (read === "true") {
    return true;
  }
  if (read === "fals") {
    const read2 = reader.read(1);
    if (read2 !== "e") {
      throw new Error(`Expected "false", but found "${read}${read2}"`);
    }
    return false;
  }
  throw new Error(`Expected "true" or "false", but found "${read}"`);
}

function valueNumber(reader: Reader): number {
  let numberString = "";
  let peeked = reader.peek(1);
  if (peeked === "-" || peeked === "+") {
    numberString += reader.read(1);
    peeked = reader.peek(1);
  }
  if (peeked === null) {
    throw new Error("Unexpected end of input");
  }
  if (peeked === ".") {
    numberString += reader.read(1);
    peeked = reader.peek(1);
    if (peeked === null) {
      throw new Error("Unexpected end of input");
    }
    if (peeked < "0" || peeked > "9") {
      throw new Error(`Expected digit, but found "${peeked}"`);
    }
    while (peeked !== null && peeked >= "0" && peeked <= "9") {
      numberString += reader.read(1);
      peeked = reader.peek(1);
    }
  } else if (peeked >= "0" && peeked <= "9") {
    while (peeked !== null && peeked >= "0" && peeked <= "9") {
      numberString += reader.read(1);
      peeked = reader.peek(1);
    }
    if (peeked === ".") {
      numberString += reader.read(1);
      peeked = reader.peek(1);
      if (peeked === null) {
        throw new Error("Unexpected end of input");
      }
      if (peeked < "0" || peeked > "9") {
        throw new Error(`Expected digit, but found "${peeked}"`);
      }
      while (peeked !== null && peeked >= "0" && peeked <= "9") {
        numberString += reader.read(1);
        peeked = reader.peek(1);
      }
    }
  } else {
    throw new Error(`Expected digit or ".", but found "${peeked}"`);
  }
  return Number(numberString);
}

export function valueString(reader: Reader): string {
  const quote = reader.read(1);
  if (quote !== `"` && quote !== `'`) {
    throw new Error(`Expected '"' or "'", but found "${quote}"`);
  }
  let string = "";
  let peeked = reader.peek(1);
  while (peeked !== null && peeked !== quote) {
    string += reader.read(1);
    peeked = reader.peek(1);
  }
  if (peeked === null) {
    throw new Error("Unexpected end of input");
  }
  reader.read(1); // consume the closing quote
  return string;
}

export function valueArray(reader: Reader): JsonArray {
  const openBracket = reader.read(1);
  if (openBracket !== "[") {
    throw new Error(`Expected "[", but found "${openBracket}"`);
  }
  const array: JsonArray = [];
  let peeked = reader.peek(1);
  while (peeked !== null && peeked !== "]") {
    array.push(value(reader));
    peeked = reader.peek(1);
    if (peeked === ",") {
      reader.read(1); // consume the comma
      peeked = reader.peek(1);
    } else if (peeked !== "]") {
      throw new Error(`Expected "," or "]", but found "${peeked}"`);
    }
  }
  if (peeked === null) {
    throw new Error("Unexpected end of input");
  }
  reader.read(1); // consume the closing bracket
  return array;
}

export function valueObject(reader: Reader): JsonObject {
  const openBrace = reader.read(1);
  if (openBrace !== "{") {
    throw new Error(`Expected "{", but found "${openBrace}"`);
  }
  const object: JsonObject = {};
  let peeked = reader.peek(1);
  while (peeked !== null && peeked !== "}") {
    const key = valueString(reader);
    peeked = reader.peek(1);
    whitespace(reader);
    if (peeked !== ":") {
      throw new Error(`Expected ":", but found "${peeked}"`);
    }
    reader.read(1); // consume the colon
    object[key] = value(reader);
    peeked = reader.peek(1);
    if (peeked === ",") {
      reader.read(1); // consume the comma
      peeked = reader.peek(1);
    } else if (peeked !== "}") {
      throw new Error(`Expected "," or "}", but found "${peeked}"`);
    }
  }
  if (peeked === null) {
    throw new Error("Unexpected end of input");
  }
  reader.read(1); // consume the closing brace
  return object;
}

function whitespace(reader: Reader) {}
