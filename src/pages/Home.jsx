import { useNavigate } from "react-router-dom";
import { ChevronRight, Plus, PlusCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import TransactionCard from "../components/TransactionCard";
import { formatCurrency } from "../utils/formatCurrency";
import {
  getBudgetBackgroundClass,
  getBudgetTextClass,
  getBudgetTextDarkClass,
  getBudgetTextExtraDarkClass,
  getBudgetProgressClass,
  getOverBudgetBackgroundClass,
  getOverBudgetTextClass,
  getOverBudgetTextDarkClass,
  getOverBudgetAccentClass,
  getBatteryWaveColor,
  WARNING_STATES,
} from "../utils/budgetWarnings";

const Home = () => {
  const { user } = useAuth();
  const {
    transactions,
    settings,
    getCurrentMonthSpending,
    getMonthSpending,
    shouldShowWarning,
    getCurrentBudgetWarningState,
    loading,
  } = useAppData();
  const navigate = useNavigate();

  const getCurrentMonthPercentage = () => {
    const spending = getCurrentMonthSpending();
    const budget = settings.budget.amount;
    const percentageLeft = Math.round(((budget - spending) / budget) * 100);
    return Math.max(0, percentageLeft);
  };

  const getLastMonthSpending = () => {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return getMonthSpending(lastMonthYear, lastMonth);
  };

  const getLastMonthData = () => {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return { year: lastMonthYear, month: lastMonth };
  };

  const recentTransactions = transactions.slice(0, 4);
  const currentSpending = getCurrentMonthSpending();
  const lastMonthSpending = getLastMonthSpending();
  const budgetLeft = settings.budget.amount - currentSpending;
  const showWarning = shouldShowWarning();
  const warningState = getCurrentBudgetWarningState();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 md-spinner"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <h1 className="pt-[15vh] text-3xl font-medium text-gray-900 text-center">
        Budget Buddy
      </h1>

      {/* Main Content */}
      <main className="px-4 py-6 pt-20">
        <div className="max-w-md mx-auto space-y-3">
          {/* Budget Battery Widget */}
          <div
            className={`p-4 rounded-3xl bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors`}
            onClick={() => navigate("/current-budget")}
          >
            <div className="relative">
              {/* Battery Container */}
              <div
                className={`relative h-24 rounded-2xl overflow-hidden ${getBudgetBackgroundClass(
                  warningState
                )} bg-opacity-30`}
              >
                {/* Battery Fill */}
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out `}
                  style={{
                    width: `${getCurrentMonthPercentage()}%`,
                    backgroundColor: getBatteryWaveColor(warningState),
                  }}
                />

                {/* Battery Wave at the end of fill */}
                <div
                  className="absolute top-0 -translate-x-[1px] h-full w-5 transition-all duration-500 ease-out"
                  style={{
                    left: `${getCurrentMonthPercentage()}%`,
                  }}
                >
                  <svg
                    viewBox="0 0 20 118"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-auto"
                  >
                    <path
                      d="M19.7812 0C18.0986 11.2927 7.26764 12.3167 7.26758 25.498C7.26758 39.7896 19.9997 39.7898 20 54.0811C20 68.3727 7.26758 68.3734 7.26758 82.665C7.26771 96.9564 19.9999 96.9566 20 111.248C20 113.943 19.5472 116.13 18.8125 118H0V0H19.7812Z"
                      fill={getBatteryWaveColor(warningState)}
                    />
                  </svg>
                </div>

                {/* Percentage Text - positioned based on percentage */}
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 text-6xl font-medium px-6 ${
                    getCurrentMonthPercentage() > 50
                      ? "left-0 text-white"
                      : `right-0 ${getBudgetTextExtraDarkClass(warningState)}`
                  }`}
                >
                  {getCurrentMonthPercentage()}
                  <span className="text-3xl">%</span>
                </div>
              </div>

              {/* Budget Details */}
              <div className="mt-4 text-center flex justify-between items-center">
                <p className={`font-medium `}>Budget left</p>
                <p
                  className={`text-xl font-medium ${getBudgetTextClass(
                    warningState
                  )}`}
                >
                  {formatCurrency(budgetLeft)}
                  <span className={`text-gray-400`}>
                    {" "}
                    / {formatCurrency(settings.budget.amount)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Last Month Spending Widget */}
            <div
              className={`col-span-2 p-6 rounded-4xl cursor-pointer hover:opacity-80 transition-opacity ${getOverBudgetBackgroundClass(
                lastMonthSpending,
                settings.budget.amount
              )} `}
              onClick={() => {
                const { year, month } = getLastMonthData();
                navigate(`/history/${year}/${month}`);
              }}
            >
              <div className="text-center space-y-2 font-medium text-lg">
                <p>last month</p>
                <div
                  className={`text-2xl ${getOverBudgetTextDarkClass(
                    lastMonthSpending,
                    settings.budget.amount
                  )}`}
                >
                  {formatCurrency(lastMonthSpending)}
                  <span
                    className={getOverBudgetAccentClass(
                      lastMonthSpending,
                      settings.budget.amount
                    )}
                  >
                    {" "}
                    / {formatCurrency(settings.budget.amount)}
                  </span>
                </div>
                <p>spent</p>
              </div>
            </div>

            {/* New Transaction Button */}
            <button
              onClick={() => navigate("/add-transaction")}
              className="col-span-1 h-full bg-gray-100 rounded-4xl font-medium text-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-200 transition-colors p-4"
            >
              <PlusCircle size={24} />
              <span className="text-xl">New</span>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="mb-6">
            <h3 className="text-2xl font-medium text-gray-900 text-center py-6">
              Recent Transactions
            </h3>

            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
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
              <div className="bg-white p-8 rounded-4xl text-center border border-gray-100">
                <p className="text-gray-500 mb-4">No transactions yet</p>
              </div>
            )}
            <div
              className="mt-3 mb-8 font-medium flex items-center justify-between p-4 px-6 text-xl rounded-full bg-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate("/all-transactions")}
            >
              <p>See All</p>
              <ChevronRight />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
