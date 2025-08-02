import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppData } from "../contexts/AppDataContext";
import TransactionCard from "../components/TransactionCard";
import { formatCurrency } from "../utils/formatCurrency";
import {
  getOverBudgetWarningState,
  getOverBudgetBackgroundClass,
  getOverBudgetTextClass,
  getOverBudgetTextDarkClass,
  getBudgetTextDarkClass,
  getBudgetAccentClass,
  getBudgetBackgroundClass,
} from "../utils/budgetWarnings";

const MonthBudgetHistory = () => {
  const navigate = useNavigate();
  const { year: yearParam, month: monthParam } = useParams();
  const { transactions, settings, getMonthSpending } = useAppData();
  const [selectedYear, setSelectedYear] = useState(parseInt(yearParam));
  const [selectedMonth, setSelectedMonth] = useState(parseInt(monthParam));

  const formatMonth = (year, month) => {
    const date = new Date(year, month);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const getMonthTransactions = (year, month) => {
    return transactions.filter((transaction) => {
      const date = transaction.date?.toDate();
      return date && date.getFullYear() === year && date.getMonth() === month;
    });
  };

  const hasDataForMonth = (year, month) => {
    return getMonthTransactions(year, month).length > 0;
  };

  const isMonthInFuture = (year, month) => {
    const now = new Date();
    const targetDate = new Date(year, month);
    const currentDate = new Date(now.getFullYear(), now.getMonth());
    return targetDate > currentDate;
  };

  const getPreviousMonth = (year, month) => {
    if (month === 0) {
      return { year: year - 1, month: 11 };
    }
    return { year, month: month - 1 };
  };

  const getNextMonth = (year, month) => {
    if (month === 11) {
      return { year: year + 1, month: 0 };
    }
    return { year, month: month + 1 };
  };

  // Get all available years with transaction data
  const getAvailableYears = () => {
    const years = new Set();
    transactions.forEach((transaction) => {
      const date = transaction.date?.toDate();
      if (date) {
        years.add(date.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  };

  // Get available months for a specific year
  const getAvailableMonthsForYear = (year) => {
    const months = new Set();
    transactions.forEach((transaction) => {
      const date = transaction.date?.toDate();
      if (date && date.getFullYear() === year) {
        months.add(date.getMonth());
      }
    });
    return Array.from(months).sort((a, b) => a - b); // Sort ascending
  };

  const spending = getMonthSpending(selectedYear, selectedMonth);
  const monthTransactions = getMonthTransactions(selectedYear, selectedMonth);
  const budget =
    monthTransactions.length > 0
      ? monthTransactions[0].budgetForMonth
      : settings.budget.amount;
  const leftover = budget - spending;
  const isOverBudget = spending > budget;
  const warningState = getOverBudgetWarningState(spending, budget);

  // Check if navigation buttons should be disabled
  const previousMonth = getPreviousMonth(selectedYear, selectedMonth);
  const nextMonth = getNextMonth(selectedYear, selectedMonth);
  const isPreviousDisabled = !hasDataForMonth(
    previousMonth.year,
    previousMonth.month
  );
  const isNextDisabled =
    !hasDataForMonth(nextMonth.year, nextMonth.month) ||
    isMonthInFuture(nextMonth.year, nextMonth.month);

  // Get available data for selects
  const availableYears = getAvailableYears();
  const availableMonthsForSelectedYear =
    getAvailableMonthsForYear(selectedYear);

  // Handle year change
  const handleYearChange = (newYear) => {
    const newYearInt = parseInt(newYear);
    const availableMonthsForNewYear = getAvailableMonthsForYear(newYearInt);

    if (availableMonthsForNewYear.length > 0) {
      setSelectedYear(newYearInt);
      // If current month is not available in new year, select the first available month
      if (!availableMonthsForNewYear.includes(selectedMonth)) {
        setSelectedMonth(availableMonthsForNewYear[0]);
      }
    }
  };

  // Handle month change
  const handleMonthChange = (newMonth) => {
    const newMonthInt = parseInt(newMonth);
    if (hasDataForMonth(selectedYear, newMonthInt)) {
      setSelectedMonth(newMonthInt);
    }
  };

  const handlePreviousMonth = () => {
    if (isPreviousDisabled) return;

    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (isNextDisabled) return;

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Update URL when month/year changes
  useEffect(() => {
    navigate(`/history/${selectedYear}/${selectedMonth}`, { replace: true });
  }, [selectedYear, selectedMonth, navigate]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="select-none text-xl font-semibold text-gray-900">
            {formatMonth(selectedYear, selectedMonth)}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="space-y-6">
          <div className="text-center mt-8 space-y-2">
            <h2 className="text-gray-400 font-medium text-2xl ">Spent</h2>
            <h1
              className={`text-5xl font-medium  ${getOverBudgetTextDarkClass(
                spending,
                budget
              )}`}
            >
              {formatCurrency(spending)}
            </h1>
            <h2 className="text-gray-400 font-medium text-2xl">
              / {formatCurrency(budget)}
            </h2>
          </div>

          <div
            className={`mt-12 mb-4 font-medium flex items-center justify-between p-4 px-6 text-xl rounded-full cursor-pointer hover:opacity-80 transition-all ${getOverBudgetBackgroundClass(
              spending,
              budget
            )} `}
          >
            <p className="">{isOverBudget ? "Over budget by:" : "Leftover:"}</p>
            <p className={getOverBudgetTextClass(spending, budget)}>
              {" "}
              {formatCurrency(Math.abs(leftover))}
            </p>
          </div>

          {/* Transactions */}
          <div className="mb-6">
            <h3 className="text-2xl font-medium text-gray-900 text-center py-6">
              Transactions{" "}
              <span className="text-gray-400">
                ({monthTransactions.length})
              </span>
            </h3>

            {monthTransactions.length > 0 ? (
              <div className="space-y-3">
                {monthTransactions.map((transaction) => (
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
                <p className="text-gray-500">No transactions this month</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Month/Year Picker Footer */}
      <div
        className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4"
        style={{ bottom: "var(--bottom-nav-height, 66px)" }}
      >
        <div className="flex justify-between gap-2 w-full">
          <button
            onClick={handlePreviousMonth}
            disabled={isPreviousDisabled}
            className={`flex items-center justify-center p-2 rounded-full shadow-sm border border-gray-200 ${
              isPreviousDisabled
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <ChevronLeft
              size={20}
              className={isPreviousDisabled ? "text-gray-300" : "text-gray-600"}
            />
          </button>

          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-xl text-sm "
            >
              {Array.from({ length: 12 }, (_, i) => {
                const hasData = availableMonthsForSelectedYear.includes(i);
                const monthName = new Date(2024, i).toLocaleString("default", {
                  month: "short",
                });
                return (
                  <option key={i} value={i} disabled={!hasData}>
                    {monthName}
                  </option>
                );
              })}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-xl text-sm"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            className={`flex items-center justify-center p-2 rounded-full shadow-sm border border-gray-200 ${
              isNextDisabled
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <ChevronRight
              size={20}
              className={isNextDisabled ? "text-gray-300" : "text-gray-600"}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthBudgetHistory;
