export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export type JsonPrimitive = null | boolean | number | string;

export type JsonArray = JsonValue[];
export type JsonArrayReadonly = readonly JsonValueReadonly[];

export type JsonObject = { [key: string]: JsonValue | undefined };
export type JsonObjectReadonly = {
  readonly [key: string]: JsonValueReadonly | undefined;
};

export type JsonValueReadonly =
  | JsonPrimitive
  | JsonArrayReadonly
  | JsonObjectReadonly;

export type JsonNumberOpaque<Tag> =
  | (number & { readonly __brand: Tag })
  | { readonly __unique: never };
export type JsonStringOpaque<Tag> =
  | (string & { readonly __brand: Tag })
  | { readonly __unique: never };

export type JsonDecoder<Content> = (encoded: JsonValueReadonly) => Content;
export type JsonEncoder<Content> = (decoded: Content) => JsonValue;
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
