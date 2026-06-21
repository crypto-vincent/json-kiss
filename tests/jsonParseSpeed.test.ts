import { it } from "@jest/globals";
import { jsonParse } from "../src";

it("run", async () => {
  const value = `{"key1": "value1", "key2": 42, "key3": [1, 2, 3], "key4": {"nestedKey": "nestedValue"}}`;
  jsonParse(value); // Warm up the parser
  const count = 100000;
  const startTime = performance.now();
  for (let i = 0; i < count; i++) {
    jsonParse(value);
  }
  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log(
    `Parsed 100,000 JSON strings in ${duration.toFixed(2)} milliseconds`,
  );
  const averageTime = duration / count;
  console.log(`Average time per parse: ${averageTime.toFixed(4)} milliseconds`);
});
