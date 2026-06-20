import {
  type JsonArrayReadonly,
  type JsonNumberOpaque,
  type JsonObjectReadonly,
  type JsonPrimitive,
  type JsonStringOpaque,
  type JsonValueReadonly,
} from "..";
import { jsonPreview } from "./preview";
import { jsonThrowWithExpected } from "./throw";
import { jsonVisitor } from "./visitor";

export type JsonDecoder<Content> = (encoded: JsonValueReadonly) => Content;

export function jsonValueByKindDecoder<Content>(decoders: {
  null?: (value: null) => Content;
  boolean?: (value: boolean) => Content;
  number?: (value: number) => Content;
  string?: (value: string) => Content;
  array?: (value: JsonArrayReadonly) => Content;
  object?: (value: JsonObjectReadonly) => Content;
}): JsonDecoder<Content> {
  return jsonVisitor(decoders) as JsonDecoder<Content>;
}

export const jsonBooleanDecoder: JsonDecoder<boolean> = jsonValueByKindDecoder({
  boolean: (boolean) => boolean,
});
export const jsonNumberDecoder: JsonDecoder<number> = jsonValueByKindDecoder({
  number: (number) => number,
});
export const jsonStringDecoder: JsonDecoder<string> = jsonValueByKindDecoder({
  string: (string) => string,
});

export const jsonArrayDecoder: JsonDecoder<JsonArrayReadonly> =
  jsonValueByKindDecoder({
    array: (array) => array,
  });
export const jsonObjectDecoder: JsonDecoder<JsonObjectReadonly> =
  jsonValueByKindDecoder({
    object: (object) => object,
  });

export const jsonValueDecoder = jsonValueByKindDecoder<JsonValueReadonly>({
  null: (value) => value,
  boolean: (value) => value,
  number: (value) => value,
  string: (value) => value,
  array: (value) => value,
  object: (value) => value,
});

export const jsonValueAsBooleanDecoder: JsonDecoder<boolean> =
  jsonValueByKindDecoder({
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
export const jsonValueAsNumberDecoder: JsonDecoder<number> =
  jsonValueByKindDecoder({
    number: (number) => number,
    string: (string) => {
      if (string === "NaN") {
        return NaN;
      }
      if (string === "Infinity") {
        return Infinity;
      }
      if (string === "-Infinity") {
        return -Infinity;
      }
      const number = Number(string);
      if (isFinite(number)) {
        return number;
      }
      jsonThrowWithExpected(`Number or "NaN"/"Infinity"`, string);
    },
  });

export function jsonValueAsConstDecoder<
  const Values extends Array<JsonPrimitive>,
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

export const jsonValueAsBigIntDecoder: JsonDecoder<bigint> =
  jsonValueByKindDecoder({
    number: (number) => BigInt(number),
    string: (string) => {
      if (string.includes("_")) {
        return BigInt(string.replace(/_/g, ""));
      }
      return BigInt(string);
    },
  });

export const jsonNumberAsUnixDateDecoder: JsonDecoder<Date> =
  jsonValueByKindDecoder({
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

export const jsonStringAsIsoDateDecoder: JsonDecoder<Date> =
  jsonValueByKindDecoder({
    string: (string) => {
      const date = new Date(string);
      if (isNaN(date.getTime())) {
        jsonThrowWithExpected("Date in ISO string format", string);
      }
      return date;
    },
  });

export const jsonStringAsUrlDecoder: JsonDecoder<URL> = jsonValueByKindDecoder({
  string: (string) => new URL(string),
});

export function jsonStringAsPrefixedDecoder<const Prefix extends string>(
  prefix: Prefix,
): JsonDecoder<`${Prefix}${string}`> {
  return jsonValueByKindDecoder({
    string: (string) => {
      if (string.startsWith(prefix)) {
        return string as `${Prefix}${string}`;
      }
      jsonThrowWithExpected(`String starting with "${prefix}"`, string);
    },
  });
}

export function jsonNumberAsOpaqueDecoder<
  const Opaque extends JsonNumberOpaque<any>,
>(): JsonDecoder<Opaque> {
  return jsonValueByKindDecoder({
    number: (number) => number as Opaque,
  });
}

export function jsonStringAsOpaqueDecoder<
  const Opaque extends JsonStringOpaque<any>,
>(): JsonDecoder<Opaque> {
  return jsonValueByKindDecoder({
    string: (string) => string as Opaque,
  });
}

export function jsonArrayAsItemsDecoder<Item>(
  itemsDecoder: JsonDecoder<Item>,
): JsonDecoder<Array<Item>> {
  return jsonValueByKindDecoder({
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
  const RequiredItems extends Array<any> = [],
  const OptionalItems extends Array<any> = [],
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
  return jsonValueByKindDecoder({
    array: (encoded) => {
      const requiredLength = requiredItemDecoders.length;
      if (encoded.length < requiredLength) {
        jsonThrowWithExpected(
          `Array of at least ${requiredLength} items`,
          encoded,
        );
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
  for (const key in requiredValueDecoders) {
    if (optionalValueDecoders[key] !== undefined) {
      throw new Error(`Key "${key}" cannot be both required and optional`);
    }
  }
  return jsonValueByKindDecoder({
    object: (encoded) => {
      const decoded = {} as any;
      for (const key in requiredValueDecoders) {
        const valueEncoded = encoded[key];
        if (valueEncoded === undefined) {
          jsonThrowWithExpected(`Object with required key "${key}"`, encoded);
        }
        const valueDecoder = requiredValueDecoders[key]!;
        const valueDecoded = internalScoped(key, valueEncoded, valueDecoder);
        decoded[key] = valueDecoded;
      }
      for (const key in optionalValueDecoders) {
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
  return jsonValueByKindDecoder({
    object: (encoded) => {
      const decoded = {} as Record<string, Value>;
      for (const key in encoded) {
        const valueEncoded = encoded[key]!;
        const valueDecoded = internalScoped(key, valueEncoded, valuesDecoder);
        decoded[key] = valueDecoded;
      }
      return decoded;
    },
  });
}

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
