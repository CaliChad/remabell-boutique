// Shopping cart utilities using localStorage

export const CART_KEY = 'remabell_cart';

// Get cart from localStorage
export function getCart() {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
export function saveCart(cart) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Add item to cart
export function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    saveCart(cart);
    return cart;
}

// Remove item from cart
export function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
    return updatedCart;
}

// Update item quantity
export function updateQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
        if (quantity <= 0) {
            return removeFromCart(productId);
        }
        item.quantity = quantity;
        saveCart(cart);
    }

    return cart;
}

// Get cart item count
export function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Clear cart
export function clearCart() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CART_KEY);
    return [];
}

// Generate WhatsApp message from cart with pre-payment policy
export function generateWhatsAppMessage(cart, customerName = '') {
    if (!cart || cart.length === 0) {
        return "Hello Remabell, I'd like to inquire about your products.";
    }

    // Calculate total
    let total = 0;
    cart.forEach(item => {
        const price = parseInt(item.price.replace(/[₦,]/g, ''));
        total += price * item.quantity;
    });

    let message = `Hi Remabell, I want to place an order:\n\n`;

    cart.forEach(item => {
        const itemTotal = parseInt(item.price.replace(/[₦,]/g, '')) * item.quantity;
        if (item.quantity > 1) {
            message += `${item.brand} ${item.name} x${item.quantity} - ₦${itemTotal.toLocaleString()}\n`;
        } else {
            message += `${item.brand} ${item.name} - ${item.price}\n`;
        }
    });

    message += `\n*Total: ₦${total.toLocaleString()}*\n\n`;
    message += `I'm ready to make payment. Please send your bank account details or payment link. Thank you!`;

    if (customerName) {
        message += `\n\nName: ${customerName}`;
    }

    return encodeURIComponent(message);
}

// Generate WhatsApp link for single product with pre-payment policy
export function generateProductWhatsAppLink(product) {
    const message = `Hi Remabell, I want to order:\n\n${product.brand} ${product.name} - ${product.price}\n\n*Total: ${product.price}*\n\nI'm ready to make payment. Please send your bank account details or payment link. Thank you!`;
    return `https://wa.me/2347080803226?text=${encodeURIComponent(message)}`;
}

// Generate WhatsApp link for cart
export function generateCartWhatsAppLink(cart, customerName = '') {
    const message = generateWhatsAppMessage(cart, customerName);
    return `https://wa.me/2347080803226?text=${message}`;
}

