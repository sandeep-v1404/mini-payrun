import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import EmployeesView from "@/pages/Employees";
import Timesheets from "@/pages/Timesheets";
import RunPay from "@/pages/RunPay";
import SummaryView from "@/pages/Summary";
import Auth from "@/pages/Auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Payslip from "@/pages/Payslip";

// Create a new Layout component
function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}

// Then in your App component
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/employees" element={<EmployeesView />} />
                  <Route path="/timesheets" element={<Timesheets />} />
                  <Route path="/runpay" element={<RunPay />} />
                  <Route path="/payruns" element={<SummaryView />} />
                  <Route path="/payruns/:id" element={<Payslip />} />
                  <Route path="*" element={<div>Not Found</div>} />
                </Routes>
              </DefaultLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
