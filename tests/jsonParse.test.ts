import { expect, it } from "@jest/globals";
import { jsonParse, JsonValue } from "../src";

it("run", async () => {
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
  checkCase(`{"key":+4.2E+2}`, { key: 420 });
  checkCase(`{"key":-4.2E-2}`, { key: -0.042 });
  checkCase(`{"specialChars":"\\n\\t\\r"}`, { specialChars: "\n\t\r" });
  checkCase(`{"unicode":"✓"}`, { unicode: "✓" });
  checkCase(`{"escape":"\\\""}`, { escape: '"' });
  checkCase(`{"nested":{"array":[1,2,3],"object":{"key":"value"}}}`, {
    nested: { array: [1, 2, 3], object: { key: "value" } },
  });

  checkCase(
    `{
  // comments
  unquoted: 'and you can quote me on that',
  singleQuotes: 'I can use "double quotes" here',
  lineBreaks: "Look, Mom! \
No \\n's!",
  hexadecimal: 0xdecaf, /* another comment */
  leadingDecimalPoint: .8675309, andTrailing: 8675309.,
  positiveSign: +1,
  trailingComma: 'in objects', andIn: ['arrays',],
  "backwardsCompatible": "with JSON",
}`,
    {
      unquoted: "and you can quote me on that",
      singleQuotes: 'I can use "double quotes" here',
      lineBreaks: "Look, Mom! No \\n's!",
      hexadecimal: 0xdecaf,
      leadingDecimalPoint: 0.8675309,
      andTrailing: 8675309,
      positiveSign: +1,
      trailingComma: "in objects",
      andIn: ["arrays"],
      backwardsCompatible: "with JSON",
    },
  );
});

function checkCase(input: string, output: JsonValue) {
  expect(jsonParse(input)).toStrictEqual(output);
}
