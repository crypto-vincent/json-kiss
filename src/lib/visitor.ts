import { jsonThrowWithExpected } from "./throw";
import {
  JsonArrayReadonly,
  JsonObjectReadonly,
  JsonValueReadonly,
} from "./types";

/**
 * Creates a visitor function for a {@link JsonValueReadonly} that dispatches to the appropriate visitor based on the value's type.
 */
export function jsonVisitor<Returned, Context = void>(visitors: {
  null?: (value: null, context: Context) => Returned;
  boolean?: (value: boolean, context: Context) => Returned;
  number?: (value: number, context: Context) => Returned;
  string?: (value: string, context: Context) => Returned;
  array?: (value: JsonArrayReadonly, context: Context) => Returned;
  object?: (value: JsonObjectReadonly, context: Context) => Returned;
}): (value: JsonValueReadonly, context: Context) => Returned {
  const expectedVisitors = Object.keys(visitors).join("/");
  return (value, context) => {
    switch (typeof value) {
      case "boolean":
        if (visitors.boolean !== undefined) {
          return visitors.boolean(value, context);
        }
        break;
      case "number":
        if (visitors.number !== undefined) {
          return visitors.number(value, context);
        }
        break;
      case "string":
        if (visitors.string !== undefined) {
          return visitors.string(value, context);
        }
        break;
      case "object":
        if (value === null) {
          if (visitors.null !== undefined) {
            return visitors.null(value, context);
          }
        } else if (Array.isArray(value)) {
          if (visitors.array !== undefined) {
            return visitors.array(value as JsonArrayReadonly, context);
          }
        } else {
          if (visitors.object !== undefined) {
            return visitors.object(value as JsonObjectReadonly, context);
          }
        }
        break;
    }
    jsonThrowWithExpected(expectedVisitors, value);
  };
}
