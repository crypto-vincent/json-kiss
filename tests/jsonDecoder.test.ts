import { expect, it } from "@jest/globals";
import {
  jsonArrayAsItemsDecoder,
  jsonArrayAsTupleDecoder,
  jsonBooleanDecoder,
  JsonDecoder,
  jsonNumberAsUnixDateDecoder,
  jsonNumberDecoder,
  jsonObjectAsRecordDecoder,
  jsonObjectAsValuesDecoder,
  jsonStringAsIsoDateDecoder,
  jsonStringAsUrlDecoder,
  jsonStringDecoder,
  jsonValueAsBigIntDecoder,
  jsonValueAsConstDecoder,
  jsonValueAsNullableDecoder,
  jsonValueAsNumberDecoder,
  JsonValueReadonly,
} from "../src";

// TODO - a better nicer API would be like json.Decoder.number() like ?

it("run", async () => {
  checkCase({
    decoder: jsonObjectAsValuesDecoder({ helloWorld: jsonNumberDecoder }),
    encoded: { helloWorld: 1, invisible: undefined },
    decoded: { helloWorld: 1 },
  });
  checkCase({
    decoder: jsonObjectAsValuesDecoder({ toString: jsonNumberDecoder }),
    encoded: { toString: 12, invisible: undefined },
    decoded: { toString: 12 },
  });
  checkCase({
    decoder: jsonObjectAsValuesDecoder({}, { toString: jsonNumberDecoder }),
    encoded: {},
    decoded: {} as any, // TODO - fix this type issue
  });
  checkCase({
    decoder: jsonObjectAsValuesDecoder(
      {} as any, // TODO - fix this type issue
      { toString: jsonNumberDecoder },
    ),
    encoded: { toString: 12 },
    decoded: { toString: 12 },
  });
  checkCase({
    decoder: jsonObjectAsValuesDecoder({
      n1: jsonValueAsBigIntDecoder,
      n2: jsonValueAsBigIntDecoder,
    }),
    encoded: { n1: "-42", n2: "1_000_000_000_000_000_000_000_000" },
    decoded: { n1: -42n, n2: 1000000000000000000000000n },
  });
  checkCase({
    decoder: jsonObjectAsValuesDecoder({
      outer: jsonObjectAsValuesDecoder({
        inner: jsonObjectAsValuesDecoder({ value: jsonNumberDecoder }),
      }),
    }),
    encoded: { outer: { inner: { value: 10 } } },
    decoded: { outer: { inner: { value: 10 } } },
  });
  checkCase({
    decoder: jsonObjectAsValuesDecoder({
      nullables: jsonArrayAsItemsDecoder(
        jsonValueAsNullableDecoder(jsonBooleanDecoder),
      ),
    }),
    encoded: { nullables: [null, true, false, null] },
    decoded: { nullables: [null, true, false, null] },
  });
  checkCase({
    decoder: jsonObjectAsValuesDecoder({
      dateAsUnix: jsonNumberAsUnixDateDecoder,
      dateAsIso: jsonStringAsIsoDateDecoder,
      urlHref: jsonStringAsUrlDecoder,
    }),
    encoded: {
      dateAsUnix: date.getTime() / 1000,
      dateAsIso: date.toISOString(),
      urlHref: url.href,
    },
    decoded: {
      dateAsUnix: date,
      dateAsIso: date,
      urlHref: url,
    },
  });
  checkCase({
    decoder: jsonArrayAsItemsDecoder(jsonNumberDecoder),
    encoded: [6, 7],
    decoded: [6, 7],
  });
  checkCase({
    decoder: jsonArrayAsItemsDecoder(jsonValueAsNumberDecoder),
    encoded: [42, "42", "NaN", "Infinity", "-Infinity", Infinity, "0x42"],
    decoded: [42, 42, NaN, Infinity, -Infinity, Infinity, 66],
  });
  checkCase({
    decoder: jsonArrayAsItemsDecoder(jsonValueAsConstDecoder(8, "Hello", null)),
    encoded: [null, "Hello", null],
    decoded: [null, "Hello", null],
  });
  checkCase({
    decoder: jsonArrayAsItemsDecoder(
      jsonObjectAsValuesDecoder({ value: jsonNumberDecoder }),
    ),
    encoded: [{ value: 6 }, { value: 7 }],
    decoded: [{ value: 6 }, { value: 7 }],
  });
  checkCase({
    decoder: jsonArrayAsTupleDecoder([jsonNumberDecoder, jsonStringDecoder]),
    encoded: [42, "hello"],
    decoded: [42, "hello"],
  });
  checkCase({
    decoder: jsonArrayAsTupleDecoder([jsonNumberDecoder], [jsonStringDecoder]),
    encoded: [42, "hello"],
    decoded: [42, "hello"],
  });
  checkCase({
    decoder: jsonArrayAsTupleDecoder([jsonNumberDecoder], [jsonStringDecoder]),
    encoded: [42],
    decoded: [42],
  });
  // TODO - handle enums ?
  /*
  checkCase({
    encoded: { case1: "100" },
    decoder: jsonDecoderObjectToEnum({
      case1: jsonDecoderBigInt,
      case2: jsonStringDecoder,
    }),
    decoded: { case1: 100n },
  }); 
  checkCase({
    encoded: { case2: { hello: "world" } },
    decoder: jsonDecoderObjectToEnum({
      toString: jsonDecoderBigInt,
      case2: jsonObjectAsValuesDecoder({
        hello: jsonStringDecoder,
      }),
      toString: jsonBooleanDecoder,
    }),
    decoded: { case2: { hello: "world" } },
  });
  */
  checkCase({
    decoder: jsonObjectAsRecordDecoder(
      jsonValueAsNullableDecoder(jsonNumberDecoder),
    ),
    encoded: { hello: 888, world: null },
    decoded: { hello: 888, world: null },
  });
  checkCase({
    decoder: jsonObjectAsRecordDecoder(jsonNumberDecoder),
    encoded: { toString: undefined, world: 999 },
    decoded: { world: 999 },
  });
});

function checkCase<Decoded>(params: {
  decoder: JsonDecoder<Decoded>;
  encoded: JsonValueReadonly;
  decoded: Decoded;
}) {
  expect(params.decoder(params.encoded)).toStrictEqual(params.decoded);
}

const date = new Date();
const url = new URL("https://example.com");
