import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Calendar, Clock } from "lucide-react";
import { useAppData } from "../contexts/AppDataContext";
import { formatCurrency } from "../utils/formatCurrency";
import TransactionTypeModal from "../components/TransactionTypeModal";
import AddTransactionLabelModal from "../components/AddTransactionLabelModal";

const TransactionDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    transactions,
    updateTransaction,
    deleteTransaction,
    settings,
    updateTransactionTypes,
  } = useAppData();
  const [transaction, setTransaction] = useState(null);
  const [editingAmount, setEditingAmount] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showAddLabelModal, setShowAddLabelModal] = useState(false);

  useEffect(() => {
    const foundTransaction = transactions.find((t) => t.id === id);
    if (foundTransaction) {
      setTransaction(foundTransaction);
      setAmount(foundTransaction.amount.toString());
      const transactionDate = foundTransaction.date?.toDate() || new Date();
      setDate(transactionDate.toISOString().split("T")[0]);
      setTime(transactionDate.toTimeString().slice(0, 5));
    }
  }, [transactions, id]);

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSaveAmount = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      // If invalid, reset to original value
      setAmount(transaction.amount.toString());
      setEditingAmount(false);
      return;
    }

    setSaving(true);
    try {
      await updateTransaction(id, { amount: parseFloat(amount) });
      setEditingAmount(false);
    } catch (error) {
      console.error("Error updating amount:", error);
      // Reset to original value on error
      setAmount(transaction.amount.toString());
      setEditingAmount(false);
    }
    setSaving(false);
  };

  const handleSaveLabel = async () => {
    if (!label.trim()) return;

    setSaving(true);
    try {
      await updateTransaction(id, { label: label.trim() });
      setEditingLabel(false);
    } catch (error) {
      console.error("Error updating label:", error);
    }
    setSaving(false);
  };

  const handleTypeSelect = async (selectedType) => {
    setSaving(true);
    try {
      await updateTransaction(id, {
        label: selectedType.name,
        categoryId: selectedType.id,
      });
      setShowTypeModal(false);
    } catch (error) {
      console.error("Error updating transaction type:", error);
    }
    setSaving(false);
  };

  const handleAddTransactionLabel = async (name, color) => {
    const types = settings?.transactionTypes?.types || [];
    const newType = {
      id: Date.now().toString(),
      name: name.trim(),
      color: color,
    };

    const updatedTypes = [...types, newType];

    setSaving(true);
    try {
      await updateTransactionTypes(updatedTypes);
      setShowAddLabelModal(false);
    } catch (error) {
      console.error("Error adding Transaction Label:", error);
    }
    setSaving(false);
  };

  const handleSaveDate = async () => {
    if (!date) return;

    setSaving(true);
    try {
      const currentDate = transaction.date?.toDate() || new Date();
      const newDate = new Date(date);
      newDate.setHours(currentDate.getHours(), currentDate.getMinutes());

      await updateTransaction(id, { date: newDate });
      setEditingDate(false);
    } catch (error) {
      console.error("Error updating date:", error);
    }
    setSaving(false);
  };

  const handleSaveTime = async () => {
    if (!time) return;

    setSaving(true);
    try {
      const currentDate = transaction.date?.toDate() || new Date();
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(currentDate);
      newDate.setHours(hours, minutes);

      await updateTransaction(id, { date: newDate });
      setEditingTime(false);
    } catch (error) {
      console.error("Error updating time:", error);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteTransaction(id);
      navigate("/current-budget");
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
    setSaving(false);
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Transaction not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-lime-600 underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const transactionDate = transaction.date?.toDate() || new Date();
  const category = settings?.transactionTypes?.types?.find(
    (type) => type.id === transaction.categoryId
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="select-none text-xl font-semibold text-gray-900">
            Transaction
          </h1>
        </div>
      </header>
      {/* Main Content */}
      <main className="px-4 py-6 pt-[35vh] flex flex-col">
        <div className="flex-1 flex flex-col justify-center space-y-8">
          {/* Amount Section */}
          {editingAmount ? (
            <div className="flex items-center justify-center">
              <span className="text-gray-500 text-5xl">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers with up to 2 decimal places
                  if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                    setAmount(value);
                  }
                }}
                onBlur={handleSaveAmount}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                  if (e.key === "Escape") {
                    setAmount(transaction.amount.toString());
                    setEditingAmount(false);
                  }
                }}
                className="!text-5xl font-medium text-gray-900 bg-transparent border-none outline-none text-center w-auto min-w-0"
                style={{ width: `${Math.max(amount.length, 2)}ch` }}
                placeholder="0"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setEditingAmount(true)}
              className="text-5xl font-medium text-gray-900 hover:text-lime-600 transition-colors text-center"
              style={{
                height: "1.2em",
                lineHeight: "1.2em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {formatCurrency(transaction.amount)}
            </button>
          )}

          {/* Label/Category */}
          <div className="space-y-2 text-center">
            <button
              onClick={() => setShowTypeModal(true)}
              className={`inline-flex items-center px-6 py-3 font-medium rounded-full text-lg transition-colors ${
                category
                  ? "text-white hover:opacity-90"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
              style={category ? { backgroundColor: category.color } : {}}
            >
              {transaction.label}
            </button>
          </div>

          {/* Date and Time */}
          <div className="flex justify-center gap-8">
            {editingDate ? (
              <div className="space-y-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDate(transactionDate.toISOString().split("T")[0]);
                      setEditingDate(false);
                    }}
                    className="flex-1 px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDate}
                    disabled={saving || !date}
                    className="flex-1 px-3 py-1 text-sm bg-lime-600 text-white rounded-lg disabled:bg-gray-300"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingDate(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                {transactionDate.toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                })}
              </button>
            )}

            {editingTime ? (
              <div className="space-y-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTime(transactionDate.toTimeString().slice(0, 5));
                      setEditingTime(false);
                    }}
                    className="flex-1 px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTime}
                    disabled={saving || !time}
                    className="flex-1 px-3 py-1 text-sm bg-lime-600 text-white rounded-lg disabled:bg-gray-300"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingTime(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                {transactionDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </button>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <div className="fixed bottom-23 left-0 right-0 p-4 px-6 z-40">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-6 py-4 bg-red-100 text-red-600 text-lg font-medium rounded-full hover:bg-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Delete Transaction
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium disabled:bg-gray-300"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Type Selection Modal */}
      <TransactionTypeModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelect={handleTypeSelect}
        onAddNew={() => setShowAddLabelModal(true)}
        transactionTypes={settings?.transactionTypes?.types || []}
        currentCategoryId={transaction?.categoryId}
        saving={saving}
      />

      {/* Add Transaction Label Modal */}
      <AddTransactionLabelModal
        isOpen={showAddLabelModal}
        onClose={() => setShowAddLabelModal(false)}
        onAdd={handleAddTransactionLabel}
        saving={saving}
      />
    </div>
  );
};

export default TransactionDetails;
