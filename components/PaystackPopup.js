'use client';

import { useEffect, useRef } from 'react';
import { getPublicKey } from '../lib/paystack';

/**
 * PaystackPopup Component
 * Renders an inline Paystack payment popup
 * 
 * @param {Object} props
 * @param {string} props.email - Customer email
 * @param {number} props.amount - Amount in kobo
 * @param {string} props.reference - Unique transaction reference
 * @param {Object} props.metadata - Additional transaction metadata
 * @param {Function} props.onSuccess - Callback on successful payment
 * @param {Function} props.onClose - Callback when popup is closed
 * @param {boolean} props.disabled - Disable the button
 * @param {string} props.buttonText - Custom button text
 * @param {string} props.className - Additional CSS classes
 */
export default function PaystackPopup({
    email,
    amount,
    reference,
    metadata = {},
    onSuccess,
    onClose,
    disabled = false,
    buttonText = 'Pay Now',
    className = ''
}) {
    const paystackRef = useRef(null);

    useEffect(() => {
        // Dynamically load Paystack inline script
        const loadPaystack = async () => {
            if (typeof window !== 'undefined' && !window.PaystackPop) {
                const script = document.createElement('script');
                script.src = 'https://js.paystack.co/v2/inline.js';
                script.async = true;
                document.body.appendChild(script);
            }
        };
        loadPaystack();
    }, []);

    const handlePayment = () => {
        if (typeof window === 'undefined' || !window.PaystackPop) {
            console.error('Paystack not loaded');
            return;
        }

        const publicKey = getPublicKey();
        if (!publicKey) {
            console.error('Paystack public key not configured');
            return;
        }

        const popup = new window.PaystackPop();
        popup.newTransaction({
            key: publicKey,
            email,
            amount,
            currency: 'NGN',
            ref: reference,
            channels: ['card', 'bank', 'ussd', 'bank_transfer'],
            label: 'Remabell Exquisite',
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
            onSuccess: (transaction) => {
                console.log('Payment successful:', transaction);
                if (onSuccess) onSuccess(transaction);
            },
            onCancel: () => {
                console.log('Payment cancelled');
                if (onClose) onClose();
            }
        });
    };

    const formatAmount = (kobo) => {
        const naira = kobo / 100;
        return `₦${naira.toLocaleString('en-NG')}`;
    };

    return (
        <button
            ref={paystackRef}
            onClick={handlePayment}
            disabled={disabled}
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '18px 32px',
                background: disabled ? '#9CA3AF' : 'linear-gradient(135deg, #2C5F5D, #1F4A48)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: disabled ? 'not-allowed' : 'pointer',
                boxShadow: disabled ? 'none' : '0 4px 20px rgba(44,95,93,0.3)',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Lock Icon */}
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>

            <span>{buttonText || `Pay ${formatAmount(amount)} Securely`}</span>

            {/* Card Icons */}
            <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                {/* Visa */}
                <svg width="24" height="16" viewBox="0 0 24 16" fill="white" opacity="0.8">
                    <rect width="24" height="16" rx="2" fill="white" fillOpacity="0.2" />
                    <text x="12" y="11" fontSize="6" fill="white" textAnchor="middle" fontWeight="bold">VISA</text>
                </svg>
                {/* Mastercard */}
                <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                    <circle cx="9" cy="8" r="5" fill="#EB001B" fillOpacity="0.8" />
                    <circle cx="15" cy="8" r="5" fill="#F79E1B" fillOpacity="0.8" />
                </svg>
            </div>
        </button>
    );
}
