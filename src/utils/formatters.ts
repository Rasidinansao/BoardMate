/**
 * Utility functions for currency math (integer centavos), dates, and formatting.
 * Integer centavos are used everywhere to eliminate IEEE 754 floating point rounding errors.
 */

export function formatPHP(centavos: number): string {
  const isNegative = centavos < 0;
  const absCentavos = Math.abs(centavos);
  const pesos = Math.floor(absCentavos / 100);
  const cents = absCentavos % 100;
  
  const formattedPesos = pesos.toLocaleString('en-PH');
  const formattedCents = cents.toString().padStart(2, '0');
  
  return `${isNegative ? '-' : ''}₱${formattedPesos}.${formattedCents}`;
}

export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * 100);
}

export function centavosToPesos(centavos: number): number {
  return centavos / 100;
}

/**
 * Divides a total room rent integer centavos equally among bed slots.
 * Extra remainder cents are distributed to the first beds so the sum matches 100% exactly.
 */
export function divideRentEqually(totalCentavos: number, bedCount: number): number[] {
  if (bedCount <= 0) return [];
  const baseShare = Math.floor(totalCentavos / bedCount);
  const remainder = totalCentavos % bedCount;
  
  return Array.from({ length: bedCount }, (_, index) => {
    return index < remainder ? baseShare + 1 : baseShare;
  });
}

/**
 * Daily rate for 30-day security deposit drawdown.
 */
export function calculateDailyDepositRate(monthlyRentCentavos: number): number {
  return Math.round(monthlyRentCentavos / 30);
}

export function calculateDepositRemaining(
  initialDepositCentavos: number,
  overdueDays: number,
  dailyRateCentavos: number
): { remainingCentavos: number; deductedCentavos: number; remainingDays: number } {
  const deductedCentavos = Math.min(initialDepositCentavos, overdueDays * dailyRateCentavos);
  const remainingCentavos = Math.max(0, initialDepositCentavos - deductedCentavos);
  const remainingDays = Math.max(0, 30 - overdueDays);

  return {
    remainingCentavos,
    deductedCentavos,
    remainingDays,
  };
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return dateString;
  }
}
