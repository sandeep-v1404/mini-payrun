import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import Card from "@/components/Card";
import Table, { type TableColumn } from "@/components/Table";
import Button from "@/components/Button";
import { Edit3, Plus } from "lucide-react";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Dialog from "@/components/Dialog";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useUpdateEmployee,
} from "@/api/employees";
import type { Employee } from "@mini-payrun/shared";

const defaultFormData = {
  id: "",
  firstName: "",
  lastName: "",
  baseHourlyRate: "",
  superRate: "0.115",
  bsb: "",
  account: "",
};

const EmployeesView = () => {
  const {
    data: employees = [],
    isPending,
    refetch: refetchEmployees,
  } = useEmployees(); // Assuming refetch is provided
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );

  const hasRun = useRef(false);

  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const employeeData = {
        id: formData.id || undefined,
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

      const mutation = formData.id ? updateEmployee : createEmployee;

      mutation.mutate(employeeData, {
        onSuccess: () => {
          setShowDialog(false);
          resetForm();
          refetchEmployees();
        },
      });
    },
    [formData, resetForm, createEmployee, updateEmployee, refetchEmployees]
  );

  const handleDelete = useCallback(() => {
    if (!employeeToDelete) return;
    deleteEmployee.mutate(employeeToDelete.id!, {
      onSuccess: () => {
        setEmployeeToDelete(null);
        refetchEmployees();
      },
    });
  }, [deleteEmployee, employeeToDelete, refetchEmployees]);

  const handleEditClick = useCallback((employee: Employee) => {
    setFormData({
      id: employee.id!,
      firstName: employee.firstName,
      lastName: employee.lastName,
      baseHourlyRate: employee.baseHourlyRate.toString(),
      superRate: employee.superRate.toString(),
      bsb: employee.bank?.bsb || "",
      account: employee.bank?.account || "",
    });
    setShowDialog(true);
  }, []);

  const handleDeleteClick = useCallback((employee: Employee) => {
    setEmployeeToDelete(employee);
  }, []);

  const employeeColumns: TableColumn[] = useMemo(() => {
    const columnsArr: TableColumn[] = [
      {
        key: "name",
        header: "Name",
        render: (_, employee: Employee) => (
          <div>
            <p className="font-medium text-gray-900">
              {employee.firstName} {employee.lastName}
            </p>
            <p className="text-sm text-gray-600">ID: {employee.id}</p>
          </div>
        ),
      },
      {
        key: "baseHourlyRate",
        header: "Hourly Rate",
        render: (value: number) => (
          <span className="text-green-600 font-semibold">
            ${value.toFixed(2)}
          </span>
        ),
      },
      {
        key: "superRate",
        header: "Super Rate",
        render: (value: number) => (
          <span className="text-black">{(value * 100).toFixed(1)}%</span>
        ),
      },
      {
        key: "bank",
        header: "Bank Details",
        render: (bank: Employee["bank"]) =>
          bank ? (
            <div className="text-sm text-black">
              <p>BSB: {bank.bsb}</p>
              <p>Acc: {bank.account}</p>
            </div>
          ) : (
            <span className="text-gray-400">Not provided</span>
          ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (_, employee: Employee) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Edit3}
              onClick={() => handleEditClick(employee)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteClick(employee)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ];
    return columnsArr;
  }, [handleEditClick, handleDeleteClick]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    refetchEmployees();
  }, [refetchEmployees]);

  return (
    <div className="space-y-8">
      {/* Add Employee Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage your employee records</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          icon={Plus}
          disabled={createEmployee.isPending || updateEmployee.isPending}
        >
          {createEmployee.isPending || updateEmployee.isPending
            ? "Loading..."
            : "Add Employee"}
        </Button>
      </div>

      {/* Dialog Popup */}
      {showDialog && (
        <Dialog
          title={formData.id ? "Edit Employee" : "Add New Employee"}
          onClose={() => setShowDialog(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <Field label="First Name" required>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                  required
                  disabled={
                    createEmployee.isPending || updateEmployee.isPending
                  }
                />
              </Field>

              {/* Last Name */}
              <Field label="Last Name" required>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                  required
                  disabled={
                    createEmployee.isPending || updateEmployee.isPending
                  }
                />
              </Field>

              {/* Hourly Rate */}
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
                  disabled={
                    createEmployee.isPending || updateEmployee.isPending
                  }
                />
              </Field>

              {/* Super Rate */}
              <Field label="Super Rate">
                <Input
                  type="number"
                  step="0.001"
                  value={formData.superRate}
                  onChange={(e) =>
                    setFormData({ ...formData, superRate: e.target.value })
                  }
                  placeholder=""
                  disabled={
                    createEmployee.isPending || updateEmployee.isPending
                  }
                />
              </Field>

              {/* BSB */}
              <Field label="BSB (Optional)">
                <Input
                  value={formData.bsb}
                  onChange={(e) =>
                    setFormData({ ...formData, bsb: e.target.value })
                  }
                  placeholder="083-123"
                  disabled={
                    createEmployee.isPending || updateEmployee.isPending
                  }
                />
              </Field>

              {/* Account */}
              <Field label="Account Number (Optional)">
                <Input
                  value={formData.account}
                  onChange={(e) =>
                    setFormData({ ...formData, account: e.target.value })
                  }
                  placeholder="12345678"
                  disabled={
                    createEmployee.isPending || updateEmployee.isPending
                  }
                />
              </Field>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  createEmployee.isPending ||
                  updateEmployee.isPending ||
                  deleteEmployee.isPending
                }
              >
                {createEmployee.isPending || updateEmployee.isPending
                  ? "Saving..."
                  : formData.id
                  ? "Update Employee"
                  : "Save Employee"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDialog(false)}
                disabled={
                  createEmployee.isPending ||
                  updateEmployee.isPending ||
                  deleteEmployee.isPending
                }
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
          columns={employeeColumns}
          data={employees}
          isLoading={isPending}
          emptyMessage="No employees found"
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      {employeeToDelete && (
        <Dialog
          title="Confirm Delete"
          onClose={() => setEmployeeToDelete(null)}
          width="400px"
          height="200px"
        >
          <div className="flex flex-col justify-between h-full text-black">
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {employeeToDelete.firstName} {employeeToDelete.lastName}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <Button
                variant="ghost"
                onClick={() => setEmployeeToDelete(null)}
                disabled={deleteEmployee.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteEmployee.isPending}
              >
                {deleteEmployee.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default EmployeesView;
