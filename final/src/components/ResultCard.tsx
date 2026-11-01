import { CheckCircle2, XCircle, Clock, MapPin, Users } from "lucide-react";
import type { AvailabilityResult, Room } from "@/lib/types";
import { formatTime } from "@/lib/time";

interface ResultCardProps {
  result: AvailabilityResult | null;
  room: Room;
  start: number;
  end: number;
}

export function ResultCard({ result, room, start, end }: ResultCardProps) {
  if (!result) return null;

  const available = result.status === "available";

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-colors ${
        available
          ? "border-emerald-200 bg-emerald-50"
          : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {available ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <h3
            className={`text-lg font-semibold ${
              available ? "text-emerald-900" : "text-rose-900"
            }`}
          >
            {available ? "Available" : "Unavailable"}
          </h3>
          <p
            className={`text-sm mt-1 ${
              available ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {available
              ? "This time slot is free and meets all booking rules."
              : result.reason}
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="truncate">{room.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{room.capacity} seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                {formatTime(start)}–{formatTime(end)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{end - start} min</span>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
