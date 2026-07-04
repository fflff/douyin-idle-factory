/** Formats large numbers for mobile UI (e.g. 1.2K, 3.4M). */
export function formatCoins(value: number): string {
  if (value < 1000) return Math.floor(value).toString();
  if (value < 1_000_000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return `${(value / 1_000_000_000).toFixed(1)}B`;
}
