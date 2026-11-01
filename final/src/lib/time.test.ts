import { describe, expect, it } from "vitest";
import { formatTime, parseTimeToMinutes } from "@/lib/time";

describe("parseTimeToMinutes: valid times", () => {
  it.each([
    ["00:00", 0],
    ["09:00", 540],
    ["9:05", 545],
    ["12:30", 750],
    ["23:59", 1439],
    [" 10:15 ", 615],
  ])("parses %s as %i minutes", (input, expected) => {
    expect(parseTimeToMinutes(input)).toBe(expected);
  });

  it("parses 24:00 as 1440 minutes", () => {
    expect(parseTimeToMinutes("24:00")).toBe(1440);
  });
});

describe("parseTimeToMinutes: invalid times", () => {
  it.each(["", "   ", "24:01", "24:30", "25:00", "12:60", "12:5", "1200", "ab:cd", "-1:00", "9", "10:00:00", "10-00"])(
    "rejects %j",
    (input) => {
      expect(parseTimeToMinutes(input)).toBeNull();
    },
  );
});

describe("formatTime", () => {
  it.each([
    [0, "00:00"],
    [540, "09:00"],
    [615, "10:15"],
    [1439, "23:59"],
    [1440, "24:00"],
  ])("formats %i as %s", (minutes, expected) => {
    expect(formatTime(minutes)).toBe(expected);
  });

  it("round-trips valid times through parse and format", () => {
    for (const text of ["00:00", "09:00", "13:45", "23:59", "24:00"]) {
      expect(formatTime(parseTimeToMinutes(text)!)).toBe(text);
    }
  });
});
