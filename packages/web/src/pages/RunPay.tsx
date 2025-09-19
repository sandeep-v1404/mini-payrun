/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Payrun } from "@mini-payrun/shared";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Calculator, Users, X } from "lucide-react";
import { useRunPay } from "@/api/payruns";
import { useEmployees } from "@/api/employees";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import { currentWeek } from "@/utils/dayjs";
import SelectableTable from "@/components/SelectedTable";

interface EmployeeBadgeProps {
  employee: any;
  onRemove: (id: string) => void;
}

const EmployeeBadge: React.FC<EmployeeBadgeProps> = ({
  employee,
  onRemove,
}) => (
  <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2">
    {employee.firstName} {employee.lastName}
    <button
      type="button"
      onClick={() => onRemove(employee.id)}
      className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
    >
      <X size={14} />
    </button>
  </div>
);

// Main RunPay component
const RunPay = () => {
  // Default to current week's Monday → Sunday
  const [periodStart, setPeriodStart] = useState(currentWeek().start);
  const [periodEnd, setPeriodEnd] = useState(currentWeek().end);

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEmpDialog, setOpenEmpDialog] = useState(false);
  const [payrunResult, setPayrunResult] = useState<Payrun | null>(null);

  const hasRun = useRef(false);

  const {
    data: employees = [],
    isPending,
    isError,
    refetch: refetchEmployees,
  } = useEmployees();
  const runPay = useRunPay();

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
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
    if (selectedEmployees.length === 0) {
      return;
    }

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

  const cancelSelection = useCallback(() => {
    setSelectedEmployees([]);
    setOpenEmpDialog(false);
  }, []);

  const closeDialog = useCallback(() => {
    setOpenEmpDialog(false);
  }, []);

  const onSelectionChange = useCallback((selected: string[]) => {
    setSelectedEmployees(selected);
  }, []);

  const selectedEmployeeObjects = useMemo(
    () => employees.filter((emp) => selectedEmployees.includes(emp.id!)),
    [employees, selectedEmployees]
  );

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    refetchEmployees();
  }, [refetchEmployees]);

  if (isPending) {
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

            <Field label="Employees">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users size={18} className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Selected Employees ({selectedEmployees.length})
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenEmpDialog(true)}
                  >
                    {selectedEmployees.length > 0
                      ? "Edit Selection"
                      : "Select Employees"}
                  </Button>
                </div>

                {selectedEmployees.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-wrap">
                      {selectedEmployeeObjects.map((employee) => (
                        <EmployeeBadge
                          key={employee.id}
                          employee={employee}
                          onRemove={handleRemoveEmployee}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    No employees selected yet
                  </div>
                )}

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
                    Select All Employees ({employees.length})
                  </label>
                </div>
              </div>
            </Field>

            <Button
              type="submit"
              disabled={runPay.isPending || selectedEmployees.length === 0}
              icon={Calculator}
            >
              {runPay.isPending ? "Processing..." : "Run Payrun"}
            </Button>
          </form>
        </Card>
      </div>

      {openEmpDialog && (
        <Dialog title="Select Employees" onClose={cancelSelection} width="90%">
          <SelectableTable
            selected={selectedEmployees}
            columns={[
              { key: "employeeCode", header: "Employee ID" },
              { key: "firstName", header: "First Name" },
              { key: "lastName", header: "Last Name" },
              { key: "department", header: "Department" },
            ]}
            data={employees}
            onSelectionChange={onSelectionChange}
          />
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={cancelSelection}>
              Cancel
            </Button>
            <Button type="button" onClick={closeDialog}>
              Confirm Selection
            </Button>
          </div>
        </Dialog>
      )}

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
