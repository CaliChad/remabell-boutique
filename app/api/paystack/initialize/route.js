// POST /api/paystack/initialize
// Initialize a Paystack transaction

import { NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, amount, reference, metadata, callback_url } = body;

        // Validate required fields
        if (!email || !amount || !reference) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: email, amount, reference' },
                { status: 400 }
            );
        }

        // Initialize transaction with Paystack
        const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount, // Amount in kobo
                reference,
                currency: 'NGN',
                callback_url: callback_url || `${process.env.NEXT_PUBLIC_SITE_URL}/order-success`,
                channels: ['card', 'bank', 'ussd', 'bank_transfer'],
                metadata: {
                    custom_fields: [
                        {
                            display_name: "Store",
                            variable_name: "store",
                            value: "Remabell Exquisite"
                        },
                        ...(metadata?.custom_fields || [])
                    ],
                    ...metadata
                }
            })
        });

        const data = await response.json();

        if (!data.status) {
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to initialize transaction' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                authorization_url: data.data.authorization_url,
                access_code: data.data.access_code,
                reference: data.data.reference
            }
        });

    } catch (error) {
        console.error('Paystack initialize error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
