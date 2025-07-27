import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getBudgetBackgroundClass,
  getBudgetTextClass,
  getBudgetTextDarkClass,
  getBudgetAccentClass,
} from "../utils/budgetWarnings";

const AddTransactionHeader = ({
  step,
  showWarning,
  warningState,
  budgetLeft,
  budgetAmount,
  formatCurrency,
  onBackClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-white">
      <div className="flex items-center justify-center gap-4">
        <div
          onClick={() => navigate("/current-budget")}
          className={`flex-1 flex items-center justify-between gap-2 rounded-full px-6 h-14 cursor-pointer ${getBudgetBackgroundClass(
            warningState
          )} ${getBudgetTextDarkClass(warningState)} text-left`}
        >
          <div className="font-medium">Budget Left</div>
          <div className="text-lg font-medium">
            {formatCurrency(budgetLeft)}{" "}
            <span className={getBudgetAccentClass(warningState)}>
              / {formatCurrency(budgetAmount)}
            </span>
          </div>
        </div>

        <div
          onClick={() => navigate("/")}
          className="rounded-full bg-gray-100 p-4 aspect-square hover:bg-gray-200 cursor-pointer"
        >
          <Home size={24} />
        </div>
      </div>
    </div>
  );
};

export default AddTransactionHeader;
