import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Calculator,
  FileText,
  Plus,
  Edit3,
  Play,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
} from "lucide-react";

// Types
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
  baseHourlyRate: number;
  superRate: number;
  bank?: {
    bsb: string;
    account: string;
  };
}

interface TimesheetEntry {
  date: string;
  start: string;
  end: string;
  unpaidBreakMins: number;
}

interface Timesheet {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  entries: TimesheetEntry[];
  allowances?: number;
}

interface Payslip {
  employeeId: string;
  normalHours: number;
  overtimeHours: number;
  gross: number;
  tax: number;
  super: number;
  net: number;
}

interface Payrun {
  id: string;
  periodStart: string;
  periodEnd: string;
  totals: {
    gross: number;
    tax: number;
    super: number;
    net: number;
  };
  payslips: Payslip[];
}

const API_BASE = "http://localhost:4000";
const AUTH_TOKEN = "demo-token";

// API Client
const apiClient = {
  get: async (url: string) => {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  post: async (url: string, data: any) => {
    const response = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};

// Components
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEventHandler<HTMLButtonElement> | undefined) => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  icon?: any;
}) => {
  const baseClasses =
    "inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-white",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {Icon && <Icon size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />}
      {children}
    </button>
  );
};

const Card = ({
  children,
  className = "",
  title,
  subtitle,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) => (
  <div
    className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}
  >
    {(title || subtitle) && (
      <div className="p-6 border-b border-gray-100">
        {title && (
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        )}
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const FormField = ({
  label,
  children,
  required = false,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  className = "",
}: {
  type?: string;
  placeholder?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
  />
);

const Select = ({
  value,
  onChange,
  children,
  className = "",
}: {
  value: any;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
  >
    {children}
  </select>
);

const StatsCard = ({
  icon: Icon,
  label,
  value,
  color = "blue",
}: {
  icon: any;
  label: string;
  value: string;
  color?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center">
        <div
          className={`p-3 rounded-lg ${
            colorClasses[color] || colorClasses.blue
          }`}
        >
          <Icon size={24} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const Table = ({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-4 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">{children}</tbody>
    </table>
  </div>
);

// Main App Component
export default function PayrollApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [payruns, setPayruns] = useState<Payrun[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [employeesData, payrunsData] = await Promise.all([
        apiClient.get("/employees"),
        apiClient.get("/payruns"),
      ]);
      setEmployees(employeesData);
      setPayruns(payrunsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  // Dashboard View
  const Dashboard = () => {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your payroll system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Users}
            label="Total Employees"
            value={totalEmployees.toString()}
            color="blue"
          />
          <StatsCard
            icon={DollarSign}
            label="Last Payrun"
            value={totalPaid}
            color="green"
          />
          <StatsCard
            icon={TrendingUp}
            label="Avg Hourly Rate"
            value={avgHourlyRate}
            color="purple"
          />
          <StatsCard
            icon={FileText}
            label="Total Payruns"
            value={payruns.length.toString()}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Recent Employees" subtitle="Latest employee additions">
            {employees.length > 0 ? (
              <div className="space-y-3">
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
            {payruns.length > 0 ? (
              <div className="space-y-3">
                {payruns.slice(-5).map((payrun) => (
                  <div
                    key={payrun.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(payrun.periodStart).toLocaleDateString()} -{" "}
                        {new Date(payrun.periodEnd).toLocaleDateString()}
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

  // Employees View
  const EmployeesView = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      baseHourlyRate: "",
      superRate: "0.115",
      bsb: "",
      account: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const employeeData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          type: "hourly",
          baseHourlyRate: parseFloat(formData.baseHourlyRate),
          superRate: parseFloat(formData.superRate),
          bank:
            formData.bsb && formData.account
              ? {
                  bsb: formData.bsb,
                  account: formData.account,
                }
              : undefined,
        };

        await apiClient.post("/employees", employeeData);
        await loadData();
        setShowForm(false);
        setFormData({
          firstName: "",
          lastName: "",
          baseHourlyRate: "",
          superRate: "0.115",
          bsb: "",
          account: "",
        });
      } catch (error) {
        console.error("Failed to save employee:", error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-600 mt-2">Manage your employee records</p>
          </div>
          <Button onClick={() => setShowForm(true)} icon={Plus}>
            Add Employee
          </Button>
        </div>

        {showForm && (
          <Card
            title="Add New Employee"
            className="border-l-4 border-l-blue-500"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="First Name" required>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="Enter first name"
                    required
                  />
                </FormField>

                <FormField label="Last Name" required>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Enter last name"
                    required
                  />
                </FormField>

                <FormField label="Hourly Rate" required>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.baseHourlyRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseHourlyRate: e.target.value,
                      })
                    }
                    placeholder="35.00"
                    required
                  />
                </FormField>

                <FormField label="Super Rate">
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.superRate}
                    onChange={(e) =>
                      setFormData({ ...formData, superRate: e.target.value })
                    }
                    placeholder="0.115"
                  />
                </FormField>

                <FormField label="BSB (Optional)">
                  <Input
                    value={formData.bsb}
                    onChange={(e) =>
                      setFormData({ ...formData, bsb: e.target.value })
                    }
                    placeholder="083-123"
                  />
                </FormField>

                <FormField label="Account Number (Optional)">
                  <Input
                    value={formData.account}
                    onChange={(e) =>
                      setFormData({ ...formData, account: e.target.value })
                    }
                    placeholder="12345678"
                  />
                </FormField>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Employee"}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <Table
            headers={[
              "Name",
              "Hourly Rate",
              "Super Rate",
              "Bank Details",
              "Actions",
            ]}
          >
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-sm text-gray-600">ID: {employee.id}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-green-600 font-semibold">
                    ${employee.baseHourlyRate.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {(employee.superRate * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-4">
                  {employee.bank ? (
                    <div className="text-sm">
                      <p>BSB: {employee.bank.bsb}</p>
                      <p>Acc: {employee.bank.account}</p>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <Button variant="ghost" size="sm" icon={Edit3}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    );
  };

  // Timesheets View
  const TimesheetsView = () => {
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [periodStart, setPeriodStart] = useState("2025-08-11");
    const [periodEnd, setPeriodEnd] = useState("2025-08-17");
    const [entries, setEntries] = useState<TimesheetEntry[]>([
      { date: "2025-08-11", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
    ]);
    const [allowances, setAllowances] = useState("0");

    const addEntry = () => {
      const nextDate = new Date(
        entries[entries.length - 1]?.date || periodStart
      );
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-600 mt-2">Record employee working hours</p>
        </div>

        <Card
          title="Create Timesheet"
          className="border-l-4 border-l-green-500"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Employee" required>
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
              </FormField>

              <FormField label="Period Start" required>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Period End" required>
                <Input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  required
                />
              </FormField>
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
                    <FormField label="Date">
                      <Input
                        type="date"
                        value={entry.date}
                        onChange={(e) =>
                          updateEntry(index, "date", e.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Start Time">
                      <Input
                        type="time"
                        value={entry.start}
                        onChange={(e) =>
                          updateEntry(index, "start", e.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="End Time">
                      <Input
                        type="time"
                        value={entry.end}
                        onChange={(e) =>
                          updateEntry(index, "end", e.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Break (mins)">
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
                    </FormField>

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

            <FormField label="Allowances ($)">
              <Input
                type="number"
                step="0.01"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
                placeholder="0.00"
              />
            </FormField>

            <Button type="submit" disabled={loading || !selectedEmployee}>
              {loading ? "Saving..." : "Save Timesheet"}
            </Button>
          </form>
        </Card>
      </div>
    );
  };

  // Run Payrun View
  const RunPayrunView = () => {
    const [periodStart, setPeriodStart] = useState("2025-08-11");
    const [periodEnd, setPeriodEnd] = useState("2025-08-17");
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [payrunResult, setPayrunResult] = useState<Payrun | null>(null);

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
          : employees.map((emp) => emp.id)
      );
    };

    const handleRunPayrun = async (e: any) => {
      e.preventDefault();
      setLoading(true);
      try {
        const payrunData = {
          periodStart,
          periodEnd,
          employeeIds:
            selectedEmployees.length > 0 ? selectedEmployees : undefined,
        };

        const result = await apiClient.post("/payruns", payrunData);
        setPayrunResult(result);
        await loadData(); // Refresh payruns list
      } catch (error) {
        console.error("Failed to run payrun:", error);
        alert("Failed to run payrun");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Run Payrun</h1>
          <p className="text-gray-600 mt-2">
            Generate payroll for selected period
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card
            title="Payrun Parameters"
            className="border-l-4 border-l-purple-500"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Period Start" required>
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Period End" required>
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Select Employees">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectedEmployees.length === employees.length}
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
                          checked={selectedEmployees.includes(emp.id)}
                          onChange={() => handleEmployeeToggle(emp.id)}
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
              </FormField>

              <Button
                onClick={(e) => handleRunPayrun(e)}
                disabled={loading}
                icon={Calculator}
              >
                {loading ? "Processing..." : "Run Payrun"}
              </Button>
            </form>
          </Card>

          {payrunResult && (
            <Card
              title="Payrun Results"
              className="border-l-4 border-l-green-500"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">
                      Gross Pay
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      ${payrunResult.totals.gross.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">
                      Total Tax
                    </p>
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
                              {payslip.normalHours}h + {payslip.overtimeHours}h
                              OT
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
            </Card>
          )}
        </div>
      </div>
    );
  };

  // Payruns Summary View
  const PayrunsSummaryView = () => {
    const [selectedPayrun, setSelectedPayrun] = useState<Payrun | null>(null);

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payrun Summary</h1>
          <p className="text-gray-600 mt-2">
            View payroll history and payslips
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
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
                            {new Date(payrun.periodStart).toLocaleDateString()}{" "}
                            - {new Date(payrun.periodEnd).toLocaleDateString()}
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

          <div className="lg:col-span-2">
            {selectedPayrun ? (
              <Card
                title={`Payrun Details - ${new Date(
                  selectedPayrun.periodStart
                ).toLocaleDateString()} to ${new Date(
                  selectedPayrun.periodEnd
                ).toLocaleDateString()}`}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-green-600 font-medium">
                        Gross
                      </p>
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

                  <Table
                    headers={[
                      "Employee",
                      "Hours",
                      "Gross",
                      "Tax",
                      "Super",
                      "Net",
                      "Actions",
                    ]}
                  >
                    {selectedPayrun.payslips.map((payslip) => {
                      const employee = employees.find(
                        (emp) => emp.id === payslip.employeeId
                      );
                      return (
                        <tr
                          key={payslip.employeeId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-4">
                            <p className="font-medium text-gray-900">
                              {employee
                                ? `${employee.firstName} ${employee.lastName}`
                                : payslip.employeeId}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              <p>{payslip.normalHours}h regular</p>
                              {payslip.overtimeHours > 0 && (
                                <p className="text-orange-600">
                                  {payslip.overtimeHours}h overtime
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold text-green-600">
                            ${payslip.gross.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-red-600">
                            ${payslip.tax.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-blue-600">
                            ${payslip.super.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-900">
                            ${payslip.net.toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <Button variant="outline" size="sm" icon={FileText}>
                              View Payslip
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </Table>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    Select a payrun to view details
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Navigation
  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: Building },
    { id: "employees", label: "Employees", icon: Users },
    { id: "timesheets", label: "Timesheets", icon: Clock },
    { id: "runpay", label: "Run Pay", icon: Play },
    { id: "payruns", label: "Payrun Summary", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Calculator className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mini Payrun</h1>
                <p className="text-sm text-gray-600">
                  Payroll Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString("en-AU")}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "employees" && <EmployeesView />}
            {activeTab === "timesheets" && <TimesheetsView />}
            {activeTab === "runpay" && <RunPayrunView />}
            {activeTab === "payruns" && <PayrunsSummaryView />}
          </main>
        </div>
      </div>
    </div>
  );
}
