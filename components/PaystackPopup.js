'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * PaystackPopup Component
 * Renders an inline Paystack payment popup
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
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [envError, setEnvError] = useState(null);

    // Environment check on mount
    useEffect(() => {
        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        console.log('🔧 Paystack Environment Check:');
        console.log('   Public Key:', publicKey ? `${publicKey.substring(0, 20)}...` : '❌ MISSING');
        console.log('   Site URL:', process.env.NEXT_PUBLIC_SITE_URL || '❌ NOT SET');
        console.log('   Environment:', process.env.NODE_ENV);

        if (!publicKey) {
            setEnvError('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured');
            console.error('❌ CRITICAL: Paystack public key is missing from environment variables');
            console.error('   Ensure NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is set in Vercel Environment Variables');
        }
    }, []);

    // Load Paystack script
    useEffect(() => {
        // Check if already loaded
        if (window.PaystackPop) {
            console.log('✅ PaystackPop already available');
            setScriptLoaded(true);
            return;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector('script[src*="paystack.co"]');
        if (existingScript) {
            console.log('⏳ Paystack script exists, waiting for load...');
            existingScript.addEventListener('load', () => setScriptLoaded(true));
            if (window.PaystackPop) setScriptLoaded(true);
            return;
        }

        // Create and load script
        console.log('📦 Loading Paystack script...');
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v2/inline.js';
        script.async = true;
        script.onload = () => {
            console.log('✅ Paystack script loaded successfully');
            setScriptLoaded(true);
        };
        script.onerror = (e) => {
            console.error('❌ Failed to load Paystack script:', e);
            setEnvError('Failed to load Paystack payment system');
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup not needed as we want script to persist
        };
    }, []);

    const handlePayment = useCallback(() => {
        console.log('🔵 Payment button clicked');
        console.log('   Email:', email);
        console.log('   Amount (kobo):', amount);
        console.log('   Reference:', reference);
        console.log('   Script loaded:', scriptLoaded);
        console.log('   PaystackPop available:', !!window.PaystackPop);

        // Validation
        if (!email || email === 'customer@example.com') {
            alert('Please enter your email address first');
            return;
        }

        if (!amount || amount <= 0) {
            alert('Invalid cart amount');
            return;
        }

        if (!scriptLoaded || !window.PaystackPop) {
            console.error('❌ Paystack not ready');
            alert('Payment system is loading. Please wait a moment and try again.');
            return;
        }

        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        console.log('   Public Key:', publicKey ? `${publicKey.substring(0, 15)}...` : 'MISSING');

        if (!publicKey) {
            console.error('❌ Paystack public key not configured');
            console.error('   This usually means NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set in Vercel');
            alert('Payment configuration error. The payment system is not properly configured. Please contact support and mention: ENV_KEY_MISSING');
            return;
        }

        setIsProcessing(true);

        try {
            const popup = new window.PaystackPop();
            popup.newTransaction({
                key: publicKey,
                email: email,
                amount: amount,
                currency: 'NGN',
                ref: reference,
                channels: ['card', 'bank', 'ussd', 'bank_transfer'],
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
                    console.log('✅ Payment successful:', transaction);
                    setIsProcessing(false);
                    if (onSuccess) onSuccess(transaction);
                },
                onCancel: () => {
                    console.log('⚠️ Payment cancelled');
                    setIsProcessing(false);
                    if (onClose) onClose();
                }
            });
            console.log('✅ Paystack popup triggered');
        } catch (error) {
            console.error('❌ Paystack error:', error);
            alert('Failed to open payment popup. Please try again.');
            setIsProcessing(false);
        }
    }, [email, amount, reference, metadata, scriptLoaded, onSuccess, onClose]);

    const formatAmount = (kobo) => {
        const naira = kobo / 100;
        return `₦${naira.toLocaleString('en-NG')}`;
    };

    const isDisabled = disabled || isProcessing || !email || email === 'customer@example.com';

    return (
        <button
            type="button"
            onClick={handlePayment}
            disabled={isDisabled}
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '18px 32px',
                background: isDisabled ? '#9CA3AF' : 'linear-gradient(135deg, #2C5F5D, #1F4A48)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                boxShadow: isDisabled ? 'none' : '0 4px 20px rgba(44,95,93,0.3)',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Lock Icon */}
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>

            <span>
                {isProcessing ? 'Opening Payment...' : (buttonText || `Pay ${formatAmount(amount)} Securely`)}
            </span>

            {!scriptLoaded && (
                <span style={{ fontSize: '12px', opacity: 0.7 }}>(Loading...)</span>
            )}

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
