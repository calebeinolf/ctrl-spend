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
  const { user, initializing } = useAuth();
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
  const [loading, setLoading] = useState(false); // Start as not loading for better UX
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Optimized settings initialization - batch read and minimal writes
  const initializeUserSettings = async (userId) => {
    try {
      // Batch read all settings at once
      const [budgetDoc, warningDoc, typesDoc] = await Promise.all([
        getDoc(doc(db, `users/${userId}/settings`, "budget")),
        getDoc(doc(db, `users/${userId}/settings`, "warning")),
        getDoc(doc(db, `users/${userId}/settings`, "transactionTypes")),
      ]);

      const writes = [];
      const newSettings = { ...settings };

      // Only write missing documents
      if (!budgetDoc.exists()) {
        writes.push(
          setDoc(doc(db, `users/${userId}/settings`, "budget"), settings.budget)
        );
      } else {
        newSettings.budget = budgetDoc.data();
      }

      if (!warningDoc.exists()) {
        writes.push(
          setDoc(
            doc(db, `users/${userId}/settings`, "warning"),
            settings.warning
          )
        );
      } else {
        const warningData = warningDoc.data();
        newSettings.warning = {
          yellowType: warningData.yellowType || "percentage",
          yellowValue: isNaN(Number(warningData.yellowValue))
            ? 40
            : Number(warningData.yellowValue),
          redType: warningData.redType || "percentage",
          redValue: isNaN(Number(warningData.redValue))
            ? 20
            : Number(warningData.redValue),
        };
      }

      if (!typesDoc.exists()) {
        writes.push(
          setDoc(doc(db, `users/${userId}/settings`, "transactionTypes"), {
            types: defaultTransactionTypes,
          })
        );
        newSettings.transactionTypes = { types: defaultTransactionTypes };
      } else {
        newSettings.transactionTypes = typesDoc.data();
      }

      // Update settings immediately with available data
      setSettings(newSettings);
      setSettingsLoaded(true);

      // Execute any needed writes in parallel
      if (writes.length > 0) {
        await Promise.all(writes);
      }
    } catch (error) {
      console.error("Error initializing user settings:", error);
      setSettingsLoaded(true); // Still mark as loaded to prevent blocking
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

    // Create optimistic transaction object
    const optimisticTransaction = {
      id: `optimistic-${Date.now()}`,
      ...transactionData,
      date: { toDate: () => new Date() }, // Mimic Firestore Timestamp for compatibility
      budgetForMonth: settings.budget.amount,
    };

    // Add optimistic transaction to UI immediately
    setTransactions((prev) => [optimisticTransaction, ...prev]);

    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        {
          ...transactionData,
          date: serverTimestamp(),
          budgetForMonth: settings.budget.amount,
        }
      );

      // Remove optimistic transaction once real one is added
      // The real-time listener will handle adding the actual transaction
      setTransactions((prev) =>
        prev.filter((t) => t.id !== optimisticTransaction.id)
      );

      return docRef.id;
    } catch (error) {
      // Remove optimistic transaction on error
      setTransactions((prev) =>
        prev.filter((t) => t.id !== optimisticTransaction.id)
      );
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

  // Get budget for a specific month (from transactions made in that month)
  const getMonthBudget = (year, month) => {
    const monthTransactions = transactions.filter((transaction) => {
      const transactionDate = transaction.date?.toDate();
      return (
        transactionDate &&
        transactionDate.getMonth() === month &&
        transactionDate.getFullYear() === year
      );
    });

    // Return the budget from the first transaction of that month, or current budget if no transactions
    return monthTransactions.length > 0
      ? monthTransactions[0].budgetForMonth || settings.budget.amount
      : settings.budget.amount;
  };

  // Effect to handle user changes - optimized Firebase listeners
  useEffect(() => {
    if (user && !initializing) {
      // Initialize settings asynchronously in background - non-blocking
      initializeUserSettings(user.uid);

      // App is immediately usable with default settings
      // No loading state blocking the UI

      // Listen to transactions - most critical data
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

          // Merge with optimistic transactions, removing any that might be duplicates
          setTransactions((prev) => {
            const optimisticTransactions = prev.filter((t) =>
              t.id.startsWith("optimistic-")
            );
            const realTransactions = transactionData;

            // Combine optimistic and real transactions, ensuring no duplicates
            return [...optimisticTransactions, ...realTransactions];
          });
        },
        (error) => {
          console.error("Error listening to transactions:", error);
        }
      );

      // Settings listeners - lower priority, non-blocking
      const budgetUnsubscribe = onSnapshot(
        doc(db, `users/${user.uid}/settings`, "budget"),
        (doc) => {
          if (doc.exists()) {
            setSettings((prev) => ({ ...prev, budget: doc.data() }));
          }
        },
        (error) => {
          console.error("Error listening to budget settings:", error);
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
    } else if (!user && !initializing) {
      setTransactions([]);
      setSettings({
        budget: { amount: 500, frequency: "monthly" },
        warning: {
          yellowType: "percentage",
          yellowValue: 40,
          redType: "percentage",
          redValue: 20,
        },
        transactionTypes: { types: [] },
      });
      // Remove loading state entirely for logged out users
    }
  }, [user, initializing]);

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
    getMonthBudget,
    shouldShowWarning,
    getCurrentBudgetWarningState,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
};
