import { expect, it } from "@jest/globals";
import { jsonParse, JsonValue } from "../src";

it("run", async () => {
  // Can you invert the parameters here:
  checkCase(`{"hello":"42"}`, { hello: "42" });
  checkCase(`{"hello":42}`, { hello: 42 });
  checkCase(`{"key":"value"}`, { key: "value" });
  checkCase(`{"number":123}`, { number: 123 });
  checkCase(`{"boolean":true}`, { boolean: true });
  checkCase(`{"nullValue":null}`, { nullValue: null });
  checkCase(`{"array":[1,2,3]}`, { array: [1, 2, 3] });
  checkCase(`{"nested":{"a":1,"b":2}}`, { nested: { a: 1, b: 2 } });
  checkCase(`{"emptyObject":{}}`, { emptyObject: {} });
  checkCase(`{"emptyArray":[]}`, { emptyArray: [] });
  checkCase(`{"mixed":[1,"two",true,null]}`, { mixed: [1, "two", true, null] });
  checkCase(`{"specialChars":"\\n\\t\\r"}`, { specialChars: "\n\t\r" });
  checkCase(`{"unicode":"✓"}`, { unicode: "✓" });
  checkCase(`{"escape":"\\\""}`, { escape: '"' });
});

function checkCase(input: string, output: JsonValue) {
  expect(jsonParse(input)).toStrictEqual(output);
}
