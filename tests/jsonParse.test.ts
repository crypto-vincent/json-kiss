import { expect, it } from "@jest/globals";
import { jsonParse, JsonValue } from "../src";

const dummyCases = {
  "null": null,
  "true": true,
  "false": false,
  "42": 42,
  "42.": 42,
  ".42": 0.42,
  "4.2": 4.2,
  "-4.2": -4.2,
  "-4.2E+21": -4.2e21,
  "-4.2E-21": -4.2e-21,
  "0xCAFE": 0xcafe,
  "0xcafe": 0xcafe,
  '"hello"': "hello",
  "'hello'": "hello",
  "[]": [],
  "{}": {},
  "'\\u65E5\\uD83D\\uDE00'": "日😀",
  "'\\xDE'": "Þ",
  "'\\n\\t\\r\\b\\\\'": "\n\t\r\b\\",
  "[42,]": [42],
  "[1, 'two', true, null]": [1, "two", true, null],
  "\t{\tk\t:\t42\t,\t}\t": { k: 42 },
  '"unicode 😀✓π日"': "unicode 😀✓π日",
};

it("run", async () => {
  for (const [json, value] of Object.entries(dummyCases)) {
    checkCase(`${json} // after comment`, value);
    checkCase(`/*before*/ [${json},]`, [value]);
    checkCase(`{"key1":${json},"key2":${json}}`, { key1: value, key2: value });
    checkCase(`{'key1':${json},'key2':${json}}`, { key1: value, key2: value });
    checkCase(`{key1:${json},key2:${json}}`, { key1: value, key2: value });
    checkCase(`[${json},${json}]`, [value, value]);
    checkCase(`[\n/*comment*/${json},//comment\n${json}\n]`, [value, value]);
  }
  checkCase(
    `{
      /*comment*/ // comments
      // another comment
      unquoted: 'and you can quote me on that',
      singleQuotes: 'I can use "double quotes" here',
      lineBreaks: "Look, Mom! \\\nNo \\n's!",
      hexadecimal: 0xdecaf, /* another comment */
      leadingDecimalPoint: .8675309, andTrailing: 8675309.,
      positiveSign: +1,
      trailingComma: 'in objects', andIn: ['arrays',],
      "backwardsCompatible": "with JSON",
    }`,
    {
      unquoted: "and you can quote me on that",
      singleQuotes: 'I can use "double quotes" here',
      lineBreaks: "Look, Mom! No \n's!",
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
