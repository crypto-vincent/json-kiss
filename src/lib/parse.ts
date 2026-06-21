import { JsonArray, JsonObject, JsonValue } from "./types";

/**
 * Parses a JSON string into a {@link JsonValue}.
 * @param string The JSON string to parse.
 * @returns The parsed {@link JsonValue}.
 */
export function jsonParse(
  string: string,
  config?: { strict?: boolean },
): JsonValue {
  if (config?.strict) {
    return JSON.parse(string) as JsonValue;
  }
  const reader = new Reader(string);
  consumeWhitespacesAndComments(reader);
  const result = consumeValue(reader);
  consumeWhitespacesAndComments(reader);
  reader.consumeWhile(() => {
    return reader.throwContext("Expected end of input");
  });
  return result;
}

function consumeValue(reader: Reader): JsonValue {
  if (reader.consumePrefix("null")) {
    return null;
  }
  if (reader.consumePrefix("true")) {
    return true;
  }
  if (reader.consumePrefix("false")) {
    return false;
  }
  const next = reader.popOrThrow(1);
  if (next === `"` || next === `'`) {
    return consumeString(next, reader);
  }
  if (next === `[`) {
    return consumeArray(reader);
  }
  if (next === `{`) {
    return consumeObject(reader);
  }
  return consumeNumber(next, reader);
}

export function consumeString(quote: string, reader: Reader): string {
  const parts = new Array<string>();
  while (true) {
    const next = reader.popOrThrow(1);
    if (next === quote) {
      return parts.join("");
    }
    if (next === "\\") {
      parts.push(consumeEscapedChar(reader));
    } else {
      parts.push(next);
    }
  }
}

export function consumeArray(reader: Reader): JsonArray {
  const array: JsonArray = [];
  while (true) {
    consumeWhitespacesAndComments(reader);
    if (reader.consumePrefix("]")) {
      return array;
    }
    array.push(consumeValue(reader));
    consumeWhitespacesAndComments(reader);
    if (reader.consumePrefix("]")) {
      return array;
    }
    if (!reader.consumePrefix(",")) {
      reader.throwContext("Expected ',' or ']'");
    }
  }
}

export function consumeObject(reader: Reader): JsonObject {
  const object: JsonObject = {};
  while (true) {
    consumeWhitespacesAndComments(reader);
    if (reader.consumePrefix("}")) {
      return object;
    }
    const next = reader.popOrThrow(1);
    let key;
    if (next === `"` || next === `'`) {
      key = consumeString(next, reader);
    } else {
      key = `${next}${reader.consumeWhile(isIdentifierChar)}`;
    }
    consumeWhitespacesAndComments(reader);
    if (!reader.consumePrefix(":")) {
      reader.throwContext("Expected ':' after object key");
    }
    consumeWhitespacesAndComments(reader);
    object[key] = consumeValue(reader);
    consumeWhitespacesAndComments(reader);
    if (reader.consumePrefix("}")) {
      return object;
    }
    if (!reader.consumePrefix(",")) {
      reader.throwContext("Expected ',' or '}'");
    }
  }
}

function consumeNumber(head: string, reader: Reader): number {
  const tail = reader.consumeWhile(isNumberChar);
  const real = `${head}${tail}`;
  if (real === "NaN") {
    return NaN;
  }
  const value = Number(real);
  if (isNaN(value)) {
    reader.throwContext(`Invalid number: ${real}`);
  }
  return value;
}

function consumeEscapedChar(reader: Reader): string {
  const prefix = reader.popOrThrow(1);
  switch (prefix) {
    case `\r`:
      return ``;
    case `\n`:
      return ``;
    case `"`:
      return `"`;
    case `'`:
      return `'`;
    case `\\`:
      return `\\`;
    case `/`:
      return `/`;
    case `n`:
      return `\n`;
    case `r`:
      return `\r`;
    case `t`:
      return `\t`;
    case `b`:
      return `\b`;
    case `f`:
      return `\f`;
    case "v":
      return `\v`;
    case "0":
      return `\0`;
    case "x": {
      const hex = reader.popOrThrow(2);
      const code = parseInt(hex, 16);
      if (isNaN(code)) {
        reader.throwContext(`Invalid hex escape sequence: \\x${hex}`);
      }
      return String.fromCharCode(code);
    }
    case `u`: {
      const hex = reader.popOrThrow(4);
      const code = parseInt(hex, 16);
      if (isNaN(code)) {
        reader.throwContext(`Invalid unicode escape sequence: \\u${hex}`);
      }
      return String.fromCharCode(code);
    }
    default:
      reader.throwContext(`Unexpected escape character: ${prefix}`);
  }
}

function consumeWhitespacesAndComments(reader: Reader) {
  while (true) {
    reader.consumeWhile(isWhitespaceChar);
    if (reader.consumePrefix("//")) {
      reader.consumeWhile(isNotLineReturnChar);
      continue;
    }
    if (reader.consumePrefix("/*")) {
      reader.consumeWhile(isEndOfMultilineComment);
      continue;
    }
    break;
  }
}

class Reader {
  #value: string;
  #index: number;
  constructor(value: string) {
    this.#value = value;
    this.#index = 0;
  }
  popOrThrow(length: number): string {
    if (this.#index + length > this.#value.length) {
      this.throwContext("Unexpected end of input");
    }
    const result = this.#value.slice(this.#index, this.#index + length);
    this.#index += length;
    return result;
  }
  consumePrefix(prefix: string): boolean {
    if (this.#value.startsWith(prefix, this.#index)) {
      this.#index += prefix.length;
      return true;
    }
    return false;
  }
  consumeWhile(predicate: (next: string, reader: Reader) => boolean): string {
    const start = this.#index;
    while (this.#index < this.#value.length) {
      if (!predicate(this.#value[this.#index]!, this)) {
        break;
      }
      this.#index++;
    }
    return this.#value.slice(start, this.#index);
  }
  throwContext(message: string): never {
    if (this.#index >= this.#value.length) {
      throw new Error(
        `JSON parsing error: ${message}: ${this.#value.slice(this.#index - 20, this.#index)}...`,
      );
    } else {
      throw new Error(
        `JSON parsing error: ${message}: "${this.#value.slice(this.#index, this.#index + 20)}..."`,
      ); // TODO - error message with context
    }
  }
}

function isEndOfMultilineComment(_: string, reader: Reader) {
  return reader.consumePrefix("*/") === false;
}

function isNotLineReturnChar(value: string) {
  return value !== "\n" && value !== "\r";
}

function isNumberChar(value: string) {
  return numberCharSet.has(value);
}

function isWhitespaceChar(value: string) {
  return whitespaceCharSet.has(value);
}

function isIdentifierChar(value: string) {
  if (isWhitespaceChar(value)) {
    return false;
  }
  if (value === ":") {
    return false;
  }
  if (value === ";") {
    return false;
  }
  return true;
}

const numberCharSet = new Set(
  [
    [".", "+", "-", "_"],
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"],
    ["n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
    ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  ].flat(),
);

const whitespaceCharSet = new Set([" ", "\n", "\r", "\t", "\v", "\f"]);
