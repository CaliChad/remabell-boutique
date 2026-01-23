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

// Generate WhatsApp message from cart
export function generateWhatsAppMessage(cart, customerName = '') {
    if (!cart || cart.length === 0) {
        return "Hello Remabell, I'd like to inquire about your products.";
    }

    let message = `Hello Remabell, I'd like to order:\n\n`;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.brand} ${item.name} x ${item.quantity}\n`;
    });

    message += `\nPlease confirm availability and total cost. Thank you!`;

    if (customerName) {
        message += `\n\nName: ${customerName}`;
    }

    return encodeURIComponent(message);
}

// Generate WhatsApp link for single product
export function generateProductWhatsAppLink(product) {
    const message = `Hello Remabell, I'm interested in:\n\n${product.brand} ${product.name}\n\nPlease confirm availability and price. Thank you!`;
    return `https://wa.me/2347080803226?text=${encodeURIComponent(message)}`;
}

// Generate WhatsApp link for cart
export function generateCartWhatsAppLink(cart, customerName = '') {
    const message = generateWhatsAppMessage(cart, customerName);
    return `https://wa.me/2347080803226?text=${message}`;
}
