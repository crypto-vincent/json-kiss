import { expect, it } from "@jest/globals";
import { jsonIsDeepSubset, JsonValueReadonly } from "../src";

it("run", async () => {
  checkCase({
    subset: { key: "Hello World" },
    superset: { key: "Hello World" },
    isDeepSubset: true,
  });
  checkCase({
    subset: { key: "Hello World" },
    superset: { key: "Hello World", another: 42 },
    isDeepSubset: true,
  });
  checkCase({
    subset: { key: "Hello World", another: 42 },
    superset: { key: "Hello World" },
    isDeepSubset: false,
  });
  checkCase({
    subset: { key: "Hello World" },
    superset: { key: "Nope" },
    isDeepSubset: false,
  });
  checkCase({
    subset: { key: "Hello World" },
    superset: { key: 42 },
    isDeepSubset: false,
  });
  checkCase({
    subset: { key: 0 },
    superset: { key: null },
    isDeepSubset: false,
  });
  checkCase({
    subset: { another: { nested: [1, 2] } },
    superset: { another: { nested: [1, 2] } },
    isDeepSubset: true,
  });
  checkCase({
    subset: { another: { nested: [1] } },
    superset: { another: { nested: [1, 2] } },
    isDeepSubset: true,
  });
  checkCase({
    subset: { another: { nested: [1, 2] } },
    superset: { another: { nested: [1] } },
    isDeepSubset: false,
  });
  checkCase({
    subset: [1, [1], { key: "value" }],
    superset: [1, [1], { key: "value" }],
    isDeepSubset: true,
  });
  checkCase({
    subset: [1, [1], { key: "value" }],
    superset: [1, [1], { key: "value2" }],
    isDeepSubset: false,
  });
  checkCase({
    subset: [1, [1], { key: "value" }],
    superset: [1, [2], { key: "value" }],
    isDeepSubset: false,
  });
  checkCase({
    subset: [1, [1, 2], { key: "value" }],
    superset: [1, [1], { key: "value" }],
    isDeepSubset: false,
  });
  checkCase({
    subset: { key: undefined },
    superset: {},
    isDeepSubset: true,
  });
  checkCase({
    subset: {},
    superset: { key: undefined },
    isDeepSubset: true,
  });
  checkCase({
    subset: { toString: undefined },
    superset: {},
    isDeepSubset: true,
  });
  checkCase({
    subset: {},
    superset: { toString: undefined },
    isDeepSubset: true,
  });
});

function checkCase(params: {
  subset: JsonValueReadonly;
  superset: JsonValueReadonly;
  isDeepSubset: boolean;
}) {
  expect(params.isDeepSubset).toStrictEqual(
    jsonIsDeepSubset(params.subset, params.superset),
  );
}
