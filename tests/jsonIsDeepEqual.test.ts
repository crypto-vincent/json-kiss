import { expect, it } from "@jest/globals";
import { jsonIsDeepEqual, JsonValue } from "../src";

it("run", async () => {
  checkCase({
    a: { key: "Hello World" },
    b: { key: "Hello World" },
    isDeepEqual: true,
  });
  checkCase({
    a: { key: "Hello World" },
    b: { key: "Hello World", another: 42 },
    isDeepEqual: false,
  });
  checkCase({
    a: { key: "Hello World", another: 42 },
    b: { key: "Hello World" },
    isDeepEqual: false,
  });
  checkCase({
    a: { key: "Hello World" },
    b: { key: "Nope" },
    isDeepEqual: false,
  });
  checkCase({
    a: { key: "Hello World" },
    b: { key: 42 },
    isDeepEqual: false,
  });
  checkCase({
    a: { key: 0 },
    b: { key: null },
    isDeepEqual: false,
  });
  checkCase({
    a: { another: { nested: [1, 2] } },
    b: { another: { nested: [1, 2] } },
    isDeepEqual: true,
  });
  checkCase({
    a: { another: { nested: [1] } },
    b: { another: { nested: [1, 2] } },
    isDeepEqual: false,
  });
  checkCase({
    a: { another: { nested: [1, 2] } },
    b: { another: { nested: [1] } },
    isDeepEqual: false,
  });
  checkCase({
    a: [1, [1], { key: "value" }],
    b: [1, [1], { key: "value" }],
    isDeepEqual: true,
  });
  checkCase({
    a: [1, [1], { key: "value" }],
    b: [1, [1], { key: "value2" }],
    isDeepEqual: false,
  });
  checkCase({
    a: [1, [1], { key: "value" }],
    b: [1, [2], { key: "value" }],
    isDeepEqual: false,
  });
  checkCase({
    a: [1, [1, 2], { key: "value" }],
    b: [1, [1], { key: "value" }],
    isDeepEqual: false,
  });
});

function checkCase(params: {
  a: JsonValue;
  b: JsonValue;
  isDeepEqual: boolean;
}) {
  expect(params.isDeepEqual).toStrictEqual(jsonIsDeepEqual(params.a, params.b));
}
