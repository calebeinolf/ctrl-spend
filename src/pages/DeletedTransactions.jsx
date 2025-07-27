import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import TransactionCard from "../components/TransactionCard";
import { formatCurrency } from "../utils/formatCurrency";

const DeletedTransactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deletedTransactions, setDeletedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, `users/${user.uid}/deletedTransactions`),
        orderBy("deletedAt", "desc")
      ),
      (snapshot) => {
        const deletedData = [];
        snapshot.forEach((doc) => {
          deletedData.push({ id: doc.id, ...doc.data() });
        });
        setDeletedTransactions(deletedData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to deleted transactions:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const handleRestore = async (deletedTransaction) => {
    if (!user) return;

    try {
      // Restore the transaction to the main transactions collection
      const { id, deletedAt, ...transactionData } = deletedTransaction;

      // Add back to transactions
      await setDoc(
        doc(db, `users/${user.uid}/transactions`, id),
        transactionData
      );

      // Remove from deleted transactions
      await deleteDoc(doc(db, `users/${user.uid}/deletedTransactions`, id));
    } catch (error) {
      console.error("Error restoring transaction:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 md-spinner"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="select-none text-xl font-semibold text-gray-900">
            Deleted Transactions
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pt-20">
        <div className="max-w-md mx-auto">
          {deletedTransactions.length > 0 ? (
            <div className="space-y-3">
              {deletedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.label || "Transaction"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Deleted {formatDate(transaction.deletedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestore(transaction)}
                        className="p-2 text-lime-600 hover:bg-lime-50 rounded-lg transition-colors"
                        title="Restore transaction"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
              <p className="text-gray-500 mb-2">No deleted transactions</p>
              <p className="text-sm text-gray-400">
                Transactions you delete will appear here
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DeletedTransactions;
