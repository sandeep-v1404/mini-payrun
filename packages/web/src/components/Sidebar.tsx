import { NavLink } from "react-router-dom";
import { Users, Clock, FileText, Play, Building } from "lucide-react";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: Building, path: "/" },
  { id: "employees", label: "Employees", icon: Users, path: "/employees" },
  { id: "timesheets", label: "Timesheets", icon: Clock, path: "/timesheets" },
  { id: "runpay", label: "Run Pay", icon: Play, path: "/runpay" },
  { id: "payruns", label: "Payrun History", icon: FileText, path: "/payruns" },
];

export default function Sidebar() {
  return (
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
  );
}
