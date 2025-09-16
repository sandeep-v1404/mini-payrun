"use client";

import StatsCard from "@/components/StatsCard";
import { DollarSign, FileText, TrendingUp, Users } from "lucide-react";
import Card from "@/components/Card";
import { useEmployees } from "@/api/employees";
import { usePayruns } from "@/api/payruns";
import { formatDate } from "@/utils/dayjs";

const Dashboard = () => {
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
  const { data: payruns = [], isLoading: loadingPayruns } = usePayruns();

  const totalEmployees = employees.length;
  const lastPayrun = payruns[payruns.length - 1];
  const totalPaid = lastPayrun
    ? `$${lastPayrun.totals.gross.toFixed(2)}`
    : "$0.00";
  const avgHourlyRate =
    employees.length > 0
      ? `$${(
          employees.reduce((sum, emp) => sum + emp.baseHourlyRate, 0) /
          employees.length
        ).toFixed(2)}`
      : "$0.00";

  return (
    <div className="space-y-8">
      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Users}
          label="Total Employees"
          value={loadingEmployees ? "..." : totalEmployees.toString()}
          color="blue"
        />
        <StatsCard
          icon={DollarSign}
          label="Last Payrun"
          value={loadingPayruns ? "..." : totalPaid}
          color="green"
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg Hourly Rate"
          value={loadingEmployees ? "..." : avgHourlyRate}
          color="purple"
        />
        <StatsCard
          icon={FileText}
          label="Total Payruns"
          value={loadingPayruns ? "..." : payruns.length.toString()}
          color="orange"
        />
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Recent Employees" subtitle="Latest employee additions">
          {loadingEmployees ? (
            <p className="text-gray-500">Loading employees...</p>
          ) : employees.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {employees.slice(-5).map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${emp.baseHourlyRate}/hr
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Super: {(emp.superRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No employees added yet</p>
          )}
        </Card>

        <Card title="Recent Payruns" subtitle="Latest payroll activity">
          {loadingPayruns ? (
            <p className="text-gray-500">Loading payruns...</p>
          ) : payruns.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {payruns.slice(-5).map((payrun) => (
                <div
                  key={payrun.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
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
                    <p className="text-sm text-gray-600">gross</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No payruns created yet</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
