// GET /api/paystack/verify?reference=xxx
// Verify a Paystack transaction

import { NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const reference = searchParams.get('reference');

        if (!reference) {
            return NextResponse.json(
                { success: false, message: 'Missing reference parameter' },
                { status: 400 }
            );
        }

        // Verify transaction with Paystack
        const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.status) {
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to verify transaction' },
                { status: 400 }
            );
        }

        const transaction = data.data;
        const isSuccessful = transaction.status === 'success';

        return NextResponse.json({
            success: true,
            data: {
                reference: transaction.reference,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency,
                paid_at: transaction.paid_at,
                channel: transaction.channel,
                transaction_id: transaction.id,
                customer: {
                    email: transaction.customer?.email,
                    customer_code: transaction.customer?.customer_code
                },
                metadata: transaction.metadata,
                isSuccessful
            }
        });

    } catch (error) {
        console.error('Paystack verify error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
