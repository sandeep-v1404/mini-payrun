import { Routes, Route, Navigate } from "react-router-dom";
import { Users, Clock, FileText, Play, Building } from "lucide-react";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import EmployeesView from "@/pages/Employees";
import Timesheets from "@/pages/Timesheets";
import RunPay from "@/pages/RunPay";
import SummaryView from "@/pages/Summary";
import type { Employee, Payrun, Timesheet } from "@mini-payrun/shared";
import { useState, useEffect } from "react";

import { NavLink } from "react-router-dom";

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

export default function App() {
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

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: Building, path: "/" },
    { id: "employees", label: "Employees", icon: Users, path: "/employees" },
    { id: "timesheets", label: "Timesheets", icon: Clock, path: "/timesheets" },
    { id: "runpay", label: "Run Pay", icon: Play, path: "/runpay" },
    {
      id: "payruns",
      label: "Payrun Summary",
      icon: FileText,
      path: "/payruns",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-gray-50"
                        }`
                      }
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={<Dashboard employees={employees} payruns={payruns} />}
              />
              <Route
                path="/employees"
                element={
                  <EmployeesView
                    apiClient={apiClient}
                    employees={employees}
                    loading={loading}
                    setLoading={setLoading}
                    loadData={loadData}
                  />
                }
              />
              <Route
                path="/timesheets"
                element={
                  <Timesheets
                    apiClient={apiClient}
                    employees={employees}
                    loading={loading}
                    setLoading={setLoading}
                  />
                }
              />
              <Route
                path="/runpay"
                element={
                  <RunPay
                    loading={loading}
                    employees={employees}
                    setLoading={setLoading}
                    apiClient={apiClient}
                    loadData={loadData}
                  />
                }
              />
              <Route
                path="/payruns"
                element={
                  <SummaryView payruns={payruns} employees={employees} />
                }
              />

              {/* Redirect unknown paths to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
