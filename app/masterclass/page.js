'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateReference, validateEmail } from '../../lib/paystack';

const MASTERCLASS_PRICE_KOBO = 8500000; // ₦85,000

export default function MasterclassPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
    const [reference, setReference] = useState('');
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showStickyFooter, setShowStickyFooter] = useState(false);

    // Generate reference on mount
    useEffect(() => {
        setReference(generateReference());
    }, []);

    // Load Paystack script
    useEffect(() => {
        if (window.PaystackPop) {
            setScriptLoaded(true);
            return;
        }

        const existingScript = document.querySelector('script[src*="paystack.co"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => setScriptLoaded(true));
            if (window.PaystackPop) setScriptLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v2/inline.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.head.appendChild(script);
    }, []);

    // Handle scroll for sticky footer
    useEffect(() => {
        const handleScroll = () => {
            setShowStickyFooter(window.scrollY > 600);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePayment = useCallback(() => {
        if (!email.trim()) {
            setEmailError('Please enter your email address');
            return;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        setEmailError('');

        if (!scriptLoaded || !window.PaystackPop) {
            alert('Payment system is loading. Please wait a moment and try again.');
            return;
        }

        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        if (!publicKey) {
            alert('Payment configuration error. Please contact support.');
            return;
        }

        setIsProcessing(true);

        try {
            const popup = new window.PaystackPop();
            popup.newTransaction({
                key: publicKey,
                email: email,
                amount: MASTERCLASS_PRICE_KOBO,
                currency: 'NGN',
                ref: reference,
                channels: ['card', 'bank', 'ussd', 'bank_transfer'],
                metadata: {
                    custom_fields: [
                        { display_name: "Product Type", variable_name: "product_type", value: "masterclass" },
                        { display_name: "Class Dates", variable_name: "class_dates", value: "Feb 26-28, 2026" },
                        { display_name: "Student Email", variable_name: "student_email", value: email },
                        { display_name: "Store", variable_name: "store", value: "Remabell Exquisite" }
                    ]
                },
                onSuccess: (transaction) => {
                    setIsProcessing(false);
                    // Snapchat Pixel: PURCHASE event for masterclass
                    window.snaptr?.('track', 'PURCHASE', {
                        price: 85000,
                        currency: 'NGN',
                        transaction_id: transaction.reference,
                        item_category: 'masterclass'
                    });
                    router.push(`/masterclass/success?reference=${transaction.reference}&email=${encodeURIComponent(email)}`);
                },
                onCancel: () => {
                    setIsProcessing(false);
                }
            });
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to open payment popup. Please try again.');
            setIsProcessing(false);
        }
    }, [email, reference, scriptLoaded, router]);

    const handleWaitlistSubmit = (e) => {
        e.preventDefault();
        if (validateEmail(waitlistEmail)) {
            setWaitlistSubmitted(true);
        }
    };

    // Module data
    const modules = [
        { icon: '🎯', title: 'Expert Product Recommendations', description: 'Learn which products work for specific skin concerns and how to recommend with confidence' },
        { icon: '🔍', title: 'Advanced Product Identification', description: 'Master the art of identifying authentic products and understanding ingredient formulations' },
        { icon: '💡', title: 'Problem-Solving Mastery', description: 'Tackle common skin issues with proven solutions and build customized skincare routines' },
        { icon: '🎁', title: 'Bonus: ₦500K Giveaway', description: 'Exclusive opportunity to win products and cash prizes - available only to masterclass students' }
    ];

    const benefits = [
        { icon: '📱', title: 'Lifetime Telegram Access', description: 'Join our private community of skincare enthusiasts and get ongoing support' },
        { icon: '📄', title: 'Digital Certificate', description: 'Receive official certification upon completion to boost your credibility' },
        { icon: '🎥', title: 'Recorded Sessions', description: "Can't attend live? Get lifetime access to all recorded sessions" }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#FAF8F5', fontFamily: "'Inter', sans-serif" }}>
            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            {/* SEO Meta */}
            <title>Skincare Masterclass - Remabell Exquisite | Feb 26-28, 2026</title>
            <meta name="description" content="Learn professional skincare from Lagos' most trusted expert. 3-day intensive masterclass covering product selection, skin analysis, and business growth. Limited seats!" />

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(180deg, #FAF8F5 0%, #F5F1EA 100%)',
                position: 'relative',
                overflow: 'hidden',
                padding: '60px 24px 80px',
                textAlign: 'center'
            }}>
                {/* Subtle floral pattern overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.05,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }} />

                <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
                    {/* Logo */}
                    <img
                        src="/masterclass-logo.jpg"
                        alt="Remabell's Skincare Master Class"
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            height: 'auto',
                            margin: '0 auto 32px',
                            borderRadius: '16px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                        }}
                    />

                    {/* Headline */}
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(32px, 6vw, 48px)',
                        fontWeight: 600,
                        color: '#7C2D12',
                        marginBottom: '16px',
                        lineHeight: 1.2
                    }}>
                        Remabell's Skincare Master Class
                    </h1>

                    {/* Subheadline */}
                    <p style={{
                        fontSize: 'clamp(18px, 4vw, 24px)',
                        color: '#78716C',
                        marginBottom: '40px',
                        fontWeight: 400
                    }}>
                        Unlock the Secrets to Flawless, Radiant Skin
                    </p>

                    {/* Email Input */}
                    <div style={{ maxWidth: '400px', margin: '0 auto 16px' }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                            placeholder="Enter your email to register"
                            style={{
                                width: '100%',
                                padding: '16px 20px',
                                border: emailError ? '2px solid #EF4444' : '2px solid #E8EDE8',
                                borderRadius: '12px',
                                fontSize: '16px',
                                outline: 'none',
                                marginBottom: '8px'
                            }}
                        />
                        {emailError && <p style={{ color: '#EF4444', fontSize: '13px', textAlign: 'left', margin: '0 0 8px' }}>{emailError}</p>}
                    </div>

                    {/* Primary CTA */}
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            minWidth: '280px',
                            padding: '18px 40px',
                            background: isProcessing ? '#9CA3AF' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '18px',
                            fontWeight: 600,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            boxShadow: '0 8px 30px rgba(5, 150, 105, 0.3)',
                            transition: 'all 0.3s ease',
                            transform: isProcessing ? 'none' : 'translateY(0)'
                        }}
                        onMouseOver={(e) => !isProcessing && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 12px 40px rgba(5, 150, 105, 0.4)')}
                        onMouseOut={(e) => !isProcessing && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 8px 30px rgba(5, 150, 105, 0.3)')}
                    >
                        {isProcessing ? 'Opening Payment...' : 'Secure Your Spot - ₦85,000'}
                    </button>

                    {/* Date info */}
                    <p style={{
                        marginTop: '16px',
                        fontSize: '14px',
                        color: '#78716C',
                        fontStyle: 'italic'
                    }}>
                        February 26-28, 2026 | Limited Seats Available
                    </p>
                </div>
            </section>

            {/* Description Section */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    background: 'white',
                    borderRadius: '16px',
                    padding: 'clamp(32px, 6vw, 48px)',
                    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
                }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(28px, 5vw, 36px)',
                        fontWeight: 600,
                        color: '#7C2D12',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span>✨</span> Why This Class Changes Everything
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        lineHeight: 1.8,
                        color: '#44403C'
                    }}>
                        I'm opening up my vault! After years of perfecting the Remabell Glow, I'm teaching you everything I know about achieving and maintaining flawless skin. Whether you want to fix your own skin or help others, this class provides the knowledge, confidence, and community you need to succeed.
                    </p>
                </div>
            </section>

            {/* What You'll Learn Section */}
            <section style={{
                background: '#F0FDF4',
                padding: '80px 24px'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(28px, 5vw, 36px)',
                        fontWeight: 600,
                        color: '#7C2D12',
                        textAlign: 'center',
                        marginBottom: '48px'
                    }}>
                        What You'll Master in 3 Days
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '24px'
                    }}>
                        {modules.map((module, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '32px',
                                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{module.icon}</div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#2C2C2C', marginBottom: '12px' }}>
                                    {module.title}
                                </h3>
                                <p style={{ fontSize: '15px', color: '#6B6B6B', lineHeight: 1.6 }}>
                                    {module.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bonus Features Section */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(28px, 5vw, 36px)',
                        fontWeight: 600,
                        color: '#7C2D12',
                        textAlign: 'center',
                        marginBottom: '48px'
                    }}>
                        Exclusive Masterclass Benefits
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '24px'
                    }}>
                        {benefits.map((benefit, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '24px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{benefit.icon}</div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#2C2C2C', marginBottom: '8px' }}>
                                    {benefit.title}
                                </h3>
                                <p style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: 1.6 }}>
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coming Soon Section */}
            <section style={{
                background: 'linear-gradient(180deg, #FAF8F5 0%, #FDF2F8 100%)',
                padding: '80px 24px'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(28px, 5vw, 36px)',
                        fontWeight: 600,
                        color: '#7C2D12',
                        marginBottom: '16px'
                    }}>
                        More Classes Coming Soon
                    </h2>
                    <p style={{ fontSize: '16px', color: '#6B6B6B', marginBottom: '32px', lineHeight: 1.6 }}>
                        This is just the beginning! Join our waitlist for upcoming advanced modules on anti-aging, acne treatment, and business scaling.
                    </p>

                    {waitlistSubmitted ? (
                        <div style={{ padding: '20px', background: '#D1FAE5', borderRadius: '12px', color: '#065F46' }}>
                            ✅ You're on the waitlist! We'll notify you about future classes.
                        </div>
                    ) : (
                        <form onSubmit={handleWaitlistSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <input
                                type="email"
                                value={waitlistEmail}
                                onChange={(e) => setWaitlistEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                style={{
                                    flex: '1 1 250px',
                                    padding: '14px 20px',
                                    border: '2px solid #E8EDE8',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    padding: '14px 28px',
                                    background: 'transparent',
                                    color: '#059669',
                                    border: '2px solid #059669',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => { e.target.style.background = '#059669'; e.target.style.color = 'white'; }}
                                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#059669'; }}
                            >
                                Join Waitlist
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* Pricing CTA Section */}
            <section style={{
                background: '#065F46',
                color: 'white',
                padding: '80px 24px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <p style={{ fontSize: '56px', fontWeight: 700, marginBottom: '16px' }}>₦85,000</p>
                    <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '40px' }}>
                        One-time payment | Full 3-day access | Certificate included
                    </p>

                    {/* Payment Icons */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ background: 'white', borderRadius: '8px', padding: '8px 16px' }}>
                            <span style={{ fontWeight: 700, color: '#1A1F71', fontSize: '14px' }}>VISA</span>
                        </div>
                        <div style={{ background: 'white', borderRadius: '8px', padding: '8px 16px', display: 'flex', gap: '2px' }}>
                            <div style={{ width: '18px', height: '18px', background: '#EB001B', borderRadius: '50%' }} />
                            <div style={{ width: '18px', height: '18px', background: '#F79E1B', borderRadius: '50%', marginLeft: '-8px' }} />
                        </div>
                        <div style={{ background: 'white', borderRadius: '8px', padding: '8px 16px' }}>
                            <span style={{ fontWeight: 700, color: '#00425F', fontSize: '14px' }}>VERVE</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '18px 48px',
                            background: 'white',
                            color: '#065F46',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '18px',
                            fontWeight: 600,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => !isProcessing && (e.target.style.transform = 'scale(1.02)')}
                        onMouseOut={(e) => !isProcessing && (e.target.style.transform = 'scale(1)')}
                    >
                        {isProcessing ? 'Opening Payment...' : 'Register Now - Pay Securely'}
                    </button>

                    {/* Trust Badges */}
                    <div style={{ marginTop: '24px', fontSize: '13px', opacity: 0.8, display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <span>🔒 SSL Secured</span>
                        <span>✅ 100% Verified</span>
                        <span>💳 Instant Confirmation</span>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section style={{ padding: '80px 24px', background: '#FAF8F5' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(28px, 5vw, 36px)',
                        fontWeight: 600,
                        color: '#7C2D12',
                        marginBottom: '40px'
                    }}>
                        Why Trust Remabell?
                    </h2>

                    {/* Stats */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '32px',
                        marginBottom: '48px'
                    }}>
                        {[
                            { number: '14.3K', label: 'Instagram Followers' },
                            { number: '80K', label: 'TikTok Community' },
                            { number: '1000+', label: 'Happy Clients' },
                            { number: '100%', label: 'Authentic Products' }
                        ].map((stat, i) => (
                            <div key={i} style={{ minWidth: '150px' }}>
                                <p style={{ fontSize: '32px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>{stat.number}</p>
                                <p style={{ fontSize: '14px', color: '#6B6B6B' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        <p style={{ fontSize: '18px', fontStyle: 'italic', color: '#44403C', marginBottom: '16px', lineHeight: 1.7 }}>
                            "Remabell completely transformed my skincare routine. Her product recommendations are always spot-on, and my skin has never looked better!"
                        </p>
                        <p style={{ fontWeight: 600, color: '#7C2D12' }}>— Satisfied Customer</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#2C2C2C', color: 'white', padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ opacity: 0.8, marginBottom: '16px' }}>© 2026 Remabell Exquisite. All rights reserved.</p>
                <a href="/" style={{ color: '#059669', textDecoration: 'none' }}>← Back to Store</a>
            </footer>

            {/* Sticky Mobile Footer */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'white',
                padding: '16px 24px',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                display: showStickyFooter ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                zIndex: 100
            }}>
                <div>
                    <p style={{ fontWeight: 700, fontSize: '20px', color: '#059669', margin: 0 }}>₦85,000</p>
                    <p style={{ fontSize: '12px', color: '#6B6B6B', margin: 0 }}>Feb 26-28, 2026</p>
                </div>
                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    style={{
                        padding: '14px 28px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        minHeight: '48px'
                    }}
                >
                    {isProcessing ? 'Processing...' : 'Register'}
                </button>
            </div>

            {/* Animation styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
