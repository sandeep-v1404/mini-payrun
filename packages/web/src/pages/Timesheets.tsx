/* eslint-disable @typescript-eslint/no-explicit-any */

import Button from "@/components/Button";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Select from "@/components/Select";
import type { TimesheetEntry } from "@mini-payrun/shared";
import { Plus } from "lucide-react";
import React, { useState } from "react";

const TimesheetsView = ({ apiClient, employees, loading, setLoading }) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [periodStart, setPeriodStart] = useState("2025-08-11");
  const [periodEnd, setPeriodEnd] = useState("2025-08-17");
  const [entries, setEntries] = useState<TimesheetEntry[]>([
    { date: "2025-08-11", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
  ]);
  const [allowances, setAllowances] = useState("0");

  const addEntry = () => {
    const nextDate = new Date(entries[entries.length - 1]?.date || periodStart);
    nextDate.setDate(nextDate.getDate() + 1);

    setEntries([
      ...entries,
      {
        date: nextDate.toISOString().split("T")[0],
        start: "09:00",
        end: "17:30",
        unpaidBreakMins: 30,
      },
    ]);
  };

  const updateEntry = (
    index: number,
    field: keyof TimesheetEntry,
    value: any
  ) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setEntries(updatedEntries);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const timesheetData = {
        employeeId: selectedEmployee,
        periodStart,
        periodEnd,
        entries,
        allowances: parseFloat(allowances),
      };

      await apiClient.post("/timesheets", timesheetData);
      // Reset form
      setEntries([
        {
          date: periodStart,
          start: "09:00",
          end: "17:30",
          unpaidBreakMins: 30,
        },
      ]);
      setAllowances("0");
      alert("Timesheet saved successfully!");
    } catch (error) {
      console.error("Failed to save timesheet:", error);
      alert("Failed to save timesheet");
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (start: string, end: string, breakMins: number) => {
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const totalMins = diffMs / (1000 * 60) - breakMins;
    return (totalMins / 60).toFixed(2);
  };

  return (
    <div className="space-y-8">
      {/* <div>
        <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
        <p className="text-gray-600 mt-2">Record employee working hours</p>
      </div> */}

      <Card title="Create Timesheet" className="border-l-4 border-l-green-500">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            <Field label="Employee" required>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Period Start" required>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required
              />
            </Field>

            <Field label="Period End" required>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required
              />
            </Field>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Time Entries
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEntry}
                icon={Plus}
              >
                Add Entry
              </Button>
            </div>

            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <Field label="Date">
                    <Input
                      type="date"
                      value={entry.date}
                      onChange={(e) =>
                        updateEntry(index, "date", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Start Time">
                    <Input
                      type="time"
                      value={entry.start}
                      onChange={(e) =>
                        updateEntry(index, "start", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="End Time">
                    <Input
                      type="time"
                      value={entry.end}
                      onChange={(e) =>
                        updateEntry(index, "end", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Break (mins)">
                    <Input
                      type="number"
                      value={entry.unpaidBreakMins}
                      onChange={(e) =>
                        updateEntry(
                          index,
                          "unpaidBreakMins",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </Field>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hours:{" "}
                        {calculateHours(
                          entry.start,
                          entry.end,
                          entry.unpaidBreakMins
                        )}
                      </label>
                    </div>
                    {entries.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeEntry(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Field label="Allowances ($)">
            <Input
              type="number"
              step="0.01"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
              placeholder="0.00"
            />
          </Field>

          <Button type="submit" disabled={loading || !selectedEmployee}>
            {loading ? "Saving..." : "Save Timesheet"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default TimesheetsView;
