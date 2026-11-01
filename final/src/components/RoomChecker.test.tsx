// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomChecker } from "@/components/RoomChecker";

afterEach(cleanup);

function roomSelect() {
  return screen.getByLabelText("Room") as HTMLSelectElement;
}

function roomOptionNames(): string[] {
  return within(roomSelect())
    .getAllByRole("option")
    .filter((option) => option.getAttribute("value") !== "")
    .map((option) => option.textContent?.trim() ?? "");
}

function attendeesInput() {
  return screen.getByLabelText("Attendees");
}

function checkButton() {
  return screen.getByRole("button", { name: /check availability/i });
}

describe("RoomChecker: filtering updates room choices", () => {
  it("lists every room by default and narrows as capacity and equipment change", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    expect(roomOptionNames()).toEqual([
      "Athena Hall 101 — 32 seats",
      "Babbage Lab 220 — 24 seats (blocked)",
      "Curie Auditorium 310 — 120 seats",
      "DaVinci Studio 405 — 18 seats",
    ]);

    await user.clear(attendeesInput());
    await user.type(attendeesInput(), "25");
    expect(roomOptionNames()).toEqual(["Athena Hall 101 — 32 seats", "Curie Auditorium 310 — 120 seats"]);

    await user.click(screen.getByRole("checkbox", { name: "Projector" }));
    expect(roomOptionNames()).toEqual(["Athena Hall 101 — 32 seats", "Curie Auditorium 310 — 120 seats"]);

    await user.click(screen.getByRole("checkbox", { name: "Computers" }));
    expect(roomOptionNames()).toEqual(["Curie Auditorium 310 — 120 seats"]);
  });
});

describe("RoomChecker: empty state", () => {
  it("shows the no-match message and clears it when a room matches again", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.clear(attendeesInput());
    await user.type(attendeesInput(), "500");
    expect(screen.getByText("No rooms match your requirements.")).toBeTruthy();
    expect(roomSelect().disabled).toBe(true);
    expect(checkButton().hasAttribute("disabled")).toBe(true);

    await user.clear(attendeesInput());
    await user.type(attendeesInput(), "20");
    expect(screen.queryByText("No rooms match your requirements.")).toBeNull();
    expect(roomSelect().disabled).toBe(false);
  });
});

describe("RoomChecker: selection after filters change", () => {
  it("clears a selected room that the filters remove", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.selectOptions(roomSelect(), "R-A101");
    expect(screen.getByText("Daily timeline")).toBeTruthy();

    await user.clear(attendeesInput());
    await user.type(attendeesInput(), "100");

    expect(roomSelect().value).toBe("");
    expect(screen.queryByText("Daily timeline")).toBeNull();
    expect(screen.queryByText("Existing bookings for Athena Hall 101")).toBeNull();
    expect(checkButton().hasAttribute("disabled")).toBe(true);
  });

  it("keeps a selected room that still matches", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.selectOptions(roomSelect(), "R-C310");
    await user.type(attendeesInput(), "5");

    expect(roomSelect().value).toBe("R-C310");
    expect(screen.getByText("Daily timeline")).toBeTruthy();
  });
});

describe("RoomChecker: result clearing (F5)", () => {
  it("clears the previous result when the room changes", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.selectOptions(roomSelect(), "R-A101");
    await user.click(checkButton());
    expect(screen.getByRole("heading", { name: "Available" })).toBeTruthy();

    await user.selectOptions(roomSelect(), "R-D405");
    expect(screen.queryByRole("heading", { name: "Available" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Unavailable" })).toBeNull();
  });

  it("clears the previous result when a filter changes", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.selectOptions(roomSelect(), "R-A101");
    await user.click(checkButton());
    expect(screen.getByRole("heading", { name: "Available" })).toBeTruthy();

    await user.clear(attendeesInput());
    await user.type(attendeesInput(), "20");
    expect(screen.queryByRole("heading", { name: "Available" })).toBeNull();
  });
});

describe("RoomChecker: blocked rooms", () => {
  it("labels a blocked room and returns Unavailable when checked", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.selectOptions(roomSelect(), "R-B220");
    await user.click(checkButton());

    expect(screen.getByRole("heading", { name: "Unavailable" })).toBeTruthy();
    expect(
      screen.getByText("Room is blocked: Maintenance — HVAC out of service"),
    ).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Available" })).toBeNull();
  });
});

describe("RoomChecker: attendees editing flow", () => {
  it("accepts a valid number entered after clearing the field", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.clear(attendeesInput());
    await user.type(attendeesInput(), "100");

    expect(roomOptionNames()).toEqual(["Curie Auditorium 310 — 120 seats"]);
    expect((attendeesInput() as HTMLInputElement).value).toBe("100");
    expect(screen.queryByText("Enter a whole number of 1 or more.")).toBeNull();
  });

  it("keeps the selected room while the field is empty and after a valid number is entered", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.selectOptions(roomSelect(), "R-C310");
    await user.clear(attendeesInput());

    expect(roomSelect().value).toBe("R-C310");
    expect(screen.getByText("Daily timeline")).toBeTruthy();
    expect(screen.getByText("Enter a whole number of 1 or more.")).toBeTruthy();
    expect(checkButton().hasAttribute("disabled")).toBe(true);

    await user.type(attendeesInput(), "50");

    expect(roomSelect().value).toBe("R-C310");
    expect(screen.queryByText("Enter a whole number of 1 or more.")).toBeNull();
    expect(checkButton().hasAttribute("disabled")).toBe(false);
  });

  it("clears a selected room only once a valid number removes it", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.selectOptions(roomSelect(), "R-A101");
    await user.clear(attendeesInput());
    expect(roomSelect().value).toBe("R-A101");

    await user.type(attendeesInput(), "100");
    expect(roomSelect().value).toBe("");
    expect(screen.queryByText("Daily timeline")).toBeNull();
  });

  it("clears the result and disables the check button while the draft is invalid", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.selectOptions(roomSelect(), "R-A101");
    await user.click(checkButton());
    expect(screen.getByRole("heading", { name: "Available" })).toBeTruthy();

    await user.clear(attendeesInput());
    expect(screen.queryByRole("heading", { name: "Available" })).toBeNull();
    expect(checkButton().hasAttribute("disabled")).toBe(true);

    await user.type(attendeesInput(), "2.5");
    expect(screen.getByText("Enter a whole number of 1 or more.")).toBeTruthy();
    expect(checkButton().hasAttribute("disabled")).toBe(true);
    expect(attendeesInput().getAttribute("aria-invalid")).toBe("true");
  });

  it("never checks availability against an invalid draft", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    await user.selectOptions(roomSelect(), "R-A101");
    await user.clear(attendeesInput());
    await user.click(checkButton());

    expect(screen.queryByRole("heading", { name: "Available" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Unavailable" })).toBeNull();
  });
});

describe("RoomChecker: room details", () => {
  it("shows capacity and equipment for the selected room only", async () => {
    const user = userEvent.setup();
    render(<RoomChecker />);

    expect(screen.queryByRole("region", { name: "Selected room details" })).toBeNull();

    await user.selectOptions(roomSelect(), "R-C310");
    const details = within(screen.getByRole("region", { name: "Selected room details" }));
    expect(details.getByText("120 seats")).toBeTruthy();
    expect(details.getByText("Projector")).toBeTruthy();
    expect(details.getByText("Whiteboard")).toBeTruthy();
    expect(details.getByText("Computers")).toBeTruthy();

    await user.clear(attendeesInput());
    await user.type(attendeesInput(), "200");
    expect(screen.queryByRole("region", { name: "Selected room details" })).toBeNull();
  });
});

describe("RoomChecker: no room selected", () => {
  it("hides the timeline and bookings and disables the check button", () => {
    render(<RoomChecker />);

    expect(roomSelect().value).toBe("");
    expect(screen.queryByText("Daily timeline")).toBeNull();
    expect(screen.queryByText(/Existing bookings for/)).toBeNull();
    expect(checkButton().hasAttribute("disabled")).toBe(true);
  });
});
