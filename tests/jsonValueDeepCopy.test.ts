import { expect, it } from "@jest/globals";
import { JsonValue } from "../src";
import { jsonValueDeepCopy } from "../src/lib/copy";

it("run", async () => {
  checkRoundTrip({ key: "Hello World" });
  checkRoundTrip({ number: 42 });
  checkRoundTrip({ boolean: true });
  checkRoundTrip({ nullValue: null });
  checkRoundTrip({ array: [1, "two", true, null] });
  checkRoundTrip({ nested: { a: 1, b: 2 } });
  checkRoundTrip({ emptyObject: {} });
  checkRoundTrip({ emptyArray: [] });
});

function checkRoundTrip(value: JsonValue) {
  expect(jsonValueDeepCopy(value)).toStrictEqual(value);
}
