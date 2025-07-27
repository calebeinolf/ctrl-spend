import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppData } from "../contexts/AppDataContext";
import TransactionCard from "../components/TransactionCard";

const AllTransactions = () => {
  const navigate = useNavigate();
  const { transactions, settings } = useAppData();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedTransactions, setSortedTransactions] = useState([]);

  const transactionsPerPage = 20;

  useEffect(() => {
    // Sort all transactions by date (most recent first)
    const sorted = [...transactions].sort((a, b) => {
      const dateA = a.date?.toDate() || new Date(0);
      const dateB = b.date?.toDate() || new Date(0);
      return dateB - dateA;
    });
    setSortedTransactions(sorted);
    setCurrentPage(1); // Reset to first page when transactions change
  }, [transactions]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleTransactionClick = (transaction) => {
    navigate(`/transaction/${transaction.id}`);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="select-none text-xl font-semibold text-gray-900">
            All Transactions
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pt-20">
        {/* Transaction count and page info */}
        <div className="p-4 text-center font-medium flex justify-between items-center">
          <p className="text-gray-600">
            {sortedTransactions.length} total transactions
          </p>
          {totalPages > 1 && (
            <p className="text-gray-500 mt-1">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        <div className="max-w-md mx-auto">
          {currentTransactions.length > 0 ? (
            <>
              <div className="space-y-3 mb-6">
                {currentTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={{
                      ...transaction,
                      date: transaction.date?.toDate() || new Date(),
                      color: settings?.transactionTypes?.types?.find(
                        (type) => type.id === transaction.categoryId
                      )?.color,
                    }}
                    onClick={() => handleTransactionClick(transaction)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-4 py-6">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center space-x-2 h-15 w-15 rounded-full border transition-colors ${
                      currentPage === 1
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-15 w-15 rounded-full text-lg font-medium transition-colors ${
                            pageNum === currentPage
                              ? "bg-lime-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center space-x-2 h-15 w-15 rounded-full border transition-colors ${
                      currentPage === totalPages
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
              <p className="text-gray-500 mb-4">No transactions found</p>
              <p className="text-sm text-gray-400">
                Start adding transactions to see them here
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllTransactions;
