import {
  getOverBudgetBackgroundClass,
  getOverBudgetTextDarkClass,
  getOverBudgetTextClass,
} from "../utils/budgetWarnings";
import { formatCurrency } from "../utils/formatCurrency";

const TransactionCard = ({ transaction, onClick, isMonthCard = false }) => {
  const formatDate = (date) => {
    if (isMonthCard) {
      // For month cards, format as "Jan 2024"
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(date);
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const isOverBudget = isMonthCard && transaction.spent > transaction.budget;

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 px-6 text-lg rounded-full cursor-pointer hover:bg-gray-50 transition-colors ${
        isMonthCard
          ? getOverBudgetBackgroundClass(transaction.spent, transaction.budget)
          : "bg-gray-100"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {!isMonthCard && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: transaction.color || "#6b7280" }}
            />
          )}
          <div className="flex gap-2 items-baseline">
            <p
              className={`font-medium ${
                isMonthCard
                  ? getOverBudgetTextDarkClass(
                      transaction.spent,
                      transaction.budget
                    )
                  : "text-gray-900"
              }`}
            >
              {isMonthCard
                ? formatDate(transaction.date)
                : transaction.label || "Transaction"}
            </p>
            <p className="text-lg text-gray-400">
              {!isMonthCard &&
                formatDate(transaction.date?.toDate?.() || transaction.date)}
            </p>
          </div>
        </div>
      </div>
      {isMonthCard ? (
        <span
          className={`font-medium ${getOverBudgetTextClass(
            transaction.spent,
            transaction.budget
          )}`}
        >
          {`${formatCurrency(transaction.spent)} / ${formatCurrency(
            transaction.budget
          )}`}
        </span>
      ) : (
        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
