/**
 * Format a number as Indian currency (₹)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with ₹ symbol and thousands separators
 */
export const formatIndianCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};
