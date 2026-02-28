import { Currency } from "../types";

export const formatCurrency = (amount: number, currency: Currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
    // The date string is in "YYYY-MM-DD" format. Parsing it directly with `new Date()` can lead
    // to timezone issues as it's treated as UTC midnight. To format it correctly as the intended
    // date regardless of the user's timezone, we specify the UTC timezone in the formatter.
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC', // Treat the input date as UTC to prevent timezone shifts
    });
}