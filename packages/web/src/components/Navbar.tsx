import { Calculator, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/api/auth"; // adjust path

const Navbar = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync(undefined, {
      onSuccess: () => {
        navigate("/auth"); // redirect only after logout success
      },
      onError: () => {
        // Even if logout API fails, clear local state
        navigate("/auth");
      },
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Calculator className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mini Payrun</h1>
              <p className="text-sm text-gray-600">Manage your Payrolls</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={handleLogout}
              className="flex items-center cursor-pointer text-sm text-gray-600 hover:text-red-600 transition-colors"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-5 h-5 mr-1" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
