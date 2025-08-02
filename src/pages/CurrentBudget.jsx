import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, ArrowLeft } from "lucide-react";
import { useAppData } from "../contexts/AppDataContext";
import TransactionCard from "../components/TransactionCard";
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
    updateBudgetSettings,
  } = useAppData();
  const [showEditModal, setShowEditModal] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(
    settings.budget.amount.toString()
  );
  const [frequency, setFrequency] = useState(settings.budget.frequency);
  const [saving, setSaving] = useState(false);

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

  const handleSaveBudget = async () => {
    setSaving(true);
    try {
      await updateBudgetSettings({
        amount: parseFloat(budgetAmount),
        frequency: frequency,
      });
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating budget:", error);
    }
    setSaving(false);
  };

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
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Edit Budget
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudget}
                disabled={
                  saving || !budgetAmount || parseFloat(budgetAmount) <= 0
                }
                className="flex-1 px-4 py-3 bg-lime-600 text-white rounded-xl font-medium disabled:bg-gray-300"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentBudget;
