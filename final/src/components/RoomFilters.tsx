import { useId } from "react";
import { Users } from "lucide-react";
import { equipmentLabels } from "@/lib/data";
import { parseAttendees } from "@/lib/filterRooms";
import type { Equipment } from "@/lib/types";

const EQUIPMENT_OPTIONS = Object.entries(equipmentLabels) as [Equipment, string][];

interface RoomFiltersProps {
  attendees: string;
  onAttendeesChange: (value: string) => void;
  equipment: Equipment[];
  onEquipmentChange: (value: Equipment[]) => void;
}

export function RoomFilters({
  attendees,
  onAttendeesChange,
  equipment,
  onEquipmentChange,
}: RoomFiltersProps) {
  const id = useId();
  const attendeesId = `${id}-attendees`;
  const attendeesErrorId = `${id}-attendees-error`;
  const attendeesValid = parseAttendees(attendees) !== null;

  const toggleEquipment = (item: Equipment) => {
    onEquipmentChange(
      equipment.includes(item)
        ? equipment.filter((selected) => selected !== item)
        : [...equipment, item],
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label
          htmlFor={attendeesId}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
        >
          <Users className="w-4 h-4 text-slate-400" />
          Attendees
        </label>
        <input
          id={attendeesId}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={attendees}
          onChange={(e) => onAttendeesChange(e.target.value)}
          aria-invalid={!attendeesValid}
          aria-describedby={attendeesValid ? undefined : attendeesErrorId}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition aria-[invalid=true]:border-rose-400"
        />
        {!attendeesValid && (
          <p id={attendeesErrorId} className="text-xs text-rose-600">
            Enter a whole number of 1 or more.
          </p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Equipment</legend>
        <p className="text-xs text-slate-400">
          A room must have every item you tick. Leave all unticked for no restriction.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {EQUIPMENT_OPTIONS.map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 cursor-pointer hover:border-sky-300 transition-colors has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50"
            >
              <input
                type="checkbox"
                checked={equipment.includes(value)}
                onChange={() => toggleEquipment(value)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
