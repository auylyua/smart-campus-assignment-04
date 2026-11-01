import { useMemo, useState } from "react";
import { Building2, Clock, DoorClosed, Search } from "lucide-react";
import { rooms, bookings } from "@/lib/data";
import {
  checkAvailability,
  formatTime,
  nowMinutes,
  MAX_DURATION_MINUTES,
  MINUTES_PER_DAY,
} from "@/lib/availability";
import type { AvailabilityResult } from "@/lib/types";
import { Timeline } from "./Timeline";
import { ResultCard } from "./ResultCard";

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h === 24 && m === 0) return 1440;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function minutesToInput(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function RoomChecker() {
  const [roomId, setRoomId] = useState<string>(rooms[0].id);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const room = useMemo(() => rooms.find((r) => r.id === roomId)!, [roomId]);
  const roomBookings = useMemo(
    () => bookings.filter((b) => b.roomId === roomId),
    [roomId],
  );

  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const parseError =
    startMin === null
      ? "Start time must be HH:MM."
      : endMin === null
        ? "End time must be HH:MM."
        : null;

  const now = nowMinutes();

  const handleCheck = () => {
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
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Building2 className="w-4 h-4 text-slate-400" />
            Room
          </label>
          <select
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              setResult(null);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} {r.blocked ? "(blocked)" : ""}
              </option>
            ))}
          </select>
          {room.blocked && (
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
              <DoorClosed className="w-3.5 h-3.5" />
              {room.blockedReason}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Clock className="w-4 h-4 text-slate-400" />
              Start
            </label>
            <input
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
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Clock className="w-4 h-4 text-slate-400" />
              End
            </label>
            <input
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
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 active:bg-sky-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <Search className="w-4 h-4" />
          Check availability
        </button>

        <p className="text-xs text-slate-400 leading-relaxed">
          Times are in 24-hour campus time (00:00–24:00). Max {MAX_DURATION_MINUTES} min.
          Start must be later than now. This tool checks availability only — it does not
          create bookings.
        </p>
      </div>

      <div className="lg:col-span-3 space-y-5">
        <Timeline
          bookings={roomBookings}
          now={now}
          candidateStart={startMin ?? undefined}
          candidateEnd={endMin ?? undefined}
        />

        <ResultCard
          result={result}
          room={room}
          start={startMin ?? 0}
          end={endMin ?? 0}
        />

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
      </div>
    </div>
  );
}

export { MINUTES_PER_DAY };
