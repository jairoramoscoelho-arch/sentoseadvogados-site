import { describe, it, expect } from "vitest";
import { computeNextVersionNo } from "./version";
describe("computeNextVersionNo", () => {
  it("começa em 1", () => expect(computeNextVersionNo([])).toBe(1));
  it("incrementa o maior", () => {
    expect(computeNextVersionNo([1, 2, 3])).toBe(4);
    expect(computeNextVersionNo([3, 1, 2])).toBe(4);
  });
});
