import { describe, expect, it } from "vitest";
import {
  collapseWhitespace,
  isoDate,
  licenseString,
  normalizeRepo,
  truncateLine,
} from "../src/format.js";

describe("format helpers", () => {
  it("collapses whitespace and newlines", () => {
    expect(collapseWhitespace("a\n\n  b   c")).toBe("a b c");
  });

  it("truncates long lines with an ellipsis", () => {
    expect(truncateLine("hello world", 5)).toBe("hello …");
    expect(truncateLine("short", 100)).toBe("short");
  });

  it("formats ISO timestamps as YYYY-MM-DD", () => {
    expect(isoDate("2024-04-25T17:09:33.123Z")).toBe("2024-04-25");
    expect(isoDate("not-a-date")).toBeUndefined();
    expect(isoDate(undefined)).toBeUndefined();
  });

  it("extracts license strings and legacy license objects", () => {
    expect(licenseString("MIT")).toBe("MIT");
    expect(licenseString({ type: "ISC" })).toBe("ISC");
    expect(licenseString(undefined)).toBeUndefined();
  });

  it("normalizes git repository URLs", () => {
    expect(normalizeRepo("git+https://github.com/facebook/react.git")).toBe(
      "https://github.com/facebook/react",
    );
    expect(normalizeRepo({ url: "git://github.com/a/b.git" })).toBe(
      "https://github.com/a/b",
    );
    expect(normalizeRepo(undefined)).toBeUndefined();
  });
});
