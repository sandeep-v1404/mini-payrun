import Card from "@/components/Card";
import { usePayruns } from "@/api/payruns";
import { formatDate } from "@/utils/dayjs";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

// Payruns Summary View
const SummaryView = () => {
  const navigate = useNavigate();

  const hasRun = useRef(false);

  const {
    data: payruns = [],
    isLoading: loadingPayruns,
    refetch: refetchPayruns,
  } = usePayruns();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    refetchPayruns();
  }, [refetchPayruns]);

  if (loadingPayruns) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      <Card title="Payrun History">
        {payruns.length > 0 ? (
          <div className="space-y-2">
            {payruns.map((payrun) => (
              <div
                key={payrun.id}
                onClick={() => navigate(`/payruns/${payrun.id}`)}
                className="p-3 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex justify-between items-center">
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
  );
};

export default SummaryView;
