import type { Payrun } from "@mini-payrun/shared";
import React, { useState } from "react";
import { useRunPay } from "@/api/payruns";
import { useEmployees } from "@/api/employees";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import { Calculator } from "lucide-react";

const RunPay = () => {
  const [periodStart, setPeriodStart] = useState("2025-08-11");
  const [periodEnd, setPeriodEnd] = useState("2025-08-17");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [payrunResult, setPayrunResult] = useState<Payrun | null>(null);

  const { data: employees = [], isLoading, isError } = useEmployees();

  const runPay = useRunPay();

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    setSelectedEmployees(
      selectedEmployees.length === employees.length
        ? []
        : employees.map((emp) => emp.id!) || []
    );
  };

  const handleRunPayrun = (e: React.FormEvent) => {
    e.preventDefault();
    runPay.mutate(
      {
        periodStart,
        periodEnd,
        ...(selectedEmployees.length > 0 && { employeeIds: selectedEmployees }),
      },
      {
        onSuccess: (data) => {
          setPayrunResult(data);
          setOpenDialog(true);
        },
        onError: (err) => {
          console.error("Failed to run payrun:", err);
          alert("Failed to run payrun");
        },
      }
    );
  };

  if (isLoading) {
    return <p>Loading employees...</p>;
  }

  if (isError) {
    return <p className="text-red-600">Failed to load employees</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card
          title="Payrun Parameters"
          className="border-l-4 border-l-purple-500"
        >
          <form className="space-y-6" onSubmit={handleRunPayrun}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Field label="Select Employees">
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={
                      employees.length > 0 &&
                      selectedEmployees.length === employees.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="select-all"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Select All ({employees.length})
                  </label>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {employees.map((emp) => (
                    <div key={emp.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={emp.id}
                        checked={selectedEmployees.includes(emp.id!)}
                        onChange={() => handleEmployeeToggle(emp.id!)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor={emp.id}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {emp.firstName} {emp.lastName} (${emp.baseHourlyRate}
                        /hr)
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Field>

            <Button type="submit" disabled={runPay.isPending} icon={Calculator}>
              {runPay.isPending ? "Processing..." : "Run Payrun"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Dialog for showing results */}
      {payrunResult && openDialog && (
        <Dialog
          title="Payrun Results"
          onClose={() => setOpenDialog(false)}
          width="70%"
          height="80%"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Gross Pay</p>
                <p className="text-2xl font-bold text-green-700">
                  ${payrunResult.totals.gross.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Total Tax</p>
                <p className="text-2xl font-bold text-red-700">
                  ${payrunResult.totals.tax.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Super</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${payrunResult.totals.super.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Net Pay</p>
                <p className="text-2xl font-bold text-gray-700">
                  ${payrunResult.totals.net.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Employee Breakdown
              </h4>
              <div className="space-y-2">
                {payrunResult.payslips.map((payslip) => {
                  const employee = employees.find(
                    (emp) => emp.id === payslip.employeeId
                  );
                  return (
                    <div
                      key={payslip.employeeId}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee
                            ? `${employee.firstName} ${employee.lastName}`
                            : payslip.employeeId}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payslip.normalHours}h + {payslip.overtimeHours}h OT
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${payslip.net.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">net</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default RunPay;
