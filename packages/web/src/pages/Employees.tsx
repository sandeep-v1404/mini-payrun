import React, { useState } from "react";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import { Edit3, Plus } from "lucide-react";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Dialog from "@/components/Dialog";

const EmployeesView = ({
  apiClient,
  employees,
  loading,
  setLoading,
  loadData,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
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
        id: formData.id || "",
        firstName: formData.firstName,
        lastName: formData.lastName,
        type: "hourly",
        baseHourlyRate: parseFloat(formData.baseHourlyRate),
        superRate: parseFloat(formData.superRate),
        bank:
          formData.bsb && formData.account
            ? { bsb: formData.bsb, account: formData.account }
            : undefined,
      };

      await apiClient.post("/employees", employeeData);
      await loadData();
      setShowDialog(false);
      setFormData({
        id: "",
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
      {/* Add Employee Button */}
      {/* <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage your employee records</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={Plus}>
          Add Employee
        </Button>
      </div> */}

      <div className="flex justify-end items-center">
        <Button onClick={() => setShowDialog(true)} icon={Plus}>
          Add Employee
        </Button>
      </div>

      {/* Dialog Popup */}
      {showDialog && (
        <Dialog title="Add New Employee" onClose={() => setShowDialog(false)}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="First Name" required>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                  required
                />
              </Field>

              <Field label="Last Name" required>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                  required
                />
              </Field>

              <Field label="Hourly Rate" required>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.baseHourlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, baseHourlyRate: e.target.value })
                  }
                  placeholder="35.00"
                  required
                />
              </Field>

              <Field label="Super Rate">
                <Input
                  type="number"
                  step="0.001"
                  value={formData.superRate}
                  onChange={(e) =>
                    setFormData({ ...formData, superRate: e.target.value })
                  }
                  placeholder="0.115"
                />
              </Field>

              <Field label="BSB (Optional)">
                <Input
                  value={formData.bsb}
                  onChange={(e) =>
                    setFormData({ ...formData, bsb: e.target.value })
                  }
                  placeholder="083-123"
                />
              </Field>

              <Field label="Account Number (Optional)">
                <Input
                  value={formData.account}
                  onChange={(e) =>
                    setFormData({ ...formData, account: e.target.value })
                  }
                  placeholder="12345678"
                />
              </Field>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Employee"}
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

      {/* Employee Table */}
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
              <td className="px-4 py-4 text-black">
                {(employee.superRate * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-4 text-black">
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
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit3}
                  onClick={() => {
                    setFormData({
                      id: employee.id,
                      firstName: employee.firstName,
                      lastName: employee.lastName,
                      baseHourlyRate: employee.baseHourlyRate.toString(),
                      superRate: employee.superRate.toString(),
                      bsb: employee.bank?.bsb || "",
                      account: employee.bank?.account || "",
                    });
                    setShowDialog(true);
                  }}
                >
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

export default EmployeesView;
