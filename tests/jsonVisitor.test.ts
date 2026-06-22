import { expect, it } from "@jest/globals";
import { JsonValueReadonly, jsonVisitor } from "../src";

it("run", async () => {
  checkCase(true, `boolean:true`);
  checkCase(null, `null`);
  checkCase(42, `number:42`);
  checkCase("Hello World", `string:Hello World`);
  checkCase([1, "two", true], `array:[1,two,true]`);
  checkCase({ key: "value", another: 42 }, `object:{key:value,another:42}`);
});

function checkCase(input: JsonValueReadonly, output: string) {
  expect(visitor(input, undefined)).toStrictEqual(output);
}

const visitor = jsonVisitor({
  boolean: (value) => `boolean:${value}`,
  null: () => `null`,
  number: (value) => `number:${value}`,
  string: (value) => `string:${value}`,
  array: (value) => `array:[${value.join(",")}]`,
  object: (value) =>
    `object:{${Object.entries(value)
      .map(([key, value]) => `${key}:${value}`)
      .join(",")}}`,
});
