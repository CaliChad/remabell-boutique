'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOrderById, hasConsultations } from '../../lib/orders';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const reference = searchParams.get('reference');

    useEffect(() => {
        if (!reference) {
            router.push('/');
            return;
        }

        const orderData = getOrderById(reference);
        if (orderData) {
            setOrder(orderData);
        }
        setLoading(false);
    }, [reference, router]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid #E8EDE8', borderTopColor: '#2C5F5D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6B6B6B' }}>Loading order...</p>
                </div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const isConsultation = order && hasConsultations(order);

    return (
        <div style={{ minHeight: '100vh', background: '#FAF8F5', fontFamily: "'Poppins', sans-serif" }}>
            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #F0F0F0', padding: '20px 24px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#2C5F5D,#1F4A48)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 600 }}>R</span>
                        </div>
                        <div>
                            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '18px', fontWeight: 600, color: '#2C2C2C', margin: 0, lineHeight: 1 }}>Remabell</p>
                            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '18px', fontStyle: 'italic', color: '#2C2C2C', margin: 0, lineHeight: 1 }}>Exquisite</p>
                        </div>
                    </a>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 24px' }}>
                {/* Success Animation */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #4CAF50, #45A049)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 10px 40px rgba(76,175,80,0.3)',
                        animation: 'scaleIn 0.5s ease'
                    }}>
                        <svg width="50" height="50" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '36px', fontWeight: 600, color: '#2C2C2C', marginBottom: '12px' }}>
                        Payment Successful!
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6B6B6B', maxWidth: '400px', margin: '0 auto' }}>
                        Thank you for your order. Your payment has been processed successfully.
                    </p>
                </div>

                {/* Order Details Card */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                    {/* Order Number */}
                    <div style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', background: '#F0F7F6', borderRadius: '12px' }}>
                        <p style={{ fontSize: '13px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Order Number</p>
                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#2C5F5D', fontFamily: 'monospace', margin: 0 }}>
                            {order?.orderNumber || reference?.slice(0, 16).toUpperCase()}
                        </p>
                    </div>

                    {/* Confirmation Details */}
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {/* Email Confirmation */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#FAF8F5', borderRadius: '10px' }}>
                            <div style={{ width: '44px', height: '44px', background: '#4CAF5020', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="22" height="22" fill="none" stroke="#4CAF50" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '2px' }}>Email Receipt Sent</p>
                                <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
                                    A confirmation email has been sent to {order?.customer?.email || 'your email address'}
                                </p>
                            </div>
                        </div>

                        {/* Payment Verified */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#FAF8F5', borderRadius: '10px' }}>
                            <div style={{ width: '44px', height: '44px', background: '#2C5F5D20', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="22" height="22" fill="none" stroke="#2C5F5D" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '2px' }}>Payment Verified</p>
                                <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
                                    Your payment of ₦{order?.totalAmount?.toLocaleString('en-NG') || '0'} has been confirmed
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    {order?.items && (
                        <div style={{ marginTop: '24px', padding: '20px', background: '#FAF8F5', borderRadius: '12px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#2C2C2C', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Order Items
                            </p>
                            {order.items.map((item, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: index < order.items.length - 1 ? '1px solid #E8EDE8' : 'none' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: '#2C2C2C', margin: 0 }}>{item.name}</p>
                                        <p style={{ fontSize: '12px', color: '#6B6B6B', margin: 0 }}>Qty: {item.quantity}</p>
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C5F5D', margin: 0 }}>{item.price}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Next Steps */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2C2C2C', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="22" height="22" fill="none" stroke="#C9B98F" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        What's Next?
                    </h2>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {isConsultation ? (
                            <>
                                {/* Consultation Next Steps */}
                                <div style={{ display: 'flex', gap: '16px', padding: '16px', background: '#F0F7F6', borderRadius: '10px', border: '1px solid #2C5F5D30' }}>
                                    <div style={{ width: '36px', height: '36px', background: '#2C5F5D', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>1</div>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '4px' }}>We'll Contact You Within 24 Hours</p>
                                        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
                                            Our skincare expert will reach out to confirm your consultation appointment at your preferred time.
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', padding: '16px', background: '#FAF8F5', borderRadius: '10px' }}>
                                    <div style={{ width: '36px', height: '36px', background: '#C9B98F', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>2</div>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '4px' }}>Prepare for Your Consultation</p>
                                        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
                                            Take photos of your skin in natural lighting and list any concerns you'd like to discuss.
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Physical Product Next Steps */}
                                <div style={{ display: 'flex', gap: '16px', padding: '16px', background: '#F0F7F6', borderRadius: '10px', border: '1px solid #2C5F5D30' }}>
                                    <div style={{ width: '36px', height: '36px', background: '#2C5F5D', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>1</div>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '4px' }}>Order Processing</p>
                                        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
                                            Our team is preparing your order. You'll receive an update when it ships.
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', padding: '16px', background: '#FAF8F5', borderRadius: '10px' }}>
                                    <div style={{ width: '36px', height: '36px', background: '#C9B98F', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>2</div>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '4px' }}>Fast Delivery</p>
                                        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
                                            <strong>Lagos:</strong> Same-day or next-day delivery<br />
                                            <strong>Other States:</strong> 2-3 business days
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Support Section */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '16px' }}>
                        Have questions about your order?
                    </p>
                    <a
                        href={`https://wa.me/2347080803226?text=Hi Remabell, I have a question about my order: ${order?.orderNumber || reference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 28px',
                            background: '#25D366',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                            marginBottom: '16px'
                        }}
                    >
                        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contact Support on WhatsApp
                    </a>
                </div>

                {/* Continue Shopping */}
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <a
                        href="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 32px',
                            background: '#2C5F5D',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(44,95,93,0.3)'
                        }}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Continue Shopping
                    </a>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ background: '#2C2C2C', color: 'white', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    © 2026 Remabell Exquisite. All rights reserved.
                </p>
            </footer>

            <style jsx>{`
                @keyframes scaleIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#6B6B6B' }}>Loading...</p>
                </div>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
