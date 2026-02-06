// Order management utilities for Remabell Exquisite

const ORDERS_KEY = 'remabell_orders';

/**
 * Order status enum
 */
export const OrderStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

/**
 * Create a new order object
 * @param {Object} params - Order parameters
 * @returns {Object} Order object
 */
export function createOrder({
    reference,
    cart,
    customer,
    totalAmount,
    paymentStatus = 'pending',
    consultationDateTime = null
}) {
    const now = new Date().toISOString();

    return {
        id: reference,
        reference,
        orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            isVirtual: item.isVirtual || false,
            sku: item.sku || null
        })),
        customer: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address || null,
            city: customer.city || 'Lagos',
            state: customer.state || 'Lagos',
            notes: customer.notes || ''
        },
        consultationDateTime,
        totalAmount,
        currency: 'NGN',
        status: OrderStatus.PENDING,
        paymentStatus,
        paystackReference: reference,
        createdAt: now,
        updatedAt: now
    };
}

/**
 * Save order to localStorage
 * @param {Object} order - Order object
 * @returns {Object} Saved order
 */
export function saveOrder(order) {
    if (typeof window === 'undefined') return order;

    const orders = getOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);

    if (existingIndex >= 0) {
        orders[existingIndex] = { ...orders[existingIndex], ...order, updatedAt: new Date().toISOString() };
    } else {
        orders.unshift(order); // Add to beginning (newest first)
    }

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return order;
}

/**
 * Get all orders from localStorage
 * @returns {Array} Array of orders
 */
export function getOrders() {
    if (typeof window === 'undefined') return [];
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
}

/**
 * Get order by ID/reference
 * @param {string} id - Order ID or reference
 * @returns {Object|null} Order or null
 */
export function getOrderById(id) {
    const orders = getOrders();
    return orders.find(o => o.id === id || o.reference === id || o.orderNumber === id) || null;
}

/**
 * Update order status
 * @param {string} id - Order ID
 * @param {string} status - New status
 * @param {string} paymentStatus - New payment status
 * @returns {Object|null} Updated order
 */
export function updateOrderStatus(id, status, paymentStatus) {
    const order = getOrderById(id);
    if (!order) return null;

    order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();

    return saveOrder(order);
}

/**
 * Mark order as paid/successful
 * @param {string} reference - Paystack reference
 * @param {Object} paystackData - Paystack transaction data
 * @returns {Object|null} Updated order
 */
export function markOrderAsPaid(reference, paystackData = {}) {
    const order = getOrderById(reference);
    if (!order) return null;

    order.status = OrderStatus.PROCESSING;
    order.paymentStatus = 'paid';
    order.paystackTransactionId = paystackData.transaction_id || paystackData.id;
    order.paidAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    return saveOrder(order);
}

/**
 * Get recent orders (last N orders)
 * @param {number} count - Number of orders to retrieve
 * @returns {Array} Array of recent orders
 */
export function getRecentOrders(count = 5) {
    const orders = getOrders();
    return orders.slice(0, count);
}

/**
 * Check if order contains consultations
 * @param {Object} order - Order object
 * @returns {boolean}
 */
export function hasConsultations(order) {
    return order.items.some(item => item.isVirtual);
}

/**
 * Get order summary for display
 * @param {Object} order - Order object
 * @returns {Object} Summary object
 */
export function getOrderSummary(order) {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const hasVirtual = hasConsultations(order);

    return {
        orderNumber: order.orderNumber,
        itemCount,
        totalAmount: order.totalAmount,
        hasConsultations: hasVirtual,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        customerEmail: order.customer.email,
        consultationDateTime: order.consultationDateTime
    };
}
