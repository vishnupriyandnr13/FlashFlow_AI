import { SaleStatus } from '../types';

/**
 * Consistent definition of sale status throughout the application:
 * - Upcoming: current time is before the start time.
 * - Live: current time is at or after the start time and before the end time.
 * - Ended: current time is at or after the end time.
 * - Sold Out: inventory is unavailable (availableStock <= 0); preserved as a separate inventory condition.
 */
export function getProductSaleStatus(product: { saleStartsAt: string; saleEndsAt: string }): SaleStatus {
  const now = Date.now();
  const start = new Date(product.saleStartsAt).getTime();
  const end = new Date(product.saleEndsAt).getTime();

  if (now < start) {
    return 'upcoming';
  }
  if (now >= start && now < end) {
    return 'live';
  }
  return 'ended';
}

/**
 * Inventory availability check:
 * Preserved as a separate inventory condition rather than a time-based status.
 */
export function isProductSoldOut(product: { availableStock: number }): boolean {
  return product.availableStock <= 0;
}

/**
 * Format timestamps consistently in the user's local time zone.
 * Example output: "28 Oct 2026, 12:00 PM"
 */
export function formatLocalDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
