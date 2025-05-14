import React, { useState } from "react";

type Schedule = {
  day: string;
  timeStart: string;
  timeEnd: string;
  buildingAndRoom: string;
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let hour = 7; hour <= 20; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
    times.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return times;
};

const timeOptions = generateTimeOptions();

export default function RoomScheduleTable() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const handleChange = (
    index: number,
    field: keyof Schedule,
    value: string
  ) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const addRow = () => {
    setSchedules([
      ...schedules,
      { day: "", timeStart: "", timeEnd: "", buildingAndRoom: "" },
    ]);
  };

  const deleteRow = (index: number) => {
    const updated = schedules.filter((_, i) => i !== index);
    setSchedules(updated);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium">Room and Schedules</label>
        <button
          onClick={addRow}
          className="bg-ucap-yellow bg-ucap-yellow-hover text-white px-4 py-1 rounded-md text-sm"
        >
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto border border-[#E9E6E6] rounded-md">
        <table className="w-full rounded-md border-[#E9E6E6] text-sm">
          <thead>
            <tr className="text-sm font-medium border-[#E9E6E6] border-b text-left">
              <th className="p-2">Day</th>
              <th className="p-2">Time Start</th>
              <th className="p-2">Time End</th>
              <th className="p-2">Building And Room</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, index) => (
              <tr key={index} className="hover:bg-[] group transition-colors">
                <td className="p-2">
                  <select
                    className="w-full border border-[#E9E6E6] px-2 py-1 rounded-md"
                    value={schedule.day}
                    onChange={(e) => handleChange(index, "day", e.target.value)}
                  >
                    <option value="">Select</option>
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <select
                    className="w-full border border-[#E9E6E6] px-2 py-1 rounded-md"
                    value={schedule.timeStart}
                    onChange={(e) =>
                      handleChange(index, "timeStart", e.target.value)
                    }
                  >
                    <option value="">Start</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <select
                    className="w-full border border-[#E9E6E6] px-2 py-1 rounded-md"
                    value={schedule.timeEnd}
                    onChange={(e) =>
                      handleChange(index, "timeEnd", e.target.value)
                    }
                  >
                    <option value="">End</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full border border-[#E9E6E6] px-2 py-1 rounded-md"
                    value={schedule.buildingAndRoom}
                    onChange={(e) =>
                      handleChange(index, "buildingAndRoom", e.target.value)
                    }
                  />
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => deleteRow(index)}
                    className="invisible group-hover:visible text-red-500 hover:text-red-700 transition"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}

            {schedules.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-500 py-4 text-sm"
                >
                  No schedules added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
