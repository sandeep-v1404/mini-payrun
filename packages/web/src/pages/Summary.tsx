import Button from "@/components/Button";
import Card from "@/components/Card";
import Table, { type TableColumn } from "@/components/Table";
import Dialog from "@/components/Dialog";
import type { Payrun } from "@mini-payrun/shared";
import { FileText } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useEmployees } from "@/api/employees";
import { usePayruns } from "@/api/payruns";
import { formatDate } from "@/utils/dayjs";

// Payruns Summary View
const SummaryView = () => {
  const { data: payruns = [], isLoading: loadingPayruns } = usePayruns();
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
  const [selectedPayrun, setSelectedPayrun] = useState<Payrun | null>(null);

  const openPayslip = useCallback((url: string) => {
    window.open(url, "_blank");
  }, []);

  // Define columns for the payslips table
  const payslipColumns: TableColumn[] = useMemo(() => {
    const columnsArr: TableColumn[] = [
      {
        key: "employee",
        header: "Employee",
        render: (_, payslip) => {
          const emp = employees.find((e) => e.id === payslip.employeeId);
          return (
            <span className="font-medium text-gray-900">
              {emp ? `${emp.firstName} ${emp.lastName}` : payslip.employeeId}
            </span>
          );
        },
      },
      {
        key: "hours",
        header: "Hours",
        render: (_, payslip) => (
          <div className="text-sm">
            <p className="text-black">{payslip.normalHours}h regular</p>
            {payslip.overtimeHours > 0 && (
              <p className="text-orange-600">
                {payslip.overtimeHours}h overtime
              </p>
            )}
          </div>
        ),
      },
      {
        key: "gross",
        header: "Gross",
        render: (value) => (
          <span className="font-semibold text-green-600">
            ${value.toFixed(2)}
          </span>
        ),
      },
      {
        key: "tax",
        header: "Tax",
        render: (value) => (
          <span className="font-semibold text-red-600">
            ${value.toFixed(2)}
          </span>
        ),
      },
      {
        key: "super",
        header: "Super",
        render: (value) => (
          <span className="font-semibold text-blue-600">
            ${value.toFixed(2)}
          </span>
        ),
      },
      {
        key: "net",
        header: "Net",
        render: (value) => (
          <span className="font-semibold text-gray-900">
            ${value.toFixed(2)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (_, payslip) => (
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => openPayslip(payslip.pdfUrl!)}
          >
            View Payslip
          </Button>
        ),
      },
    ];
    return columnsArr;
  }, [employees, openPayslip]);

  if (loadingPayruns || loadingEmployees) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Payrun History">
            {payruns.length > 0 ? (
              <div className="space-y-2">
                {payruns.map((payrun) => (
                  <div
                    key={payrun.id}
                    onClick={() => setSelectedPayrun(payrun)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPayrun?.id === payrun.id
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(payrun.periodStart)} -{" "}
                          {formatDate(payrun.periodEnd)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payrun.payslips.length} employees
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${payrun.totals.gross.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">gross</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No payruns found</p>
            )}
          </Card>
        </div>
      </div>

      {/* Inline Dialog */}
      {selectedPayrun && (
        <Dialog
          title={`Payrun Details - ${formatDate(
            selectedPayrun.periodStart
          )} to ${formatDate(selectedPayrun.periodEnd)}`}
          onClose={() => setSelectedPayrun(null)}
          width="80%"
          height="80%"
        >
          <div className="space-y-6">
            {/* Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-green-600 font-medium">Gross</p>
                <p className="text-xl font-bold text-green-700">
                  ${selectedPayrun.totals.gross.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-red-600 font-medium">Tax</p>
                <p className="text-xl font-bold text-red-700">
                  ${selectedPayrun.totals.tax.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-600 font-medium">Super</p>
                <p className="text-xl font-bold text-blue-700">
                  ${selectedPayrun.totals.super.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 font-medium">Net</p>
                <p className="text-xl font-bold text-gray-700">
                  ${selectedPayrun.totals.net.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payslips Table */}
            <Table
              columns={payslipColumns}
              data={selectedPayrun.payslips}
              emptyMessage="No payslips found"
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default SummaryView;
