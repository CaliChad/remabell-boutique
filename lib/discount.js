// Discount campaign configuration and utilities
// Flip DISCOUNT_ACTIVE to false to disable the campaign instantly

export const DISCOUNT_ACTIVE = true;
export const DISCOUNT_AMOUNT = 500; // ₦500 off per item
export const DISCOUNT_END_DATE = '2026-03-15T23:59:59+01:00'; // 3 weeks from launch (WAT)
export const DISCOUNT_LABEL = 'Limited-Time Sale';

/**
 * Check if the discount campaign is currently active
 * @returns {boolean}
 */
export function isDiscountActive() {
    if (!DISCOUNT_ACTIVE) return false;
    return new Date() < new Date(DISCOUNT_END_DATE);
}

/**
 * Parse a price string like "₦12,500" to a number (12500)
 * @param {string} priceString
 * @returns {number}
 */
function parsePriceToNumber(priceString) {
    if (typeof priceString === 'number') return priceString;
    return parseInt(priceString.replace(/[₦,\s]/g, ''), 10) || 0;
}

/**
 * Get the discounted price as a formatted string (e.g. "₦12,000")
 * @param {string} priceString - Original price like "₦12,500"
 * @returns {string} Discounted price string
 */
export function getDiscountedPrice(priceString) {
    const original = parsePriceToNumber(priceString);
    const discounted = Math.max(0, original - DISCOUNT_AMOUNT);
    return `₦${discounted.toLocaleString('en-NG')}`;
}

/**
 * Get the discounted price as a number (in Naira)
 * @param {string} priceString - Original price like "₦12,500"
 * @returns {number} Discounted price in Naira
 */
export function getDiscountedPriceNumber(priceString) {
    const original = parsePriceToNumber(priceString);
    return Math.max(0, original - DISCOUNT_AMOUNT);
}

/**
 * Get time remaining until the discount ends
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, expired: boolean }}
 */
export function getTimeRemaining() {
    const now = new Date();
    const end = new Date(DISCOUNT_END_DATE);
    const diff = end - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false
    };
}
