// Email templates for order notifications
// Used by Paystack webhook for automated order emails

/**
 * Generate HTML email template for order notification to Maryann
 */
export function generateOrderNotificationEmail(orderData) {
    const {
        customerName,
        customerEmail,
        customerPhone,
        orderTotal,
        cartItems,
        shippingRegion,
        deliveryLocation,
        streetAddress,
        shippingFee,
        discountActive,
        discountPerItem,
        totalDiscount,
        reference,
        paidAt
    } = orderData;

    const formattedDate = new Date(paidAt || Date.now()).toLocaleString('en-NG', {
        dateStyle: 'full',
        timeStyle: 'short'
    });

    const productsRows = cartItems.map(item => {
        const priceCell = discountActive && item.discounted_price && item.discounted_price !== item.price
            ? `<span style="text-decoration: line-through; color: #9CA3AF;">${item.price}</span> <strong style="color: #059669;">${item.discounted_price}</strong>`
            : item.price;
        return `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">${priceCell}</td>
        </tr>`;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Remabell Exquisite</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">🔥 New Order Received!</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px;">
            <!-- Order Details -->
            <h2 style="color: #1F2937; margin: 0 0 20px; font-size: 18px; border-bottom: 2px solid #059669; padding-bottom: 8px;">Customer Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                    <td style="padding: 8px 0; color: #6B7280; width: 140px;">Customer Name:</td>
                    <td style="padding: 8px 0; color: #1F2937; font-weight: 600;">${customerName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6B7280;">Customer Email:</td>
                    <td style="padding: 8px 0; color: #1F2937;">${customerEmail}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6B7280;">Phone Number:</td>
                    <td style="padding: 8px 0; color: #1F2937; font-weight: 600;">${customerPhone || 'Not provided'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6B7280;">Order Reference:</td>
                    <td style="padding: 8px 0; color: #1F2937; font-family: monospace;">${reference}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6B7280;">Order Total:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: 700; font-size: 20px;">₦${orderTotal.toLocaleString('en-NG')}</td>
                </tr>
            </table>
            
            <!-- Products Ordered -->
            <h2 style="color: #1F2937; margin: 0 0 16px; font-size: 18px; border-bottom: 2px solid #059669; padding-bottom: 8px;">Products Ordered</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                    <tr style="background: #F9FAFB;">
                        <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600;">Product</th>
                        <th style="padding: 12px; text-align: center; color: #374151; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsRows}
                </tbody>
            </table>
            
            ${discountActive && totalDiscount > 0 ? `
            <!-- Discount Applied -->
            <div style="background: #F0FDF4; padding: 12px 16px; border-radius: 8px; border: 1px solid #BBF7D0; margin-bottom: 24px;">
                <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">
                    🔥 Limited-Time Sale Applied: -₦${totalDiscount.toLocaleString('en-NG')} (₦${discountPerItem.toLocaleString('en-NG')} off per item)
                </p>
            </div>
            ` : ''}
            
            <!-- Delivery Information -->
            <h2 style="color: #1F2937; margin: 0 0 16px; font-size: 18px; border-bottom: 2px solid #059669; padding-bottom: 8px;">Delivery Information</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                    <td style="padding: 8px 0; color: #6B7280; width: 140px;">Shipping Region:</td>
                    <td style="padding: 8px 0; color: #1F2937; font-weight: 500;">${shippingRegion || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6B7280;">Specific Location:</td>
                    <td style="padding: 8px 0; color: #1F2937; font-weight: 500;">${deliveryLocation || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6B7280;">Street Address:</td>
                    <td style="padding: 8px 0; color: #1F2937;">${streetAddress || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6B7280;">Delivery Fee:</td>
                    <td style="padding: 8px 0; color: #1F2937; font-weight: 600;">₦${(shippingFee || 0).toLocaleString('en-NG')}</td>
                </tr>
            </table>
            
            <!-- Timestamp -->
            <div style="background: #F0FDF4; padding: 16px; border-radius: 8px; border-left: 4px solid #059669;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                    <strong>Order Time:</strong> ${formattedDate}
                </p>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
                <p style="color: #6B7280; font-size: 13px; margin: 0;">
                    Login to <a href="https://dashboard.paystack.com" style="color: #059669; text-decoration: none;">Paystack Dashboard</a> to view full transaction details
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Generate HTML email template for customer order confirmation
 */
export function generateCustomerConfirmationEmail(orderData) {
    const {
        customerName,
        orderTotal,
        cartItems,
        shippingRegion,
        deliveryLocation,
        streetAddress,
        discountActive,
        discountPerItem,
        totalDiscount,
        reference
    } = orderData;

    const isLagos = shippingRegion?.includes('lagos');
    const deliveryTimeline = isLagos ? '1-2 business days' : '3-5 business days';
    const fullAddress = [streetAddress, deliveryLocation, shippingRegion?.replace('-', ' ')].filter(Boolean).join(', ');

    const productsRows = cartItems.map(item => {
        const priceCell = discountActive && item.discounted_price && item.discounted_price !== item.price
            ? `<span style="text-decoration: line-through; color: #9CA3AF;">${item.price}</span> <strong style="color: #059669;">${item.discounted_price}</strong>`
            : item.price;
        return `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">${priceCell}</td>
        </tr>`;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Remabell Exquisite</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 18px;">✨ Order Confirmed!</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px;">
            <!-- Greeting -->
            <div style="margin-bottom: 24px;">
                <h2 style="color: #1F2937; margin: 0 0 12px; font-size: 22px;">Hi ${customerName?.split(' ')[0] || 'there'},</h2>
                <p style="color: #4B5563; line-height: 1.6; margin: 0;">
                    Thank you for shopping with Remabell Exquisite! We've received your payment of <strong style="color: #059669;">₦${orderTotal.toLocaleString('en-NG')}</strong> and your order is confirmed.
                </p>
            </div>
            
            <!-- Delivery Info Box -->
            <div style="background: #F0FDF4; padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #BBF7D0;">
                <h3 style="color: #166534; margin: 0 0 12px; font-size: 16px; display: flex; align-items: center;">
                    🚚 Delivery Details
                </h3>
                <p style="color: #166534; margin: 0 0 8px; font-size: 14px;">
                    <strong>Address:</strong> ${fullAddress || 'N/A'}
                </p>
                <p style="color: #166534; margin: 0; font-size: 14px;">
                    <strong>Expected Delivery:</strong> ${deliveryTimeline}
                </p>
            </div>
            
            <!-- Important Notice -->
            <div style="background: #FFF7ED; padding: 16px; border-radius: 8px; border-left: 4px solid #FB923C; margin-bottom: 24px;">
                <p style="color: #9A3412; margin: 0; font-size: 14px;">
                    <strong>📋 Please Note:</strong> Orders placed after 4 PM or on Sundays are processed the next business day.
                </p>
            </div>
            
            <!-- Products Summary -->
            <h3 style="color: #1F2937; margin: 0 0 16px; font-size: 16px; border-bottom: 2px solid #059669; padding-bottom: 8px;">Your Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                    <tr style="background: #F9FAFB;">
                        <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600;">Item</th>
                        <th style="padding: 12px; text-align: center; color: #374151; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsRows}
                </tbody>
            </table>
            
            ${discountActive && totalDiscount > 0 ? `
            <!-- Discount Savings -->
            <div style="background: #F0FDF4; padding: 14px 16px; border-radius: 8px; border: 1px solid #BBF7D0; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">
                    🎉 You saved ₦${totalDiscount.toLocaleString('en-NG')} with our Limited-Time Sale!
                </p>
            </div>
            ` : ''}
            
            <!-- Order Reference -->
            <p style="color: #6B7280; font-size: 13px; margin: 0 0 24px;">
                <strong>Order Reference:</strong> <span style="font-family: monospace; background: #F3F4F6; padding: 2px 6px; border-radius: 4px;">${reference}</span>
            </p>
            
            <!-- Contact Info -->
            <div style="background: #F3F4F6; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <p style="color: #4B5563; margin: 0 0 8px; font-size: 14px;">Questions about your order?</p>
                <a href="https://wa.me/2347080803226" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    💬 WhatsApp Us
                </a>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center;">
                <p style="color: #059669; font-weight: 600; margin: 0 0 8px; font-size: 14px;">
                    ✅ 100% Original Products • 🚚 Same-day Lagos Delivery • ⭐ Trusted Since 2023
                </p>
                <p style="color: #9CA3AF; margin: 16px 0 0; font-size: 14px;">
                    The Remabell Exquisite Team 💚
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Generate HTML email template for masterclass registration notification to Maryann
 */
export function generateMasterclassNotificationEmail(data) {
    const { studentEmail, reference, paidAt, classDates } = data;

    const formattedDate = new Date(paidAt || Date.now()).toLocaleString('en-NG', {
        dateStyle: 'full',
        timeStyle: 'short'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7C2D12, #9A3412); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🎓 Masterclass Registration</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 18px;">New Student Enrolled!</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px;">
            <!-- Amount Box -->
            <div style="background: #F0FDF4; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center; border: 2px solid #059669;">
                <p style="color: #166534; margin: 0 0 8px; font-size: 14px; font-weight: 600;">Payment Received</p>
                <p style="color: #059669; margin: 0; font-size: 36px; font-weight: 700;">₦85,000</p>
            </div>
            
            <!-- Student Details -->
            <h2 style="color: #1F2937; margin: 0 0 20px; font-size: 18px; border-bottom: 2px solid #7C2D12; padding-bottom: 8px;">Student Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                    <td style="padding: 12px 0; color: #6B7280; width: 140px;">Email:</td>
                    <td style="padding: 12px 0; color: #1F2937; font-weight: 600;">${studentEmail}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #6B7280;">Reference:</td>
                    <td style="padding: 12px 0; color: #1F2937; font-family: monospace;">${reference}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #6B7280;">Class Dates:</td>
                    <td style="padding: 12px 0; color: #1F2937; font-weight: 600;">${classDates || 'Feb 26-28, 2026'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #6B7280;">Registration Time:</td>
                    <td style="padding: 12px 0; color: #1F2937;">${formattedDate}</td>
                </tr>
            </table>
            
            <!-- Action Reminder -->
            <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; border-left: 4px solid #F59E0B;">
                <p style="color: #92400E; margin: 0; font-size: 14px;">
                    <strong>⏰ Action Required:</strong> Send the Telegram group link to this student within 24 hours.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Generate HTML email template for masterclass welcome to student
 */
export function generateMasterclassWelcomeEmail(data) {
    const { studentEmail, reference, classDates } = data;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Welcome to the Masterclass! 🎉</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 16px;">Remabell's Skincare Master Class</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px;">
            <!-- Greeting -->
            <div style="margin-bottom: 24px;">
                <h2 style="color: #1F2937; margin: 0 0 12px; font-size: 22px;">Congratulations! 🌟</h2>
                <p style="color: #4B5563; line-height: 1.6; margin: 0;">
                    You're officially registered for Remabell's Skincare Master Class. We're so excited to have you join us!
                </p>
            </div>
            
            <!-- Class Details -->
            <div style="background: #F0FDF4; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #BBF7D0;">
                <h3 style="color: #166534; margin: 0 0 16px; font-size: 16px;">📅 Class Schedule</h3>
                <p style="color: #166534; margin: 0; font-size: 24px; font-weight: 700;">${classDates || 'February 26-28, 2026'}</p>
            </div>
            
            <!-- What's Next -->
            <h3 style="color: #1F2937; margin: 0 0 16px; font-size: 16px; border-bottom: 2px solid #059669; padding-bottom: 8px;">📋 What Happens Next</h3>
            
            <div style="margin-bottom: 24px;">
                <div style="display: flex; margin-bottom: 16px;">
                    <div style="width: 28px; height: 28px; background: #059669; border-radius: 50%; color: white; font-weight: 700; font-size: 14px; text-align: center; line-height: 28px; margin-right: 12px; flex-shrink: 0;">1</div>
                    <div>
                        <p style="color: #1F2937; margin: 0 0 4px; font-weight: 600;">Telegram Group Invite</p>
                        <p style="color: #6B7280; margin: 0; font-size: 14px;">You'll receive the private Telegram group link within 24 hours. [Maryann will send group link]</p>
                    </div>
                </div>
                
                <div style="display: flex; margin-bottom: 16px;">
                    <div style="width: 28px; height: 28px; background: #059669; border-radius: 50%; color: white; font-weight: 700; font-size: 14px; text-align: center; line-height: 28px; margin-right: 12px; flex-shrink: 0;">2</div>
                    <div>
                        <p style="color: #1F2937; margin: 0 0 4px; font-weight: 600;">Pre-Class Instructions</p>
                        <p style="color: #6B7280; margin: 0; font-size: 14px;">24 hours before the class, you'll receive joining instructions and materials to prepare.</p>
                    </div>
                </div>
                
                <div style="display: flex;">
                    <div style="width: 28px; height: 28px; background: #059669; border-radius: 50%; color: white; font-weight: 700; font-size: 14px; text-align: center; line-height: 28px; margin-right: 12px; flex-shrink: 0;">3</div>
                    <div>
                        <p style="color: #1F2937; margin: 0 0 4px; font-weight: 600;">Join & Transform</p>
                        <p style="color: #6B7280; margin: 0; font-size: 14px;">Attend the 3-day intensive and unlock the secrets to flawless, radiant skin!</p>
                    </div>
                </div>
            </div>
            
            <!-- Order Reference -->
            <p style="color: #6B7280; font-size: 13px; margin: 0 0 24px;">
                <strong>Your Reference:</strong> <span style="font-family: monospace; background: #F3F4F6; padding: 2px 6px; border-radius: 4px;">${reference}</span>
            </p>
            
            <!-- Contact Info -->
            <div style="background: #F3F4F6; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <p style="color: #4B5563; margin: 0 0 8px; font-size: 14px;">Questions? We're here to help!</p>
                <a href="https://wa.me/2347080803226" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    💬 WhatsApp Us
                </a>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center;">
                <p style="color: #059669; font-weight: 600; margin: 0 0 8px; font-size: 14px;">
                    See you in class! 🌟
                </p>
                <p style="color: #9CA3AF; margin: 16px 0 0; font-size: 14px;">
                    The Remabell Exquisite Team 💚
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

