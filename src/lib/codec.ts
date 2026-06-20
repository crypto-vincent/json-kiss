import {
  type JsonArrayReadonly,
  type JsonNumberOpaque,
  type JsonObjectReadonly,
  type JsonPrimitive,
  type JsonStringOpaque,
  type JsonValueReadonly,
} from "..";
import {
  jsonArrayAsItemsDecoder,
  jsonArrayAsTupleDecoder,
  jsonArrayDecoder,
  jsonBooleanDecoder,
  JsonDecoder,
  jsonNumberAsOpaqueDecoder,
  jsonNumberAsUnixDateDecoder,
  jsonNumberDecoder,
  jsonObjectAsRecordDecoder,
  jsonObjectAsValuesDecoder,
  jsonObjectDecoder,
  jsonStringAsIsoDateDecoder,
  jsonStringAsOpaqueDecoder,
  jsonStringAsPrefixedDecoder,
  jsonStringAsUrlDecoder,
  jsonStringDecoder,
  jsonValueAsBigIntDecoder,
  jsonValueAsBooleanDecoder,
  jsonValueAsConstDecoder,
  jsonValueAsNullableDecoder,
  jsonValueAsNumberDecoder,
  jsonValueAsOutputDecoder,
  jsonValueDecoder,
} from "./decode";

export type JsonEncoder<Content> = (decoded: Content) => JsonValueReadonly;
export type JsonCodec<Content> = {
  decoder: JsonDecoder<Content>;
  encoder: JsonEncoder<Content>;
};

export type JsonEncoderContent<Encoder> =
  Encoder extends JsonEncoder<infer Content> ? Content : never;
export type JsonCodecContent<Codec> =
  Codec extends JsonCodec<infer Content> ? Content : never;
export type JsonDecoderContent<Decoder> =
  Decoder extends JsonDecoder<infer Content> ? Content : never;

export const jsonValueCodec: JsonCodec<JsonValueReadonly> = {
  decoder: jsonValueDecoder,
  encoder: (decoded) => decoded,
};

export const jsonBooleanCodec: JsonCodec<boolean> = {
  decoder: jsonBooleanDecoder,
  encoder: (decoded) => decoded,
};
export const jsonNumberCodec: JsonCodec<number> = {
  decoder: jsonNumberDecoder,
  encoder: (decoded) => decoded,
};
export const jsonStringCodec: JsonCodec<string> = {
  decoder: jsonStringDecoder,
  encoder: (decoded) => decoded,
};

export const jsonArrayCodec: JsonCodec<JsonArrayReadonly> = {
  decoder: jsonArrayDecoder,
  encoder: (decoded) => decoded,
};
export const jsonObjectCodec: JsonCodec<JsonObjectReadonly> = {
  decoder: jsonObjectDecoder,
  encoder: (decoded) => decoded,
};

export const jsonValueAsBooleanCodec: JsonCodec<boolean> = {
  decoder: jsonValueAsBooleanDecoder,
  encoder: (decoded) => decoded,
};
export const jsonValueAsNumberCodec: JsonCodec<number> = {
  decoder: jsonValueAsNumberDecoder,
  encoder: (decoded: number) => {
    if (isNaN(decoded)) {
      return "NaN";
    }
    if (decoded === Infinity) {
      return "Infinity";
    }
    if (decoded === -Infinity) {
      return "-Infinity";
    }
    return decoded;
  },
};

export function jsonValueAsConstCodec<
  const Values extends Array<JsonPrimitive>,
>(...values: Values): JsonCodec<Values[number]> {
  return {
    decoder: jsonValueAsConstDecoder(...values),
    encoder: (decoded) => decoded,
  };
}

export const jsonValueAsBigIntCodec: JsonCodec<bigint> = {
  decoder: jsonValueAsBigIntDecoder,
  encoder: (decoded) => decoded.toString(),
};

export const jsonNumberAsUnixDateCodec: JsonCodec<Date> = {
  decoder: jsonNumberAsUnixDateDecoder,
  encoder: (decoded) => decoded.getTime() / 1000,
};

export function jsonNumberAsOpaqueCodec<
  const Opaque extends JsonNumberOpaque<any>,
>(): JsonCodec<Opaque> {
  return {
    decoder: jsonNumberAsOpaqueDecoder<Opaque>(),
    encoder: (decoded) => decoded as number,
  };
}

export const jsonStringAsIsoDateCodec: JsonCodec<Date> = {
  decoder: jsonStringAsIsoDateDecoder,
  encoder: (decoded) => decoded.toISOString(),
};

export const jsonStringAsUrlCodec: JsonCodec<URL> = {
  decoder: jsonStringAsUrlDecoder,
  encoder: (decoded) => decoded.toString(),
};

export function jsonStringAsPrefixedCodec<const Prefix extends string>(
  prefix: Prefix,
): JsonCodec<`${Prefix}${string}`> {
  return {
    decoder: jsonStringAsPrefixedDecoder<Prefix>(prefix),
    encoder: (decoded) => decoded,
  };
}

export function jsonStringAsOpaqueCodec<
  const Opaque extends JsonStringOpaque<any>,
>(): JsonCodec<Opaque> {
  return {
    decoder: jsonStringAsOpaqueDecoder<Opaque>(),
    encoder: (decoded) => decoded as string,
  };
}

export function jsonArrayAsItemsCodec<Item>(
  itemsCodec: JsonCodec<Item>,
): JsonCodec<Array<Item>> {
  return {
    decoder: jsonArrayAsItemsDecoder(itemsCodec.decoder),
    encoder: (decoded) => decoded.map(itemsCodec.encoder),
  };
}

export function jsonArrayAsTupleCodec<
  const RequiredItems extends Array<any> = [],
  const OptionalItems extends Array<any> = [],
>(
  requiredItemCodecs: {
    [K in keyof RequiredItems]: JsonCodec<RequiredItems[K]>;
  },
  optionalItemCodecs: {
    [K in keyof OptionalItems]: JsonCodec<OptionalItems[K]>;
  } = [] as any,
): JsonCodec<
  [
    ...RequiredItems,
    ...{ [K in keyof OptionalItems]?: OptionalItems[K] | undefined },
  ]
> {
  return {
    decoder: jsonArrayAsTupleDecoder(
      requiredItemCodecs.map((codec) => codec.decoder),
      optionalItemCodecs.map((codec) => codec.decoder),
    ) as any,
    encoder: (decoded) => {
      const encoded = new Array<JsonValueReadonly>(decoded.length);
      let position = 0;
      for (const itemCodec of requiredItemCodecs) {
        const itemDecoded = decoded[position]!;
        const itemEncoded = itemCodec.encoder(itemDecoded);
        encoded[position] = itemEncoded;
        position++;
      }
      for (const itemCodec of optionalItemCodecs) {
        const itemDecoded = decoded[position]!;
        if (itemDecoded === undefined) {
          break;
        }
        const itemEncoded = itemCodec.encoder(itemDecoded);
        encoded[position] = itemEncoded;
        position++;
      }
      return encoded;
    },
  };
}

export function jsonObjectAsValuesCodec<
  const RequiredValues extends { [key: string]: any } = {},
  const OptionalValues extends { [key: string]: any } = {},
>(
  requiredValueCodecs: {
    [K in keyof RequiredValues]: JsonCodec<RequiredValues[K]>;
  },
  optionalValueCodecs: {
    [K in keyof OptionalValues]: JsonCodec<OptionalValues[K]>;
  } = {} as any,
): JsonCodec<
  keyof OptionalValues extends never
    ? { [K in keyof RequiredValues]: RequiredValues[K] }
    : {
        [K in keyof RequiredValues]: RequiredValues[K];
      } & {
        [K in keyof OptionalValues]?: OptionalValues[K];
      }
> {
  for (const key in requiredValueCodecs) {
    if (optionalValueCodecs[key] !== undefined) {
      throw new Error(`Key "${key}" cannot be both required and optional`);
    }
  }
  const requiredValueDecoders = {} as any;
  for (const key in requiredValueCodecs) {
    requiredValueDecoders[key] = requiredValueCodecs[key]!.decoder;
  }
  const optionalValueDecoders = {} as any;
  for (const key in optionalValueCodecs) {
    optionalValueDecoders[key] = optionalValueCodecs[key]!.decoder;
  }
  return {
    decoder: jsonObjectAsValuesDecoder(
      requiredValueDecoders,
      optionalValueDecoders,
    ) as any,
    encoder: (decoded) => {
      const encoded = {} as { [key: string]: JsonValueReadonly };
      for (const key in requiredValueCodecs) {
        const valueDecoded = decoded[key];
        const valueEncoder = requiredValueCodecs[key]!.encoder;
        const valueEncoded = valueEncoder(valueDecoded as any);
        encoded[key] = valueEncoded;
      }
      for (const key in optionalValueCodecs) {
        const valueDecoded = decoded[key];
        if (valueDecoded === undefined) {
          continue;
        }
        const valueEncoder = optionalValueCodecs[key]!.encoder;
        const valueEncoded = valueEncoder(valueDecoded);
        encoded[key] = valueEncoded;
      }
      return encoded;
    },
  };
}

export function jsonObjectAsRecordCodec<Value>(
  valuesCodec: JsonCodec<Value>,
): JsonCodec<Record<string, Value>> {
  const valueEncoder = valuesCodec.encoder;
  return {
    decoder: jsonObjectAsRecordDecoder(valuesCodec.decoder),
    encoder: (decoded) => {
      const encoded = {} as { [key: string]: JsonValueReadonly };
      for (const key in decoded) {
        const valueDecoded = decoded[key]!;
        const valueEncoded = valueEncoder(valueDecoded);
        encoded[key] = valueEncoded;
      }
      return encoded;
    },
  };
}

export function jsonValueAsNullableCodec<Content>(
  contentCodec: JsonCodec<Exclude<Content, null>>,
): JsonCodec<null | Content> {
  return {
    decoder: jsonValueAsNullableDecoder(contentCodec.decoder),
    encoder: (decoded) => {
      if (decoded === null) {
        return null;
      }
      return contentCodec.encoder(decoded as Exclude<Content, null>);
    },
  };
}

export function jsonValueAsOutputCodec<Decoded, Encoded>(
  innerCodec: JsonCodec<Encoded>,
  outerCodec: {
    decoder: (encoded: Encoded) => Decoded;
    encoder: (decoded: Decoded) => Encoded;
  },
): JsonCodec<Decoded> {
  return {
    decoder: jsonValueAsOutputDecoder(innerCodec.decoder, outerCodec.decoder),
    encoder: (decoded: Decoded) => {
      return innerCodec.encoder(outerCodec.encoder(decoded));
    },
  };
}
