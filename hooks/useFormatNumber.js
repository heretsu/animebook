export const useFormatNumber = () => {
  const formatThisNumber = (value) => {
    // Convert to number if needed
    const num = typeof value === "bigint" ? Number(value) : Number(value);

    // Handle invalid numbers
    if (isNaN(num) || !isFinite(num)) return "0";

    // Handle zero
    if (num === 0) return "0";

    // Handle negative numbers
    const isNegative = num < 0;
    const absNum = Math.abs(num);

    let result;

    if (absNum >= 1_000_000_000) {
      // Billions
      result = (absNum / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "B";
    } else if (absNum >= 1_000_000) {
      // Millions
      result = (absNum / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
    } else if (absNum >= 1_000) {
      // Thousands
      result = (absNum / 1_000).toFixed(2).replace(/\.?0+$/, "") + "K";
    } else if (absNum >= 1) {
      // Regular numbers >= 1
      result = absNum.toFixed(2).replace(/\.?0+$/, "");
    } else {
      // Numbers < 1 (decimals)
      result = absNum.toFixed(2).replace(/\.?0+$/, "");
    }

    return isNegative ? `-${result}` : result;
  };
  return {formatThisNumber}
};

export default useFormatNumber;
