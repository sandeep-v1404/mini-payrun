/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import Card from "@/components/Card";
import Table, { type TableColumn } from "@/components/Table";
import Button from "@/components/Button";
import { Plus, Edit3 } from "lucide-react";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Dialog from "@/components/Dialog";
import { useTimesheets, useUpsertTimesheet } from "@/api/timesheets";
import { useEmployees } from "@/api/employees";
import type { Timesheet, TimesheetEntry } from "@mini-payrun/shared";
import dayjs, { currentWeek, formatDate } from "@/utils/dayjs";

const defaultFormData: Omit<Timesheet, "employee" | "payrun"> = {
  employeeId: "",
  periodStart: "",
  periodEnd: "",
  entries: [],
  allowances: 0,
};

const TimesheetsView = () => {
  const {
    data: timesheets = [],
    isLoading,
    refetch: refetchTimesheets,
  } = useTimesheets();
  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
    refetch: refetchEmployees,
  } = useEmployees({
    enabled: false,
  });
  const upsertTimesheet = useUpsertTimesheet();

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasRun = useRef(false);

  /** Reset form */
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      upsertTimesheet.mutate(formData, {
        onSuccess: () => {
          setShowDialog(false);
          resetForm();
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error.message ||
            "Failed to save timesheet";
          setSubmitError(message);
        },
      });
    },
    [formData, resetForm, upsertTimesheet]
  );

  /** Add entry */
  const addEntry = useCallback(() => {
    setFormData((prev) => {
      let nextDate = prev.periodStart;

      if (prev.entries.length > 0) {
        const lastDate = dayjs(prev.entries[prev.entries.length - 1].date)
          .add(1, "day")
          .format("YYYY-MM-DD");
        nextDate = lastDate;
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
  }, []);

  /** Update entry */
  const updateEntry = useCallback(
    (index: number, field: keyof TimesheetEntry, value: any) => {
      const updated = [...formData.entries];
      updated[index] = { ...updated[index], [field]: value };
      setFormData((prev) => ({ ...prev, entries: updated }));
    },
    [formData.entries]
  );

  /** Remove entry */
  const removeEntry = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index),
    }));
  }, []);

  /** Hours calculator */
  const calculateHours = useCallback(
    (start: string, end: string, breakMins: number) => {
      const s = dayjs(`2000-01-01T${start}`);
      const e = dayjs(`2000-01-01T${end}`);
      const diff = e.diff(s, "minute") - breakMins;
      return (diff / 60).toFixed(2);
    },
    []
  );

  // Memoized handler for edit click
  const handleEditClick = useCallback((timesheet: Timesheet) => {
    setFormData({
      id: timesheet.id,
      employeeId: timesheet.employeeId,
      periodStart: timesheet.periodStart,
      periodEnd: timesheet.periodEnd,
      entries: timesheet.entries,
      allowances: timesheet.allowances ?? 0,
    });
    setShowDialog(true);
  }, []);

  const timesheetColumns: TableColumn[] = useMemo(() => {
    const columnsArr: TableColumn[] = [
      {
        key: "employee",
        header: "Employee",
        render: (_, timesheet: Timesheet) => (
          <span className="text-gray-900">
            {timesheet.employee
              ? `${timesheet.employee.firstName} ${timesheet.employee.lastName}`
              : "Unknown"}
          </span>
        ),
      },
      {
        key: "period",
        header: "Period",
        render: (_, timesheet: Timesheet) => (
          <span className="text-gray-900">
            {formatDate(timesheet.periodStart)} →{" "}
            {formatDate(timesheet.periodEnd)}
          </span>
        ),
      },
      {
        key: "totalHours",
        header: "Total Hours",
        render: (_, timesheet: Timesheet) => (
          <span className="text-gray-900">
            {timesheet.entries
              .reduce(
                (total: number, e: TimesheetEntry) =>
                  total +
                  parseFloat(calculateHours(e.start, e.end, e.unpaidBreakMins)),
                0
              )
              .toFixed(2)}{" "}
            hrs
          </span>
        ),
      },
      {
        key: "allowances",
        header: "Allowances",
        render: (value: number) => (
          <span className="text-gray-900">${value?.toFixed(2) || "0.00"}</span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (_, timesheet: Timesheet) => (
          <Button
            variant="ghost"
            size="sm"
            icon={Edit3}
            onClick={() => handleEditClick(timesheet)}
          >
            Edit
          </Button>
        ),
      },
    ];
    return columnsArr;
  }, [calculateHours, handleEditClick]);

  const onChangeSelect = useCallback(
    (id: any) => setFormData((f) => ({ ...f, employeeId: id })),
    []
  );

  const searchableEmployeeOptions = useMemo(() => {
    return employees.map((emp) => ({
      id: emp.id!,
      label: `${emp.firstName} ${emp.lastName}`,
    }));
  }, [employees]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    refetchTimesheets();
  }, [refetchTimesheets]);

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
            const { start, end } = currentWeek();
            setFormData({
              ...defaultFormData,
              periodStart: start,
              periodEnd: end,
            });
            setShowDialog(true);
            refetchEmployees();
          }}
        >
          Add Timesheet
        </Button>
      </div>

      {/* Dialog */}
      {showDialog && (
        <Dialog
          title={formData.id ? "Edit Timesheet" : "Add Timesheet"}
          onClose={() => setShowDialog(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Employee" required>
                <Select
                  options={searchableEmployeeOptions}
                  required
                  value={formData.employeeId}
                  onChange={onChangeSelect}
                />
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
            {submitError && (
              <p className="text-red-600 text-sm font-medium">{submitError}</p>
            )}

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
        <Table
          columns={timesheetColumns}
          data={timesheets}
          isLoading={isLoading}
          emptyMessage="No timesheets found"
        />
      </Card>
    </div>
  );
};

export default TimesheetsView;
