import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, ArrowLeft } from "lucide-react";
import { useAppData } from "../contexts/AppDataContext";
import TransactionCard from "../components/TransactionCard";
import EditBudgetModal from "../components/EditBudgetModal";
import { formatCurrency } from "../utils/formatCurrency";
import {
  getBudgetTextClass,
  getBudgetTextDarkClass,
  getBudgetProgressClass,
  getBudgetBackgroundClass,
  getBudgetAccentClass,
} from "../utils/budgetWarnings";

const CurrentBudget = () => {
  const navigate = useNavigate();
  const {
    transactions,
    settings,
    getCurrentMonthSpending,
    shouldShowWarning,
    getCurrentBudgetWarningState,
  } = useAppData();
  const [showEditModal, setShowEditModal] = useState(false);

  const currentSpending = getCurrentMonthSpending();
  const budgetLeft = settings.budget.amount - currentSpending;
  const showWarning = shouldShowWarning();
  const warningState = getCurrentBudgetWarningState();

  const now = new Date();
  const currentMonth = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Get current month's transactions
  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = transaction.date?.toDate();
    return (
      transactionDate &&
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear()
    );
  });

  const getProgressColor = () => {
    return getBudgetProgressClass(warningState);
  };

  const getProgressPercentage = () => {
    return parseFloat(
      ((currentSpending / settings.budget.amount) * 100).toFixed(0)
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
        <div className="flex items-center justify-between">
          <h1 className="select-none text-xl font-semibold text-gray-900">
            {currentMonth}
          </h1>
          <button onClick={() => setShowEditModal(true)} className="p-2 -mr-2">
            <Edit size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pt-20">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="flex justify-center mt-20">
            <div className="w-1/2 rounded-full h-2 bg-gray-200">
              <div
                className={`h-2 rounded-full transition-all duration-300 min-w-2 ${getProgressColor()}`}
                style={{ width: `${100 - getProgressPercentage()}%` }}
              />
            </div>
          </div>
          {/* Budget Overview */}
          <div className="text-center mt-8">
            <h1
              className={`text-5xl font-medium mb-2 ${getBudgetTextDarkClass(
                warningState
              )}`}
            >
              {budgetLeft >= 0
                ? `${formatCurrency(budgetLeft)} left`
                : `${formatCurrency(Math.abs(budgetLeft))} over`}
            </h1>
            <h2 className="text-gray-400 font-medium text-2xl">
              / {formatCurrency(settings.budget.amount)}
            </h2>
          </div>
          {/* Total spent */}
          <div
            className={`mt-12 mb-4 font-medium flex items-center justify-between p-4 px-6 text-xl rounded-full cursor-pointer hover:opacity-80 transition-all ${getBudgetBackgroundClass(
              warningState
            )} `}
          >
            <p className={getBudgetTextDarkClass(warningState)}>Total spent</p>
            <p className={getBudgetTextDarkClass(warningState)}>
              {formatCurrency(currentSpending)}{" "}
              <span className={getBudgetAccentClass(warningState)}>
                ({getProgressPercentage()}%)
              </span>
            </p>
          </div>
          {/* Spending History */}
          <div className="mb-6">
            <h3 className="text-2xl font-medium text-gray-900 text-center py-6">
              Transactions{" "}
              <span className="text-gray-400">
                ({currentMonthTransactions.length})
              </span>
            </h3>

            {currentMonthTransactions.length > 0 ? (
              <div className="space-y-3">
                {currentMonthTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={{
                      ...transaction,
                      date: transaction.date?.toDate() || new Date(),
                      color: settings?.transactionTypes?.types?.find(
                        (type) => type.id === transaction.categoryId
                      )?.color,
                    }}
                    onClick={() => navigate(`/transaction/${transaction.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl text-center">
                <p className="text-gray-500 mb-4">No transactions this month</p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-lime-600 text-white px-6 py-2 rounded-full font-medium"
                >
                  Add your first transaction
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
};

export default CurrentBudget;
