/**
 * Format currency with automatic .00 removal for cleaner display
 * @param {number} value - The monetary value to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value) => {
  // Fix for negative zero display issue
  const adjustedValue = Math.abs(value) < 0.01 ? 0 : value;

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(adjustedValue);

  // Remove .00 for whole dollar amounts to improve readability
  return formatted.replace(/\.00$/, "");
};
