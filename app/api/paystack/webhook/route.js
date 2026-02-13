// POST /api/paystack/webhook
// Handle Paystack webhook events for order status sync and email notifications

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { generateOrderNotificationEmail, generateCustomerConfirmationEmail, generateMasterclassNotificationEmail, generateMasterclassWelcomeEmail } from '../../../../lib/email-templates';

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
        paid_at,
        product_type: metadata?.product_type
    });

    // Check if Resend is configured
    if (!resend) {
        console.warn(`[WEBHOOK] ${timestamp} ⚠️ Resend not configured - skipping emails`);
        return;
    }

    // Route based on product type
    const productType = metadata?.product_type;

    if (productType === 'masterclass') {
        await handleMasterclassPayment(data, timestamp);
    } else if (productType === 'consultation') {
        await handleConsultationPayment(data, timestamp);
    } else {
        await handleRegularOrderPayment(data, timestamp);
    }
}

/**
 * Handle masterclass payment - send masterclass-specific emails
 */
async function handleMasterclassPayment(data, timestamp) {
    const { reference, customer, metadata, paid_at } = data;

    const masterclassData = {
        studentEmail: customer?.email || metadata?.student_email,
        reference,
        paidAt: paid_at,
        classDates: metadata?.class_dates || 'Feb 26-28, 2026'
    };

    if (!masterclassData.studentEmail) {
        console.error(`[WEBHOOK] ${timestamp} ❌ Missing student email - cannot send masterclass emails`);
        return;
    }

    // Send Email 1: Notification to Maryann
    try {
        console.log(`[WEBHOOK] ${timestamp} 📧 Sending masterclass notification to Maryann...`);

        await resend.emails.send({
            from: 'Remabell Exquisite <orders@remabellexquisite.ng>',
            to: MARYANN_EMAIL,
            subject: `🎓 New Masterclass Student - ${masterclassData.studentEmail} - ₦85,000`,
            html: generateMasterclassNotificationEmail(masterclassData)
        });

        console.log(`[WEBHOOK] ${timestamp} ✅ Maryann masterclass notification sent`);
    } catch (error) {
        console.error(`[WEBHOOK] ${timestamp} ❌ Failed to send Maryann masterclass notification:`, error);
    }

    // Send Email 2: Welcome to student
    try {
        console.log(`[WEBHOOK] ${timestamp} 📧 Sending masterclass welcome to: ${masterclassData.studentEmail}`);

        await resend.emails.send({
            from: 'Remabell Exquisite <orders@remabellexquisite.ng>',
            to: masterclassData.studentEmail,
            subject: `Welcome to Remabell's Skincare Masterclass! 🌟`,
            html: generateMasterclassWelcomeEmail(masterclassData)
        });

        console.log(`[WEBHOOK] ${timestamp} ✅ Student masterclass welcome sent`);
    } catch (error) {
        console.error(`[WEBHOOK] ${timestamp} ❌ Failed to send student masterclass welcome:`, error);
    }
}

/**
 * Handle consultation payment - send consultation booking notification
 */
async function handleConsultationPayment(data, timestamp) {
    const { reference, amount, customer, metadata, paid_at } = data;

    const customerEmail = customer?.email || 'Unknown';
    const serviceName = metadata?.service_name || 'Skincare Consultation';
    const price = amount / 100;

    // Send notification to Maryann
    try {
        console.log(`[WEBHOOK] ${timestamp} 📧 Sending consultation booking notification to Maryann...`);

        await resend.emails.send({
            from: 'Remabell Exquisite <orders@remabellexquisite.ng>',
            to: MARYANN_EMAIL,
            subject: `📞 New Consultation Booking - ${customerEmail} - ₦${price.toLocaleString('en-NG')}`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #2C5F5D, #1F4A48); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
        <span style="color: white; font-size: 28px;">📞</span>
      </div>
      <h1 style="color: #2C2C2C; font-size: 22px; margin: 0;">New Consultation Booking!</h1>
    </div>
    <div style="background: #f0faf0; border-left: 4px solid #4CAF50; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; color: #2C2C2C; font-weight: 600;">💰 Payment Confirmed</p>
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 10px 0; color: #6B6B6B; border-bottom: 1px solid #f0f0f0;">Service</td><td style="padding: 10px 0; font-weight: 600; color: #2C2C2C; border-bottom: 1px solid #f0f0f0;">${serviceName}</td></tr>
      <tr><td style="padding: 10px 0; color: #6B6B6B; border-bottom: 1px solid #f0f0f0;">Amount</td><td style="padding: 10px 0; font-weight: 600; color: #2C5F5D; border-bottom: 1px solid #f0f0f0;">₦${price.toLocaleString('en-NG')}</td></tr>
      <tr><td style="padding: 10px 0; color: #6B6B6B; border-bottom: 1px solid #f0f0f0;">Customer Email</td><td style="padding: 10px 0; font-weight: 600; color: #2C2C2C; border-bottom: 1px solid #f0f0f0;">${customerEmail}</td></tr>
      <tr><td style="padding: 10px 0; color: #6B6B6B; border-bottom: 1px solid #f0f0f0;">Reference</td><td style="padding: 10px 0; font-weight: 600; color: #2C2C2C; border-bottom: 1px solid #f0f0f0;">${reference}</td></tr>
      <tr><td style="padding: 10px 0; color: #6B6B6B;">Paid At</td><td style="padding: 10px 0; font-weight: 600; color: #2C2C2C;">${paid_at ? new Date(paid_at).toLocaleString('en-NG') : 'N/A'}</td></tr>
    </table>
    <div style="background: #FFF8E1; border-left: 4px solid #FFC107; padding: 16px; border-radius: 8px; margin-top: 20px;">
      <p style="margin: 0; color: #6B6B6B; font-size: 14px;">⏰ <strong>Action Required:</strong> Please contact the customer within 24 hours to schedule their consultation.</p>
    </div>
  </div>
</body>
</html>`
        });

        console.log(`[WEBHOOK] ${timestamp} ✅ Consultation booking notification sent to Maryann`);
    } catch (error) {
        console.error(`[WEBHOOK] ${timestamp} ❌ Failed to send consultation booking notification:`, error);
    }

    // Send confirmation to customer
    try {
        if (customerEmail !== 'Unknown') {
            console.log(`[WEBHOOK] ${timestamp} 📧 Sending consultation confirmation to: ${customerEmail}`);

            await resend.emails.send({
                from: 'Remabell Exquisite <orders@remabellexquisite.ng>',
                to: customerEmail,
                subject: `Your ${serviceName} is Confirmed! 🌟`,
                html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #2C5F5D; font-size: 22px; margin: 0 0 8px;">Booking Confirmed! ✨</h1>
      <p style="color: #6B6B6B; margin: 0;">Thank you for booking with Remabell Exquisite</p>
    </div>
    <div style="background: #f0faf0; border-left: 4px solid #4CAF50; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; color: #2C2C2C;"><strong>${serviceName}</strong> — ₦${price.toLocaleString('en-NG')}</p>
    </div>
    <p style="color: #6B6B6B; line-height: 1.6;">We've received your payment and our skincare expert will contact you within <strong>24 hours</strong> to schedule your consultation.</p>
    <p style="color: #6B6B6B; line-height: 1.6;">Reference: <strong>${reference}</strong></p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://wa.me/2349027064415" style="display: inline-block; padding: 14px 32px; background: #25D366; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Contact Us on WhatsApp</a>
    </div>
    <p style="color: #C9B98F; text-align: center; margin-top: 24px; font-size: 14px; font-style: italic;">— Remabell Exquisite, Lagos' Premier Skincare Destination</p>
  </div>
</body>
</html>`
            });

            console.log(`[WEBHOOK] ${timestamp} ✅ Customer consultation confirmation sent`);
        }
    } catch (error) {
        console.error(`[WEBHOOK] ${timestamp} ❌ Failed to send customer consultation confirmation:`, error);
    }
}

/**
 * Handle regular order payment - send order confirmation emails
 */
async function handleRegularOrderPayment(data, timestamp) {
    const { reference, amount, customer, metadata, paid_at } = data;

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
