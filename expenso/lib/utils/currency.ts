/**
 * Currency & Monetary Precision Utilities
 *
 * In Expenso, all financial amounts in the database, server actions,
 * and calculations are stored and processed strictly as integer paise
 * (where 100 paise = ₹1.00).
 *
 * This prevents floating-point rounding errors and ensures total financial consistency.
 */

/**
 * Converts a rupee float (e.g., 149.50) into integer paise (14950).
 */
export function toPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) {
    throw new TypeError("Invalid number provided for rupee conversion");
  }
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise (e.g. 14950) into decimal rupees (149.50).
 */
export function toRupees(paise: number): number {
  if (!Number.isInteger(paise)) {
    // Round to nearest integer if fractional paise passed inadvertently
    paise = Math.round(paise);
  }
  return paise / 100;
}

export interface FormatINROptions {
  showSign?: boolean;
  showDecimals?: boolean;
  compact?: boolean;
}

/**
 * Formats integer paise into standard Indian Rupee representation (INR ₹),
 * honoring Indian numbering formatting (lakhs, crores).
 *
 * Example: 12345678 paise -> ₹1,23,456.78
 */
export function formatINR(paise: number, options: FormatINROptions = {}): string {
  const { showSign = false, showDecimals = true, compact = false } = options;
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = absPaise / 100;

  let formatted: string;

  if (compact && absPaise >= 10_000_000) {
    // 1 Crore = 10,000,000 paise = 1,00,000 rupees
    // 1 Lakh = 100,000 paise = 1,000 rupees
    if (rupees >= 10_000_000) {
      formatted = `₹${(rupees / 10_000_000).toFixed(2)} Cr`;
    } else if (rupees >= 100_000) {
      formatted = `₹${(rupees / 100_000).toFixed(2)} L`;
    } else if (rupees >= 1_000) {
      formatted = `₹${(rupees / 1_000).toFixed(1)} K`;
    } else {
      formatted = `₹${rupees.toFixed(showDecimals ? 2 : 0)}`;
    }
  } else {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    formatted = formatter.format(rupees);
  }

  if (isNegative) {
    return showSign ? `-${formatted}` : `-${formatted}`;
  } else if (showSign && paise > 0) {
    return `+${formatted}`;
  }

  return formatted;
}
