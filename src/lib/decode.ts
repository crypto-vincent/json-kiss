import {
  jsonArrayDeepCopy,
  jsonObjectDeepCopy,
  jsonValueDeepCopy,
} from "./copy";
import { jsonPreview } from "./preview";
import { jsonThrowWithExpected } from "./throw";
import {
  JsonArray,
  JsonDecoder,
  JsonNumberOpaque,
  JsonObject,
  JsonPrimitive,
  JsonStringOpaque,
  JsonValue,
  JsonValueReadonly,
} from "./types";
import { jsonVisitor } from "./visitor";

export const jsonValueDecoder: JsonDecoder<JsonValue> = jsonValueDeepCopy;

export const jsonBooleanDecoder: JsonDecoder<boolean> = jsonVisitor({
  boolean: (boolean) => boolean,
});
export const jsonNumberDecoder: JsonDecoder<number> = jsonVisitor({
  number: (number) => number,
});
export const jsonStringDecoder: JsonDecoder<string> = jsonVisitor({
  string: (string) => string,
});

export const jsonArrayDecoder: JsonDecoder<JsonArray> = jsonVisitor({
  array: (array) => jsonArrayDeepCopy(array),
});
export const jsonObjectDecoder: JsonDecoder<JsonObject> = jsonVisitor({
  object: (object) => jsonObjectDeepCopy(object),
});

export const jsonValueAsBooleanDecoder: JsonDecoder<boolean> = jsonVisitor({
  boolean: (boolean) => boolean,
  string: (string) => {
    if (string === "true") {
      return true;
    }
    if (string == "false") {
      return false;
    }
    jsonThrowWithExpected(`Boolean or "true"/"false"`, string);
  },
});

export const jsonValueAsNumberDecoder: JsonDecoder<number> = jsonVisitor({
  number: (number) => number,
  string: (string) => {
    if (string === "NaN") {
      return NaN;
    }
    const number = Number(string);
    if (!isNaN(number)) {
      return number;
    }
    jsonThrowWithExpected(`Number or numeric string`, string);
  },
});

export const jsonValueAsBigIntDecoder: JsonDecoder<bigint> = jsonVisitor({
  number: (number) => BigInt(number),
  string: (string) => {
    if (string.includes("_")) {
      return BigInt(string.replace(/_/g, ""));
    }
    return BigInt(string);
  },
});

export function jsonValueAsNullableDecoder<Content>(
  contentDecoder: (encoded: Exclude<JsonValueReadonly, null>) => Content,
): JsonDecoder<null | Content> {
  return (encoded) => {
    if (encoded === null) {
      return null;
    }
    return contentDecoder(encoded);
  };
}

export function jsonValueAsConstDecoder<
  const Values extends readonly JsonPrimitive[],
>(...values: Values): JsonDecoder<Values[number]> {
  return (encoded) => {
    for (const value of values) {
      if (encoded === value) {
        return value as Values[number];
      }
    }
    jsonThrowWithExpected(values.map(jsonPreview).join("/"), encoded);
  };
}

export const jsonNumberAsUnixDateDecoder: JsonDecoder<Date> = jsonVisitor({
  number: (number) => {
    const date = new Date(number * 1000);
    if (isNaN(date.getTime())) {
      jsonThrowWithExpected(
        "Date as number of seconds since Unix epoch",
        number,
      );
    }
    return date;
  },
});

export function jsonNumberAsOpaqueDecoder<
  const Opaque extends JsonNumberOpaque<any>,
>(): JsonDecoder<Opaque> {
  return jsonVisitor({ number: (number) => number as Opaque });
}

export const jsonStringAsIsoDateDecoder: JsonDecoder<Date> = jsonVisitor({
  string: (string) => {
    const date = new Date(string);
    if (isNaN(date.getTime())) {
      jsonThrowWithExpected("Date in ISO string format", string);
    }
    return date;
  },
});

export const jsonStringAsUrlDecoder: JsonDecoder<URL> = jsonVisitor({
  string: (string) => new URL(string),
});

export function jsonStringAsOpaqueDecoder<
  const Opaque extends JsonStringOpaque<any>,
>(): JsonDecoder<Opaque> {
  return jsonVisitor({ string: (string) => string as Opaque });
}

export function jsonArrayAsItemsDecoder<Item>(
  itemsDecoder: JsonDecoder<Item>,
): JsonDecoder<Item[]> {
  return jsonVisitor({
    array: (encoded) => {
      const decoded = new Array<Item>(encoded.length);
      for (let index = 0; index < encoded.length; index++) {
        const itemEncoded = encoded[index]!;
        const itemDecoded = internalScoped(index, itemEncoded, itemsDecoder);
        decoded[index] = itemDecoded;
      }
      return decoded;
    },
  });
}

export function jsonArrayAsTupleDecoder<
  const RequiredItems extends readonly any[] = [],
  const OptionalItems extends readonly any[] = [],
>(
  requiredItemDecoders: {
    readonly [K in keyof RequiredItems]: JsonDecoder<RequiredItems[K]>;
  },
  optionalItemDecoders: {
    readonly [K in keyof OptionalItems]: JsonDecoder<OptionalItems[K]>;
  } = [] as any,
): JsonDecoder<
  [
    ...RequiredItems,
    ...{ [K in keyof OptionalItems]?: OptionalItems[K] | undefined },
  ]
> {
  return jsonVisitor({
    array: (encoded) => {
      const requiredLength = requiredItemDecoders.length;
      if (encoded.length < requiredLength) {
        jsonThrowWithExpected(`Array with >${requiredLength} items`, encoded);
      }
      const decoded = new Array(encoded.length) as any;
      let position = 0;
      for (const itemDecoder of requiredItemDecoders) {
        const itemEncoded = encoded[position]!;
        const itemDecoded = internalScoped(position, itemEncoded, itemDecoder);
        decoded[position] = itemDecoded;
        position++;
      }
      for (const itemDecoder of optionalItemDecoders) {
        const itemEncoded = encoded[position];
        if (itemEncoded === undefined) {
          break;
        }
        const itemDecoded = internalScoped(position, itemEncoded, itemDecoder);
        decoded[position] = itemDecoded;
        position++;
      }
      return decoded;
    },
  });
}

export function jsonObjectAsValuesDecoder<
  const RequiredValues extends { [key: string]: any } = {},
  const OptionalValues extends { [key: string]: any } = {},
>(
  requiredValueDecoders: {
    [K in keyof RequiredValues]: JsonDecoder<RequiredValues[K]>;
  },
  optionalValueDecoders: {
    [K in keyof OptionalValues]: JsonDecoder<OptionalValues[K]>;
  } = {} as any,
): JsonDecoder<
  keyof OptionalValues extends never
    ? { [K in keyof RequiredValues]: RequiredValues[K] }
    : {
        [K in keyof RequiredValues]: RequiredValues[K];
      } & {
        [K in keyof OptionalValues]?: OptionalValues[K];
      }
> {
  const requiredKeys = Object.keys(requiredValueDecoders);
  const optionalKeys = Object.keys(optionalValueDecoders);
  for (const key of requiredKeys) {
    if (!Object.hasOwn(optionalValueDecoders, key)) {
      continue;
    }
    if (optionalValueDecoders[key] === undefined) {
      continue;
    }
    throw new Error(`Key "${key}" cannot be both required and optional`);
  }
  return jsonVisitor({
    object: (encoded) => {
      const decoded = {} as any;
      for (const key of requiredKeys) {
        if (!Object.hasOwn(encoded, key)) {
          jsonThrowWithExpected(`Object with key "${key}"`, encoded);
        }
        const valueEncoded = encoded[key];
        if (valueEncoded === undefined) {
          jsonThrowWithExpected(`Object with key "${key}"`, encoded);
        }
        const valueDecoder = requiredValueDecoders[key]!;
        const valueDecoded = internalScoped(key, valueEncoded, valueDecoder);
        decoded[key] = valueDecoded;
      }
      for (const key of optionalKeys) {
        if (!Object.hasOwn(encoded, key)) {
          continue;
        }
        const valueEncoded = encoded[key];
        if (valueEncoded === undefined) {
          continue;
        }
        const valueDecoder = optionalValueDecoders[key]!;
        const valueDecoded = internalScoped(key, valueEncoded, valueDecoder);
        decoded[key] = valueDecoded;
      }
      return decoded;
    },
  });
}

export function jsonObjectAsRecordDecoder<Value>(
  valuesDecoder: JsonDecoder<Value>,
): JsonDecoder<Record<string, Value>> {
  return jsonVisitor({
    object: (encoded) => {
      const decoded = {} as Record<string, Value>;
      for (const key in encoded) {
        if (!Object.hasOwn(encoded, key)) {
          continue;
        }
        const valueEncoded = encoded[key];
        if (valueEncoded === undefined) {
          continue;
        }
        const valueDecoded = internalScoped(key, valueEncoded, valuesDecoder);
        decoded[key] = valueDecoded;
      }
      return decoded;
    },
  });
}

export function jsonValueAsOutputDecoder<Decoded, Encoded>(
  innerDecoder: JsonDecoder<Encoded>,
  outerDecoder: (encoded: Encoded) => Decoded,
): JsonDecoder<Decoded> {
  return (encoded) => outerDecoder(innerDecoder(encoded));
}

function internalScoped<Input, Output>(
  scope: string | number,
  param: Input,
  logic: (param: Input) => Output,
): Output {
  try {
    return logic(param);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[${scope}]: ${message}`);
  }
}
