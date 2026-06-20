export type JsonPrimitive = null | boolean | number | string;

export type JsonArray = JsonValue[];
export type JsonArrayReadonly = readonly JsonValueReadonly[];

export type JsonObject = { [key: string]: JsonValue | undefined };
export type JsonObjectReadonly = {
  readonly [key: string]: JsonValueReadonly | undefined;
};

export type JsonValue = JsonPrimitive | JsonArray | JsonObject;
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

export * from "./lib/codec";
export * from "./lib/compare";
export * from "./lib/decode";
export * from "./lib/parse";
export * from "./lib/preview";
export * from "./lib/stringify";
export * from "./lib/throw";
export * from "./lib/visitor";
