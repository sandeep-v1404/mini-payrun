import { useParams, useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/dayjs";
import Table, { type TableColumn } from "@/components/Table";
import Button from "@/components/Button";
import { FileText } from "lucide-react";
import { useCallback, useMemo } from "react";
import { usePayrunWithId } from "@/api/payruns";

const Payslip = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: payrun, isLoading, error } = usePayrunWithId(id!);

  const openPayslip = useCallback((url: string) => {
    window.open(url, "_blank");
  }, []);

  const payslipColumns: TableColumn[] = useMemo(() => {
    return [
      {
        key: "employee",
        header: "Employee",
        render: (_, payslip) => (
          <span className="font-medium text-gray-900">
            {payslip.employee
              ? `${payslip.employee.firstName} ${payslip.employee.lastName}`
              : payslip.employeeId}
          </span>
        ),
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
  }, [openPayslip]);

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">Error loading payrun</p>;
  if (!payrun) return <p className="text-gray-500">Payrun not found</p>;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <h2 className="text-xl font-bold text-black">
        Payrun: {formatDate(payrun.periodStart)} -{" "}
        {formatDate(payrun.periodEnd)}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-green-600 font-medium">Gross</p>
          <p className="text-xl font-bold text-green-700">
            ${payrun.totals.gross.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-sm text-red-600 font-medium">Tax</p>
          <p className="text-xl font-bold text-red-700">
            ${payrun.totals.tax.toFixed(2)}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-blue-600 font-medium">Super</p>
          <p className="text-xl font-bold text-blue-700">
            ${payrun.totals.super.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600 font-medium">Net</p>
          <p className="text-xl font-bold text-gray-700">
            ${payrun.totals.net.toFixed(2)}
          </p>
        </div>
      </div>

      <Table
        columns={payslipColumns}
        data={payrun.payslips}
        emptyMessage="No payslips found"
      />
    </div>
  );
};

export default Payslip;
