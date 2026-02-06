// Paystack payment utilities for Remabell Exquisite
// Currency: Nigerian Naira (NGN)

/**
 * Generate a unique transaction reference
 * @returns {string} Unique reference string
 */
export function generateReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `REMABELL-${timestamp}-${random}`.toUpperCase();
}

/**
 * Parse price string to number (kobo for Paystack)
 * Paystack requires amounts in kobo (smallest currency unit)
 * @param {string} priceString - Price in format "₦21,000" or "21000"
 * @returns {number} Amount in kobo
 */
export function parsePrice(priceString) {
    if (typeof priceString === 'number') return priceString * 100;
    const numericValue = parseInt(priceString.replace(/[₦,\s]/g, ''), 10);
    return numericValue * 100; // Convert to kobo
}

/**
 * Format amount from kobo to NGN display string
 * @param {number} amountInKobo - Amount in kobo
 * @returns {string} Formatted price string
 */
export function formatAmount(amountInKobo) {
    const nairaAmount = amountInKobo / 100;
    return `₦${nairaAmount.toLocaleString('en-NG')}`;
}

/**
 * Get Paystack public key from environment
 * @returns {string} Public key
 */
export function getPublicKey() {
    return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
}

/**
 * Calculate cart total in kobo
 * @param {Array} cart - Cart items array
 * @returns {number} Total amount in kobo
 */
export function calculateCartTotalKobo(cart) {
    if (!cart || cart.length === 0) return 0;

    return cart.reduce((total, item) => {
        const priceInKobo = parsePrice(item.price);
        return total + (priceInKobo * item.quantity);
    }, 0);
}

/**
 * Calculate cart total in Naira (number)
 * @param {Array} cart - Cart items array
 * @returns {number} Total amount in Naira
 */
export function calculateCartTotal(cart) {
    return calculateCartTotalKobo(cart) / 100;
}

/**
 * Configuration for Paystack Popup
 * @param {Object} params - Payment parameters
 * @returns {Object} Paystack config object
 */
export function createPaystackConfig({
    email,
    amount, // in kobo
    reference,
    metadata = {},
    onSuccess,
    onClose
}) {
    return {
        key: getPublicKey(),
        email,
        amount,
        currency: 'NGN',
        ref: reference,
        label: 'Remabell Exquisite',
        channels: ['card', 'bank', 'ussd', 'bank_transfer'],
        metadata: {
            custom_fields: [
                {
                    display_name: "Store",
                    variable_name: "store",
                    value: "Remabell Exquisite"
                },
                ...Object.entries(metadata).map(([key, value]) => ({
                    display_name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    variable_name: key,
                    value: String(value)
                }))
            ]
        },
        onSuccess,
        onClose
    };
}

/**
 * Check if cart contains virtual/consultation products
 * @param {Array} cart - Cart items
 * @returns {boolean}
 */
export function hasVirtualProducts(cart) {
    return cart.some(item => item.isVirtual);
}

/**
 * Get virtual products from cart (consultations)
 * @param {Array} cart - Cart items
 * @returns {Array} Virtual products only
 */
export function getVirtualProducts(cart) {
    return cart.filter(item => item.isVirtual);
}

/**
 * Validate Nigerian phone number
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export function validateNigerianPhone(phone) {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Nigerian phone: starts with +234, 234, or 0, followed by 10 digits
    const patterns = [
        /^\+234\d{10}$/,
        /^234\d{10}$/,
        /^0\d{10}$/
    ];
    return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Format phone to Nigerian standard
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
export function formatNigerianPhone(phone) {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+234')) return cleaned;
    if (cleaned.startsWith('234')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+234${cleaned.substring(1)}`;
    return phone;
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean}
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
