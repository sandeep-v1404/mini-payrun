import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import EmployeesView from "@/pages/Employees";
import Timesheets from "@/pages/Timesheets";
import RunPay from "@/pages/RunPay";
import SummaryView from "@/pages/Summary";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeesView />} />
              <Route path="/timesheets" element={<Timesheets />} />
              <Route path="/runpay" element={<RunPay />} />
              <Route path="/payruns" element={<SummaryView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
