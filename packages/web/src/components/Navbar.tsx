import { Calculator } from "lucide-react";

const Navbar = () => {
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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString("en-AU")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
