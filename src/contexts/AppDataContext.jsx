import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { getBudgetWarningState, WARNING_STATES } from "../utils/budgetWarnings";

const AppDataContext = createContext();

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};

export const AppDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState({
    budget: { amount: 500, frequency: "monthly" },
    warning: {
      yellowType: "percentage",
      yellowValue: 40,
      redType: "percentage",
      redValue: 20,
    },
    transactionTypes: {
      types: [],
    },
  });

  // Default Transaction Labels to be added to Firestore
  const defaultTransactionTypes = [
    { id: "food", name: "Food", color: "#ef4444" },
    { id: "transport", name: "Transport", color: "#3b82f6" },
    { id: "shopping", name: "Shopping", color: "#8b5cf6" },
    { id: "entertainment", name: "Entertainment", color: "#f59e0b" },
    { id: "bills", name: "Bills", color: "#10b981" },
  ];
  const [loading, setLoading] = useState(true);

  // Initialize user settings
  const initializeUserSettings = async (userId) => {
    try {
      const budgetDoc = await getDoc(
        doc(db, `users/${userId}/settings`, "budget")
      );
      const warningDoc = await getDoc(
        doc(db, `users/${userId}/settings`, "warning")
      );
      const typesDoc = await getDoc(
        doc(db, `users/${userId}/settings`, "transactionTypes")
      );

      if (!budgetDoc.exists()) {
        await setDoc(
          doc(db, `users/${userId}/settings`, "budget"),
          settings.budget
        );
      }

      if (!warningDoc.exists()) {
        await setDoc(
          doc(db, `users/${userId}/settings`, "warning"),
          settings.warning
        );
      }

      if (!typesDoc.exists()) {
        await setDoc(doc(db, `users/${userId}/settings`, "transactionTypes"), {
          types: defaultTransactionTypes,
        });
      }
    } catch (error) {
      console.error("Error initializing user settings:", error);
    }
  };

  // Load settings
  const loadSettings = async (userId) => {
    try {
      const budgetDoc = await getDoc(
        doc(db, `users/${userId}/settings`, "budget")
      );
      const warningDoc = await getDoc(
        doc(db, `users/${userId}/settings`, "warning")
      );
      const typesDoc = await getDoc(
        doc(db, `users/${userId}/settings`, "transactionTypes")
      );

      const newSettings = { ...settings };

      if (budgetDoc.exists()) {
        newSettings.budget = budgetDoc.data();
      }

      if (warningDoc.exists()) {
        newSettings.warning = warningDoc.data();
      }

      if (typesDoc.exists()) {
        newSettings.transactionTypes = typesDoc.data();
      }

      setSettings(newSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  // Update budget settings
  const updateBudgetSettings = async (budgetData) => {
    if (!user) return;

    try {
      await setDoc(doc(db, `users/${user.uid}/settings`, "budget"), budgetData);
      setSettings((prev) => ({ ...prev, budget: budgetData }));
    } catch (error) {
      console.error("Error updating budget settings:", error);
      throw error;
    }
  };

  // Update warning settings
  const updateWarningSettings = async (warningData) => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, `users/${user.uid}/settings`, "warning"),
        warningData
      );
      setSettings((prev) => ({ ...prev, warning: warningData }));
    } catch (error) {
      console.error("Error updating warning settings:", error);
      throw error;
    }
  };

  // Update Transaction Labels
  const updateTransactionTypes = async (typesData) => {
    if (!user) return;

    try {
      await setDoc(doc(db, `users/${user.uid}/settings`, "transactionTypes"), {
        types: typesData,
      });
      setSettings((prev) => ({
        ...prev,
        transactionTypes: { types: typesData },
      }));
    } catch (error) {
      console.error("Error updating Transaction Labels:", error);
      throw error;
    }
  };

  // Add transaction
  const addTransaction = async (transactionData) => {
    if (!user) return;

    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        {
          ...transactionData,
          date: serverTimestamp(),
          budgetForMonth: settings.budget.amount,
        }
      );
      return docRef.id;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  };

  // Update transaction
  const updateTransaction = async (transactionId, transactionData) => {
    if (!user) return;

    try {
      await updateDoc(
        doc(db, `users/${user.uid}/transactions`, transactionId),
        transactionData
      );
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  };

  // Delete transaction (move to deleted transactions)
  const deleteTransaction = async (transactionId) => {
    if (!user) return;

    try {
      // Get the transaction first
      const transactionDoc = await getDoc(
        doc(db, `users/${user.uid}/transactions`, transactionId)
      );
      if (!transactionDoc.exists()) return;

      const transactionData = transactionDoc.data();

      // Add to deleted transactions with timestamp
      await setDoc(
        doc(db, `users/${user.uid}/deletedTransactions`, transactionId),
        {
          ...transactionData,
          deletedAt: serverTimestamp(),
        }
      );

      // Remove from main transactions
      await deleteDoc(doc(db, `users/${user.uid}/transactions`, transactionId));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  };

  // Check if budget warning should be shown (legacy function for compatibility)
  const shouldShowWarning = () => {
    const warningState = getCurrentBudgetWarningState();
    return warningState === WARNING_STATES.RED;
  };

  // Get the current budget warning state
  const getCurrentBudgetWarningState = () => {
    const spending = getCurrentMonthSpending();
    const budgetLeft = settings.budget.amount - spending;

    return getBudgetWarningState(
      budgetLeft,
      settings.budget.amount,
      settings.warning
    );
  };

  // Get current month's spending
  const getCurrentMonthSpending = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter((transaction) => {
        const transactionDate = transaction.date?.toDate();
        return (
          transactionDate &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  // Get spending for a specific month
  const getMonthSpending = (year, month) => {
    return transactions
      .filter((transaction) => {
        const transactionDate = transaction.date?.toDate();
        return (
          transactionDate &&
          transactionDate.getMonth() === month &&
          transactionDate.getFullYear() === year
        );
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  // Effect to handle user changes
  useEffect(() => {
    if (user) {
      initializeUserSettings(user.uid);

      // Listen to transactions
      const transactionsUnsubscribe = onSnapshot(
        query(
          collection(db, `users/${user.uid}/transactions`),
          orderBy("date", "desc")
        ),
        (snapshot) => {
          const transactionData = [];
          snapshot.forEach((doc) => {
            transactionData.push({ id: doc.id, ...doc.data() });
          });
          setTransactions(transactionData);
        },
        (error) => {
          console.error("Error listening to transactions:", error);
        }
      );

      // Listen to settings changes
      const budgetUnsubscribe = onSnapshot(
        doc(db, `users/${user.uid}/settings`, "budget"),
        (doc) => {
          if (doc.exists()) {
            setSettings((prev) => ({ ...prev, budget: doc.data() }));
          }
          // Set loading to false after first budget load
          setLoading(false);
        },
        (error) => {
          console.error("Error listening to budget settings:", error);
          setLoading(false);
        }
      );

      const warningUnsubscribe = onSnapshot(
        doc(db, `users/${user.uid}/settings`, "warning"),
        (doc) => {
          if (doc.exists()) {
            setSettings((prev) => ({ ...prev, warning: doc.data() }));
          }
        },
        (error) => {
          console.error("Error listening to warning settings:", error);
        }
      );

      const typesUnsubscribe = onSnapshot(
        doc(db, `users/${user.uid}/settings`, "transactionTypes"),
        (doc) => {
          if (doc.exists()) {
            setSettings((prev) => ({ ...prev, transactionTypes: doc.data() }));
          }
        },
        (error) => {
          console.error("Error listening to Transaction Labels:", error);
        }
      );

      return () => {
        transactionsUnsubscribe();
        budgetUnsubscribe();
        warningUnsubscribe();
        typesUnsubscribe();
      };
    } else {
      setTransactions([]);
      setSettings({
        budget: { amount: 500, frequency: "monthly" },
        warning: { type: "percentage", value: 20 },
        transactionTypes: { types: [] },
      });
      setLoading(false);
    }
  }, [user]);

  const value = {
    transactions,
    settings,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudgetSettings,
    updateWarningSettings,
    updateTransactionTypes,
    getCurrentMonthSpending,
    getMonthSpending,
    shouldShowWarning,
    getCurrentBudgetWarningState,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
};
