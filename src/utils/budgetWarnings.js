/**
 * Budget Warning Utilities
 *
 * This module provides utilities for determining budget warning states
 * and their corresponding colors/styles based on configurable thresholds.
 */

/**
 * Budget warning states
 */
export const WARNING_STATES = {
  GREEN: "green", // Safe spending level
  YELLOW: "yellow", // Warning threshold reached
  RED: "red", // Critical threshold reached
};

/**
 * Get the current warning state based on budget left and warning settings
 * @param {number} budgetLeft - Amount of budget remaining
 * @param {number} totalBudget - Total budget amount
 * @param {Object} warningSettings - Warning configuration object
 * @param {string} warningSettings.yellowType - 'percentage' or 'amount'
 * @param {number} warningSettings.yellowValue - Threshold value for yellow warning
 * @param {string} warningSettings.redType - 'percentage' or 'amount'
 * @param {number} warningSettings.redValue - Threshold value for red warning
 * @returns {string} - One of WARNING_STATES values
 */
export const getBudgetWarningState = (
  budgetLeft,
  totalBudget,
  warningSettings
) => {
  // Handle edge cases
  if (budgetLeft <= 0) return WARNING_STATES.RED;
  if (totalBudget <= 0) return WARNING_STATES.GREEN;

  // Provide defaults and validate warning settings
  const safeWarningSettings = {
    yellowType: warningSettings?.yellowType || "percentage",
    yellowValue: isNaN(Number(warningSettings?.yellowValue))
      ? 40
      : Number(warningSettings.yellowValue),
    redType: warningSettings?.redType || "percentage",
    redValue: isNaN(Number(warningSettings?.redValue))
      ? 20
      : Number(warningSettings.redValue),
  };

  // Calculate thresholds
  const yellowThreshold =
    safeWarningSettings.yellowType === "percentage"
      ? (safeWarningSettings.yellowValue / 100) * totalBudget
      : safeWarningSettings.yellowValue;

  const redThreshold =
    safeWarningSettings.redType === "percentage"
      ? (safeWarningSettings.redValue / 100) * totalBudget
      : safeWarningSettings.redValue;

  // Determine warning state
  if (budgetLeft <= redThreshold) {
    return WARNING_STATES.RED;
  } else if (budgetLeft <= yellowThreshold) {
    return WARNING_STATES.YELLOW;
  } else {
    return WARNING_STATES.GREEN;
  }
};

/**
 * Get warning state for over-budget scenarios (when spending exceeds budget)
 * @param {number} spending - Amount spent
 * @param {number} totalBudget - Total budget amount
 * @returns {string} - Always returns RED for over-budget scenarios
 */
export const getOverBudgetWarningState = (spending, totalBudget) => {
  return spending > totalBudget
    ? WARNING_STATES.RED
    : getBudgetWarningStateFromSpending(spending, totalBudget);
};

/**
 * Get background class for over-budget styling only (red if over budget, gray if not)
 * @param {number} spending - Amount spent
 * @param {number} totalBudget - Total budget amount
 * @returns {string} - Returns red background if over budget, gray background otherwise
 */
export const getOverBudgetBackgroundClass = (spending, totalBudget) => {
  return spending > totalBudget ? "bg-red-100" : "bg-gray-100";
};

/**
 * Get text class for over-budget styling only (red if over budget, gray if not)
 * @param {number} spending - Amount spent
 * @param {number} totalBudget - Total budget amount
 * @returns {string} - Returns red text if over budget, gray text otherwise
 */
export const getOverBudgetTextClass = (spending, totalBudget) => {
  return spending > totalBudget ? "text-red-600" : "";
};

/**
 * Get dark text class for over-budget styling only (red if over budget, dark gray if not)
 * @param {number} spending - Amount spent
 * @param {number} totalBudget - Total budget amount
 * @returns {string} - Returns red text if over budget, dark gray text otherwise
 */
export const getOverBudgetTextDarkClass = (spending, totalBudget) => {
  return spending > totalBudget ? "text-red-600" : "text-gray-900";
};

/**
 * Get accent class for over-budget styling only (lighter red if over budget, gray if not)
 * @param {number} spending - Amount spent
 * @param {number} totalBudget - Total budget amount
 * @returns {string} - Returns lighter red accent if over budget, gray accent otherwise
 */
export const getOverBudgetAccentClass = (spending, totalBudget) => {
  return spending > totalBudget ? "text-red-300" : "text-gray-400";
};

/**
 * Helper function to get warning state from spending amount instead of budget left
 * @param {number} spending - Amount spent
 * @param {number} totalBudget - Total budget amount
 * @param {Object} warningSettings - Warning configuration object (optional, uses default if not provided)
 * @returns {string} - One of WARNING_STATES values
 */
export const getBudgetWarningStateFromSpending = (
  spending,
  totalBudget,
  warningSettings = {
    yellowType: "percentage",
    yellowValue: 60,
    redType: "percentage",
    redValue: 80,
  }
) => {
  const budgetLeft = totalBudget - spending;
  return getBudgetWarningState(budgetLeft, totalBudget, warningSettings);
};

/**
 * Get CSS background class based on warning state
 * @param {string} warningState - One of WARNING_STATES values
 * @returns {string} - Tailwind CSS class string
 */
export const getBudgetBackgroundClass = (warningState) => {
  switch (warningState) {
    case WARNING_STATES.RED:
      return "bg-red-100";
    case WARNING_STATES.YELLOW:
      return "bg-amber-100";
    case WARNING_STATES.GREEN:
    default:
      return "bg-lime-100";
  }
};

/**
 * Get CSS text color class based on warning state
 * @param {string} warningState - One of WARNING_STATES values
 * @returns {string} - Tailwind CSS class string
 */
export const getBudgetTextClass = (warningState) => {
  switch (warningState) {
    case WARNING_STATES.RED:
      return "text-red-600";
    case WARNING_STATES.YELLOW:
      return "text-amber-600";
    case WARNING_STATES.GREEN:
    default:
      return "text-lime-600";
  }
};

/**
 * Get CSS text color class for darker text based on warning state
 * @param {string} warningState - One of WARNING_STATES values
 * @returns {string} - Tailwind CSS class string
 */
export const getBudgetTextDarkClass = (warningState) => {
  switch (warningState) {
    case WARNING_STATES.RED:
      return "text-red-600";
    case WARNING_STATES.YELLOW:
      return "text-amber-600";
    case WARNING_STATES.GREEN:
    default:
      return "text-lime-600";
  }
};

/**
 * Get CSS text color class for extra dark text based on warning state
 * @param {string} warningState - One of WARNING_STATES values
 * @returns {string} - Tailwind CSS class string
 */
export const getBudgetTextExtraDarkClass = (warningState) => {
  switch (warningState) {
    case WARNING_STATES.RED:
      return "text-red-800";
    case WARNING_STATES.YELLOW:
      return "text-amber-700";
    case WARNING_STATES.GREEN:
    default:
      return "text-lime-800";
  }
};

/**
 * Get progress bar color class based on warning state
 * @param {string} warningState - One of WARNING_STATES values
 * @returns {string} - Tailwind CSS class string
 */
export const getBudgetProgressClass = (warningState) => {
  switch (warningState) {
    case WARNING_STATES.RED:
      return "bg-red-500";
    case WARNING_STATES.YELLOW:
      return "bg-amber-500";
    case WARNING_STATES.GREEN:
    default:
      return "bg-lime-500";
  }
};

/**
 * Get accent color (for secondary text/icons) based on warning state
 * @param {string} warningState - One of WARNING_STATES values
 * @returns {string} - Tailwind CSS class string
 */
export const getBudgetAccentClass = (warningState) => {
  switch (warningState) {
    case WARNING_STATES.RED:
      return "text-red-300";
    case WARNING_STATES.YELLOW:
      return "text-amber-400";
    case WARNING_STATES.GREEN:
    default:
      return "text-lime-500";
  }
};

/**
 * Get battery wave color hex value based on warning state
 * @param {string} warningState - One of WARNING_STATES values
 * @returns {string} - Hex color value
 */
export const getBatteryWaveColor = (warningState) => {
  switch (warningState) {
    case WARNING_STATES.RED:
      return "#b91c1c"; // red-700
    case WARNING_STATES.YELLOW:
      return "#fbbf24"; // amber-400
    case WARNING_STATES.GREEN:
    default:
      return "#16a34a"; // lime-600
  }
};

/**
 * Get a human-readable description of the warning thresholds
 * @param {Object} warningSettings - Warning configuration object
 * @returns {Object} - Object with yellow and red descriptions
 */
export const getWarningDescriptions = (warningSettings) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Provide default values and validate inputs
  const safeWarningSettings = {
    yellowType: warningSettings?.yellowType || "percentage",
    yellowValue: isNaN(Number(warningSettings?.yellowValue))
      ? 40
      : Number(warningSettings.yellowValue),
    redType: warningSettings?.redType || "percentage",
    redValue: isNaN(Number(warningSettings?.redValue))
      ? 20
      : Number(warningSettings.redValue),
  };

  const yellowDescription =
    safeWarningSettings.yellowType === "percentage"
      ? `${safeWarningSettings.yellowValue}% left`
      : `${formatCurrency(safeWarningSettings.yellowValue)} left`;

  const redDescription =
    safeWarningSettings.redType === "percentage"
      ? `${safeWarningSettings.redValue}% left`
      : `${formatCurrency(safeWarningSettings.redValue)} left`;

  return {
    yellow: `Yellow when ${yellowDescription}`,
    red: `Red when ${redDescription}`,
  };
};

/**
 * Validate warning settings to ensure red threshold is always lower than yellow
 * @param {Object} yellowSettings - Yellow warning settings
 * @param {Object} redSettings - Red warning settings
 * @param {number} totalBudget - Total budget amount for percentage calculations
 * @returns {Object} - Object with isValid boolean and error message if invalid
 */
export const validateWarningSettings = (
  yellowSettings,
  redSettings,
  totalBudget = 1000
) => {
  // Convert both to amounts for comparison
  const yellowAmount =
    yellowSettings.type === "percentage"
      ? (yellowSettings.value / 100) * totalBudget
      : yellowSettings.value;

  const redAmount =
    redSettings.type === "percentage"
      ? (redSettings.value / 100) * totalBudget
      : redSettings.value;

  if (redAmount >= yellowAmount) {
    return {
      isValid: false,
      error:
        "Red warning threshold must be lower than yellow warning threshold",
    };
  }

  return { isValid: true };
};
