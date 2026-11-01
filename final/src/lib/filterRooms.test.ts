import { describe, expect, it } from "vitest";
import { filterRooms, parseAttendees } from "@/lib/filterRooms";
import type { Room } from "@/lib/types";

function buildRooms(): Room[] {
  return [
    {
      id: "R-A",
      name: "Room A",
      building: "Hall",
      capacity: 32,
      equipment: ["projector", "whiteboard"],
      blocked: false,
    },
    {
      id: "R-B",
      name: "Room B",
      building: "Lab",
      capacity: 24,
      equipment: ["whiteboard", "computers"],
      blocked: true,
      blockedReason: "Maintenance",
    },
    {
      id: "R-C",
      name: "Room C",
      building: "Wing",
      capacity: 120,
      equipment: ["projector", "whiteboard", "computers"],
      blocked: false,
    },
    {
      id: "R-D",
      name: "Room D",
      building: "Studio",
      capacity: 18,
      equipment: ["computers"],
      blocked: false,
    },
  ];
}

const ids = (rooms: Room[]) => rooms.map((r) => r.id);

describe("filterRooms: capacity (F1)", () => {
  it("includes a room whose capacity exactly matches the attendees", () => {
    expect(ids(filterRooms(buildRooms(), { attendees: 32, equipment: [] }))).toEqual([
      "R-A",
      "R-C",
    ]);
  });

  it("excludes a room when attendees exceed its capacity", () => {
    expect(ids(filterRooms(buildRooms(), { attendees: 33, equipment: [] }))).toEqual(["R-C"]);
  });
});

describe("filterRooms: equipment must match ALL selected items (F2)", () => {
  it("returns only rooms that contain every selected item", () => {
    expect(
      ids(filterRooms(buildRooms(), { attendees: 1, equipment: ["projector", "whiteboard"] })),
    ).toEqual(["R-A", "R-C"]);
  });

  it("excludes a room that has some but not all selected items", () => {
    expect(
      ids(
        filterRooms(buildRooms(), {
          attendees: 1,
          equipment: ["projector", "computers"],
        }),
      ),
    ).toEqual(["R-C"]);
  });
});

describe("filterRooms: no equipment selected", () => {
  it("applies no equipment restriction and filters on capacity only", () => {
    expect(ids(filterRooms(buildRooms(), { attendees: 1, equipment: [] }))).toEqual([
      "R-A",
      "R-B",
      "R-C",
      "R-D",
    ]);
  });
});

describe("filterRooms: combined filters", () => {
  it("requires both capacity and every selected item", () => {
    expect(
      ids(
        filterRooms(buildRooms(), {
          attendees: 25,
          equipment: ["whiteboard"],
        }),
      ),
    ).toEqual(["R-A", "R-C"]);
  });
});

describe("filterRooms: no matches", () => {
  it("returns an empty list when no room satisfies the requirements", () => {
    expect(
      filterRooms(buildRooms(), { attendees: 500, equipment: ["projector"] }),
    ).toEqual([]);
  });
});

describe("filterRooms: blocked rooms stay in the list", () => {
  it("keeps a matching blocked room so it can be labelled", () => {
    const matched = filterRooms(buildRooms(), { attendees: 20, equipment: ["whiteboard"] });
    expect(matched.find((r) => r.id === "R-B")?.blocked).toBe(true);
  });
});

describe("parseAttendees", () => {
  it.each([
    ["1", 1],
    ["12", 12],
    [" 40 ", 40],
  ])("accepts %j as %i", (input, expected) => {
    expect(parseAttendees(input)).toBe(expected);
  });

  it.each(["", "   ", "0", "-3", "1.5", "2e3", "abc", "10 people"])("rejects %j", (input) => {
    expect(parseAttendees(input)).toBeNull();
  });
});
