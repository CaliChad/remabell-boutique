// POST /api/paystack/webhook
// Handle Paystack webhook events for order status sync

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

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

        // Verify webhook signature (recommended for production)
        if (signature && !verifyWebhookSignature(body, signature)) {
            console.error('Invalid webhook signature');
            return NextResponse.json(
                { success: false, message: 'Invalid signature' },
                { status: 401 }
            );
        }

        const { event, data } = body;

        console.log(`Paystack webhook received: ${event}`, {
            reference: data?.reference,
            status: data?.status,
            amount: data?.amount
        });

        // Handle different event types
        switch (event) {
            case 'charge.success':
                // Payment was successful
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
                console.log(`Unhandled webhook event: ${event}`);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ success: true, message: 'Webhook received' });

    } catch (error) {
        console.error('Webhook processing error:', error);
        // Still return 200 to prevent Paystack from retrying
        return NextResponse.json({ success: true, message: 'Webhook received with errors' });
    }
}

/**
 * Handle successful charge
 */
async function handleChargeSuccess(data) {
    const { reference, amount, customer, metadata, paid_at, channel } = data;

    console.log(`✅ Payment successful: ${reference}`, {
        amount: amount / 100, // Convert from kobo
        email: customer?.email,
        channel,
        paid_at
    });

    // In a full implementation, you would:
    // 1. Update order status in database
    // 2. Send confirmation email
    // 3. Trigger fulfillment process
    // 
    // For this localStorage-based implementation, the client handles updates
    // after verifying the transaction via the verify endpoint.
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(data) {
    const { reference, gateway_response } = data;

    console.log(`❌ Payment failed: ${reference}`, {
        reason: gateway_response
    });

    // Log for monitoring/alerting purposes
}

/**
 * Handle successful transfer (refunds)
 */
async function handleTransferSuccess(data) {
    const { reference, amount } = data;

    console.log(`💸 Refund processed: ${reference}`, {
        amount: amount / 100
    });
}

/**
 * Handle failed transfer
 */
async function handleTransferFailed(data) {
    const { reference, reason } = data;

    console.log(`⚠️ Refund failed: ${reference}`, {
        reason
    });
}
