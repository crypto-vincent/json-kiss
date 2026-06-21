import { expect, it } from "@jest/globals";
import { jsonStringify, JsonValue } from "../src";

it("run", async () => {
  checkCompactCase({ hello: "42" }, `{"hello":"42"}`);
  checkCompactCase({ hello: 42 }, `{"hello":42}`);
  checkCompactCase({ key: "value" }, `{"key":"value"}`);
  checkCompactCase({ number: 123 }, `{"number":123}`);
  checkCompactCase({ boolean: true }, `{"boolean":true}`);
  checkCompactCase({ nullValue: null }, `{"nullValue":null}`);
  checkCompactCase({ array: [1, 2, 3] }, `{"array":[1,2,3]}`);
  checkCompactCase({ nested: { a: 1, b: 2 } }, `{"nested":{"a":1,"b":2}}`);
  checkCompactCase({ emptyObject: {} }, `{"emptyObject":{}}`);
  checkCompactCase({ emptyArray: [] }, `{"emptyArray":[]}`);
  checkCompactCase({ m: [1, "two", true, null] }, `{"m":[1,"two",true,null]}`);
  checkCompactCase({ specialChars: "\n\t\r" }, `{"specialChars":"\\n\\t\\r"}`);
  checkCompactCase({ unicode: "✓" }, `{"unicode":"✓"}`);
  checkCompactCase({ escape: '"' }, `{"escape":"\\\""}`);
});

function checkCompactCase(value: JsonValue, output: string) {
  expect(jsonStringify(value)).toStrictEqual(output);
}
