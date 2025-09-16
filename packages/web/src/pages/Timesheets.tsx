/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo } from "react";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import { Plus, Edit3 } from "lucide-react";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Dialog from "@/components/Dialog";
import { useTimesheets, useUpsertTimesheet } from "@/api/timesheets";
import { useEmployees } from "@/api/employees";
import type { Timesheet, TimesheetEntry } from "@mini-payrun/shared";

const defaultFormData: Omit<Timesheet, "employee" | "payrun"> = {
  employeeId: "",
  periodStart: "",
  periodEnd: "",
  entries: [],
  allowances: 0,
};

const TimesheetsView = () => {
  const { data: timesheets = [], isLoading } = useTimesheets();
  const { data: employees = [], isLoading: isLoadingEmployees } =
    useEmployees();
  const upsertTimesheet = useUpsertTimesheet();

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  /** Reset form */
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
  }, []);

  /** Handle submit */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      upsertTimesheet.mutate(formData, {
        onSuccess: () => {
          setShowDialog(false);
          resetForm();
        },
      });
    },
    [formData, resetForm, upsertTimesheet]
  );

  /** Add entry */
  /** Add entry */
  const addEntry = () => {
    setFormData((prev) => {
      let nextDate = prev.periodStart;

      if (prev.entries.length > 0) {
        // take last entry's date and increment by 1 day
        const lastDate = new Date(prev.entries[prev.entries.length - 1].date);
        lastDate.setDate(lastDate.getDate() + 1);
        nextDate = lastDate.toISOString().slice(0, 10); // format YYYY-MM-DD
      }

      return {
        ...prev,
        entries: [
          ...prev.entries,
          {
            date: nextDate,
            start: "09:00",
            end: "17:30",
            unpaidBreakMins: 30,
          },
        ],
      };
    });
  };

  /** Update entry */
  const updateEntry = (
    index: number,
    field: keyof TimesheetEntry,
    value: any
  ) => {
    const updated = [...formData.entries];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, entries: updated }));
  };

  /** Remove entry */
  const removeEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index),
    }));
  };

  /** Hours calculator */
  const calculateHours = (start: string, end: string, breakMins: number) => {
    const s = new Date(`2000-01-01T${start}:00`);
    const e = new Date(`2000-01-01T${end}:00`);
    const diff = (e.getTime() - s.getTime()) / 60000 - breakMins;
    return (diff / 60).toFixed(2);
  };

  /** Precompute rows for the table */
  const rows = useMemo(
    () =>
      timesheets.map((ts) => {
        return (
          <tr
            key={`${ts.employeeId}-${ts.periodStart}-${ts.periodEnd}`}
            className="hover:bg-gray-50"
          >
            <td className="px-4 py-4 text-gray-900">
              {ts.employee
                ? `${ts.employee.firstName} ${ts.employee.lastName}`
                : "Unknown"}
            </td>
            <td className="px-4 py-4 text-gray-900">
              {new Date(ts.periodStart).toISOString().slice(0, 10)} →{" "}
              {new Date(ts.periodEnd).toISOString().slice(0, 10)}
            </td>
            <td className="px-4 py-4 text-gray-900">
              {ts.entries
                .reduce(
                  (total, e) =>
                    total +
                    parseFloat(
                      calculateHours(e.start, e.end, e.unpaidBreakMins)
                    ),
                  0
                )
                .toFixed(2)}{" "}
              hrs
            </td>
            <td className="px-4 py-4 text-gray-900">
              ${ts?.allowances?.toFixed(2) || ""}
            </td>
            <td className="px-4 py-4 ">
              <Button
                variant="ghost"
                size="sm"
                icon={Edit3}
                onClick={() => {
                  setFormData({
                    employeeId: ts.employeeId,
                    periodStart: ts.periodStart,
                    periodEnd: ts.periodEnd,
                    entries: ts.entries,
                    allowances: ts.allowances ?? 0,
                  });
                  setShowDialog(true);
                }}
              >
                Edit
              </Button>
            </td>
          </tr>
        );
      }),
    [timesheets]
  );

  return (
    <div className="space-y-8">
      {/* Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-600 mt-2">Record employee working hours</p>
        </div>

        <Button
          icon={Plus}
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          Add Timesheet
        </Button>
      </div>

      {/* Dialog */}
      {showDialog && (
        <Dialog
          title={
            formData.employeeId && formData.periodStart && formData.periodEnd
              ? "Edit Timesheet"
              : "Add Timesheet"
          }
          onClose={() => setShowDialog(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Employee" required>
                <Select
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, employeeId: e.target.value }))
                  }
                >
                  <option value="">Select employee</option>
                  {isLoadingEmployees ? (
                    <option disabled>Loading employees...</option>
                  ) : (
                    employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))
                  )}
                </Select>
              </Field>

              <Field label="Period Start" required>
                <Input
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, periodStart: e.target.value }))
                  }
                  required
                />
              </Field>

              <Field label="Period End" required>
                <Input
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, periodEnd: e.target.value }))
                  }
                  required
                />
              </Field>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Time Entries</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addEntry}
                  icon={Plus}
                >
                  Add Entry
                </Button>
              </div>

              <div className="space-y-4">
                {formData.entries.map((entry, index) => (
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
                    <Field label="Start">
                      <Input
                        type="time"
                        value={entry.start}
                        onChange={(e) =>
                          updateEntry(index, "start", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="End">
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
                      <span className="text-sm font-medium text-black">
                        Total Hours:{" "}
                        {calculateHours(
                          entry.start,
                          entry.end,
                          entry.unpaidBreakMins
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeEntry(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Field label="Allowances">
              <Input
                type="number"
                step="0.01"
                value={formData.allowances}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    allowances: parseFloat(e.target.value),
                  }))
                }
              />
            </Field>

            <div className="flex gap-4">
              <Button type="submit" disabled={upsertTimesheet.isPending}>
                {upsertTimesheet.isPending ? "Saving..." : "Save Timesheet"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Timesheets Table */}
      <Card>
        {isLoading ? (
          <p className="p-4">Loading timesheets...</p>
        ) : (
          <Table
            headers={[
              "Employee",
              "Period",
              "Total Hours",
              "Allowances",
              "Actions",
            ]}
          >
            {rows}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default TimesheetsView;
