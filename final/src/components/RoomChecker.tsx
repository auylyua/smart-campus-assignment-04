import { useId, useMemo, useState } from "react";
import { Ban, Building2, Clock, DoorClosed, Search, Users } from "lucide-react";
import { checkAvailability, MAX_DURATION_MINUTES } from "@/lib/availability";
import { rooms, bookings, equipmentLabels } from "@/lib/data";
import { filterRooms, parseAttendees } from "@/lib/filterRooms";
import { CURRENT_MINUTES, formatTime, parseTimeToMinutes } from "@/lib/time";
import type { AvailabilityResult, Equipment } from "@/lib/types";
import { ResultCard } from "./ResultCard";
import { RoomFilters } from "./RoomFilters";
import { Timeline } from "./Timeline";

export function RoomChecker() {
  const id = useId();
  const roomSelectId = `${id}-room`;
  const startId = `${id}-start`;
  const endId = `${id}-end`;

  const [attendeesDraft, setAttendeesDraft] = useState("1");
  const [appliedAttendees, setAppliedAttendees] = useState(1);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [roomId, setRoomId] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const attendeesValid = parseAttendees(attendeesDraft) !== null;
  const matchingRooms = useMemo(
    () => filterRooms(rooms, { attendees: appliedAttendees, equipment }),
    [appliedAttendees, equipment],
  );
  const room = matchingRooms.find((r) => r.id === roomId) ?? null;
  const roomBookings = useMemo(
    () => (room ? bookings.filter((b) => b.roomId === room.id) : []),
    [room],
  );

  const applyFilters = (nextAttendees: number, nextEquipment: Equipment[]) => {
    const selectedStillMatches = filterRooms(rooms, {
      attendees: nextAttendees,
      equipment: nextEquipment,
    }).some((r) => r.id === roomId);
    setAppliedAttendees(nextAttendees);
    setEquipment(nextEquipment);
    if (!selectedStillMatches) setRoomId("");
    setResult(null);
  };

  const handleAttendeesChange = (value: string) => {
    setAttendeesDraft(value);
    setResult(null);
    const parsed = parseAttendees(value);
    if (parsed !== null) applyFilters(parsed, equipment);
  };

  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const parseError =
    startMin === null
      ? "Start time must be HH:MM."
      : endMin === null
        ? "End time must be HH:MM."
        : null;

  const now = CURRENT_MINUTES;

  const handleCheck = () => {
    if (!room || !attendeesValid) return;
    if (parseError) {
      setResult({ status: "unavailable", reason: parseError });
      return;
    }
    setResult(
      checkAvailability({ start: startMin!, end: endMin! }, room, bookings, now),
    );
  };

  const duration =
    startMin !== null && endMin !== null ? endMin - startMin : null;
  const durationTooLong = duration !== null && duration > MAX_DURATION_MINUTES;
  const durationNonPositive = duration !== null && duration <= 0;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-5">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
          <Clock className="w-3.5 h-3.5" />
          Current time: {formatTime(CURRENT_MINUTES)} (fixed demo time)
        </p>

        <RoomFilters
          attendees={attendeesDraft}
          onAttendeesChange={handleAttendeesChange}
          equipment={equipment}
          onEquipmentChange={(value) => applyFilters(appliedAttendees, value)}
        />

        <div className="space-y-1.5">
          <label
            htmlFor={roomSelectId}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            Room
          </label>
          <select
            id={roomSelectId}
            value={room?.id ?? ""}
            disabled={matchingRooms.length === 0}
            onChange={(e) => {
              setRoomId(e.target.value);
              setResult(null);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="" disabled>
              {matchingRooms.length === 0 ? "No rooms available" : "Choose a room"}
            </option>
            {matchingRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {`${r.name} — ${r.capacity} seats${r.blocked ? " (blocked)" : ""}`}
              </option>
            ))}
          </select>
          {matchingRooms.length === 0 && (
            <div
              role="status"
              className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
            >
              <Ban className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-medium">No rooms match your requirements.</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Try fewer attendees or fewer equipment items.
                </p>
              </div>
            </div>
          )}
          {room?.blocked && (
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
              <DoorClosed className="w-3.5 h-3.5" />
              {room.blockedReason}
            </p>
          )}
          {room && (
            <section
              aria-label="Selected room details"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            >
              <p className="flex items-center gap-1.5 text-slate-700">
                <Users className="w-4 h-4 text-slate-400" />
                {room.capacity} seats
              </p>
              {room.equipment.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">No equipment listed.</p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {room.equipment.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600"
                    >
                      {equipmentLabels[item]}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor={startId}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              Start
            </label>
            <input
              id={startId}
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor={endId}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              End
            </label>
            <input
              id={endId}
              type="text"
              inputMode="numeric"
              pattern="\d{2}:\d{2}"
              placeholder="HH:MM"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition"
            />
          </div>
        </div>

        {duration !== null && (
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Duration</span>
              <span
                className={`font-medium ${
                  durationNonPositive || durationTooLong
                    ? "text-rose-600"
                    : "text-slate-700"
                }`}
              >
                {duration} min
                {durationTooLong && ` (max ${MAX_DURATION_MINUTES})`}
              </span>
            </div>
            {durationNonPositive && (
              <p className="text-rose-600">End must be after start.</p>
            )}
            {durationTooLong && (
              <p className="text-rose-600">Maximum allowed is {MAX_DURATION_MINUTES} minutes.</p>
            )}
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={!room || !attendeesValid}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 active:bg-sky-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" />
          Check availability
        </button>

        <p className="text-xs text-slate-400 leading-relaxed">
          Times are in 24-hour campus time (00:00–24:00). Max {MAX_DURATION_MINUTES} min.
          Start must be later than now ({formatTime(CURRENT_MINUTES)}). This tool checks availability only — it does not
          create bookings.
        </p>
      </div>

      <div className="lg:col-span-3 space-y-5">
        {room ? (
          <>
            <Timeline
              bookings={roomBookings}
              now={now}
              candidateStart={startMin ?? undefined}
              candidateEnd={endMin ?? undefined}
            />

            <div role="status" aria-live="polite">
              <ResultCard
                result={result}
                room={room}
                start={startMin ?? 0}
                end={endMin ?? 0}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Existing bookings for {room.name}
              </h3>
              {roomBookings.length === 0 ? (
                <p className="text-sm text-slate-400">No existing bookings.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {roomBookings.map((b) => (
                    <li key={b.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-slate-700">{b.owner}</span>
                      <span className="text-slate-500 tabular-nums">
                        {formatTime(b.start)}–{formatTime(b.end)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
            <Building2 className="w-8 h-8 mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-600">
              {matchingRooms.length === 0
                ? "No room is selected."
                : "Choose a room to see its timeline and availability."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
