/** Indian-format rupee amount, e.g. 18400 → "₹18,400". */
export const formatPrice = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
