// POST /api/paystack/webhook
// Handle Paystack webhook events for order status sync and email notifications

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { generateOrderNotificationEmail, generateCustomerConfirmationEmail } from '../../../../lib/email-templates';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Maryann's email for order notifications
const MARYANN_EMAIL = 'rono6802@gmail.com';

/**
 * Verify Paystack webhook signature
 */
function verifyWebhookSignature(body, signature) {
    const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(body))
        .digest('hex');
    return hash === signature;
}

export async function POST(request) {
    try {
        const signature = request.headers.get('x-paystack-signature');
        const body = await request.json();

        // Verify webhook signature (required for security)
        if (signature && !verifyWebhookSignature(body, signature)) {
            console.error('[WEBHOOK] Invalid signature');
            return NextResponse.json(
                { success: false, message: 'Invalid signature' },
                { status: 401 }
            );
        }

        const { event, data } = body;

        console.log(`[WEBHOOK] ${new Date().toISOString()} - Event received: ${event}`, {
            reference: data?.reference,
            status: data?.status,
            amount: data?.amount
        });

        // Handle different event types
        switch (event) {
            case 'charge.success':
                // Payment was successful - send emails
                await handleChargeSuccess(data);
                break;

            case 'charge.failed':
                // Payment failed
                await handleChargeFailed(data);
                break;

            case 'transfer.success':
                // Refund/transfer was successful
                await handleTransferSuccess(data);
                break;

            case 'transfer.failed':
                // Refund/transfer failed
                await handleTransferFailed(data);
                break;

            default:
                console.log(`[WEBHOOK] Unhandled event: ${event}`);
        }

        // Always return 200 to acknowledge receipt (prevents Paystack retries)
        return NextResponse.json({ success: true, message: 'Webhook received' });

    } catch (error) {
        console.error('[WEBHOOK] Processing error:', error);
        // Still return 200 to prevent Paystack from retrying
        return NextResponse.json({ success: true, message: 'Webhook received with errors' });
    }
}

/**
 * Handle successful charge - send notification emails
 */
async function handleChargeSuccess(data) {
    const { reference, amount, customer, metadata, paid_at, channel } = data;
    const timestamp = new Date().toISOString();

    console.log(`[WEBHOOK] ${timestamp} ✅ Payment successful: ${reference}`, {
        amount: amount / 100,
        email: customer?.email,
        channel,
        paid_at
    });

    // Check if Resend is configured
    if (!resend) {
        console.warn(`[WEBHOOK] ${timestamp} ⚠️ Resend not configured - skipping emails`);
        return;
    }

    // Parse cart items from metadata
    let cartItems = [];
    try {
        if (metadata?.cart_items) {
            cartItems = typeof metadata.cart_items === 'string'
                ? JSON.parse(metadata.cart_items)
                : metadata.cart_items;
        }
    } catch (e) {
        console.error(`[WEBHOOK] ${timestamp} Failed to parse cart_items:`, e);
        cartItems = [];
    }

    // Prepare order data for email templates
    const orderData = {
        customerName: metadata?.customer_name || customer?.first_name || 'Valued Customer',
        customerEmail: customer?.email,
        customerPhone: metadata?.phone || customer?.phone,
        orderTotal: amount / 100,
        cartItems,
        shippingRegion: metadata?.shipping_region,
        deliveryLocation: metadata?.delivery_location,
        streetAddress: metadata?.street_address,
        shippingFee: metadata?.shipping_fee || 0,
        reference,
        paidAt: paid_at
    };

    // Validate required fields before sending emails
    if (!orderData.customerEmail) {
        console.error(`[WEBHOOK] ${timestamp} ❌ Missing customer email - cannot send emails`);
        return;
    }

    // Send Email 1: Order notification to Maryann
    try {
        console.log(`[WEBHOOK] ${timestamp} 📧 Sending order notification to Maryann...`);

        const maryannEmail = await resend.emails.send({
            from: 'Remabell Exquisite <orders@remabellexquisite.ng>',
            to: MARYANN_EMAIL,
            subject: `🔥 New Order - ${orderData.customerName} - ₦${orderData.orderTotal.toLocaleString('en-NG')}`,
            html: generateOrderNotificationEmail(orderData)
        });

        console.log(`[WEBHOOK] ${timestamp} ✅ Maryann notification sent:`, maryannEmail);
    } catch (error) {
        console.error(`[WEBHOOK] ${timestamp} ❌ Failed to send Maryann notification:`, error);
        // Continue to customer email even if Maryann's fails
    }

    // Send Email 2: Order confirmation to customer
    try {
        console.log(`[WEBHOOK] ${timestamp} 📧 Sending confirmation to customer: ${orderData.customerEmail}`);

        const customerEmail = await resend.emails.send({
            from: 'Remabell Exquisite <orders@remabellexquisite.ng>',
            to: orderData.customerEmail,
            subject: `Order Confirmed! Your Remabell Glow is on the way ✨`,
            html: generateCustomerConfirmationEmail(orderData)
        });

        console.log(`[WEBHOOK] ${timestamp} ✅ Customer confirmation sent:`, customerEmail);
    } catch (error) {
        console.error(`[WEBHOOK] ${timestamp} ❌ Failed to send customer confirmation:`, error);
        // Maryann was already notified, so we can continue
    }
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(data) {
    const { reference, gateway_response } = data;

    console.log(`[WEBHOOK] ❌ Payment failed: ${reference}`, {
        reason: gateway_response
    });

    // Log for monitoring/alerting purposes
}

/**
 * Handle successful transfer (refunds)
 */
async function handleTransferSuccess(data) {
    const { reference, amount } = data;

    console.log(`[WEBHOOK] 💸 Refund processed: ${reference}`, {
        amount: amount / 100
    });
}

/**
 * Handle failed transfer
 */
async function handleTransferFailed(data) {
    const { reference, reason } = data;

    console.log(`[WEBHOOK] ⚠️ Refund failed: ${reference}`, {
        reason
    });
}
