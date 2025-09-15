import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useState } from "react";

type TimesheetEntry = {
  date: string;
  start: string;
  end: string;
  unpaidBreakMins: number;
};

type Timesheet = {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  entries: TimesheetEntry[];
  allowances?: number;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

const getEmployees = async () => {
  const res = await api.get<Employee[]>("/employees");
  return res.data;
};

const getTimesheets = async () => {
  const res = await api.get<Timesheet[]>("/timesheets");
  return res.data;
};

export default function Timesheets() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<Timesheet>>({
    employeeId: "",
    periodStart: "",
    periodEnd: "",
    allowances: 0,
    entries: [],
  });
  const [entry, setEntry] = useState<Partial<TimesheetEntry>>({});

  // ✅ React Query v5 style
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const { data: timesheets, isLoading } = useQuery({
    queryKey: ["timesheets"],
    queryFn: getTimesheets,
  });

  const saveTimesheet = useMutation({
    mutationFn: (ts: Timesheet) => api.post("/timesheets", ts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });

  function addEntryToForm() {
    if (!entry.date || !entry.start || !entry.end) return;
    setForm({
      ...form,
      entries: [...(form.entries ?? []), entry as TimesheetEntry],
    });
    setEntry({});
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Timesheets</h1>

      {/* Create or Update Timesheet */}
      <form
        className="border p-3 mb-5 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          saveTimesheet.mutate(form as Timesheet);
        }}
      >
        <h2 className="font-semibold">New / Update Timesheet</h2>

        <select
          className="border p-1 block"
          value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
        >
          <option value="">Select Employee</option>
          {employees?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-1 block"
          value={form.periodStart}
          onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
        />
        <input
          type="date"
          className="border p-1 block"
          value={form.periodEnd}
          onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
        />
        <input
          type="number"
          placeholder="Allowances"
          className="border p-1 block"
          value={form.allowances}
          onChange={(e) =>
            setForm({ ...form, allowances: parseFloat(e.target.value) })
          }
        />

        {/* Add Entry inline */}
        <div className="border p-2">
          <h3 className="font-medium">Add Entry</h3>
          <input
            type="date"
            className="border p-1"
            value={entry.date ?? ""}
            onChange={(e) => setEntry({ ...entry, date: e.target.value })}
          />
          <input
            type="time"
            className="border p-1"
            value={entry.start ?? ""}
            onChange={(e) => setEntry({ ...entry, start: e.target.value })}
          />
          <input
            type="time"
            className="border p-1"
            value={entry.end ?? ""}
            onChange={(e) => setEntry({ ...entry, end: e.target.value })}
          />
          <input
            type="number"
            placeholder="Break (mins)"
            className="border p-1 w-28"
            value={entry.unpaidBreakMins ?? ""}
            onChange={(e) =>
              setEntry({
                ...entry,
                unpaidBreakMins: parseInt(e.target.value),
              })
            }
          />
          <button
            type="button"
            onClick={addEntryToForm}
            className="bg-green-500 text-white px-3 py-1 rounded ml-2"
          >
            Add Entry
          </button>
        </div>

        {/* Preview Entries */}
        <ul className="ml-4 list-disc">
          {form.entries?.map((en, idx) => (
            <li key={idx}>
              {en.date}: {en.start} - {en.end} (Break {en.unpaidBreakMins}m)
            </li>
          ))}
        </ul>

        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded"
          disabled={saveTimesheet.isPending}
        >
          {saveTimesheet.isPending ? "Saving..." : "Save Timesheet"}
        </button>
      </form>

      {/* Existing Timesheets */}
      <ul className="space-y-3">
        {timesheets?.map((t) => (
          <li key={t.employeeId + t.periodStart} className="border p-3 rounded">
            <h3 className="font-semibold">
              {t.employeeId} — {t.periodStart} → {t.periodEnd}
            </h3>
            <p>Allowances: {t.allowances ?? 0}</p>
            <h4 className="font-medium">Entries</h4>
            <ul className="ml-4 list-disc">
              {t.entries?.map((en: TimesheetEntry, idx: number) => (
                <li key={idx}>
                  {en.date}: {en.start} - {en.end} (Break {en.unpaidBreakMins}m)
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
