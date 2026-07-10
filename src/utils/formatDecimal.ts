export const formatDecimal = (value: number, digits = 2): number => {
  if (typeof value !== 'number') return 0;
  return Number(value.toFixed(digits));
};