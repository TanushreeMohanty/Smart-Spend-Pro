export const formatIndianCompact = (num) => {
  const val = parseFloat(num) || 0;
  if (Math.abs(val) >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return "Unknown";
  if (dateInput.seconds) return new Date(dateInput.seconds * 1000).toLocaleDateString();
  if (dateInput instanceof Date) return dateInput.toLocaleDateString();
  return new Date(dateInput).toLocaleDateString();
};