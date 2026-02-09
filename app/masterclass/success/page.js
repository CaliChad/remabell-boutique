'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');
    const email = searchParams.get('email');
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            {/* Confetti Animation */}
            {showConfetti && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    pointerEvents: 'none',
                    fontSize: '40px',
                    animation: 'confettiFall 3s ease-out forwards'
                }}>
                    🎉✨🎊🌟💫🎉✨🎊🌟💫🎉✨🎊
                </div>
            )}

            {/* Success Icon */}
            <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '40px auto 32px',
                boxShadow: '0 20px 60px rgba(5, 150, 105, 0.3)',
                animation: 'scaleIn 0.5s ease-out'
            }}>
                <svg width="50" height="50" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            {/* Welcome Message */}
            <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(28px, 6vw, 40px)',
                fontWeight: 600,
                color: '#7C2D12',
                marginBottom: '16px'
            }}>
                Welcome to the Masterclass! 🎉
            </h1>

            <p style={{ fontSize: '18px', color: '#44403C', marginBottom: '40px' }}>
                You're officially registered for Remabell's Skincare Master Class!
            </p>

            {/* Info Card */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
                textAlign: 'left',
                marginBottom: '32px'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#059669', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📋</span> What's Next?
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: '#F0FDF4',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <span style={{ color: '#059669', fontWeight: 700 }}>1</span>
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, color: '#2C2C2C', marginBottom: '4px' }}>Check Your Email</p>
                            <p style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: 1.5 }}>
                                We've sent a confirmation email to <strong>{email || 'your email'}</strong> with all the details.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: '#F0FDF4',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <span style={{ color: '#059669', fontWeight: 700 }}>2</span>
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, color: '#2C2C2C', marginBottom: '4px' }}>Telegram Group Link</p>
                            <p style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: 1.5 }}>
                                You'll receive the private Telegram group link via email within 24 hours.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: '#F0FDF4',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <span style={{ color: '#059669', fontWeight: 700 }}>3</span>
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, color: '#2C2C2C', marginBottom: '4px' }}>Class Starts Feb 26</p>
                            <p style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: 1.5 }}>
                                You'll get joining instructions 24 hours before the class starts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Class Schedule */}
            <div style={{
                background: '#065F46',
                color: 'white',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px'
            }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', opacity: 0.9 }}>📅 Class Schedule</h3>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>February 26-28, 2026</p>
            </div>

            {/* Reference */}
            {reference && (
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>
                    Your reference: <code style={{ background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px' }}>{reference}</code>
                </p>
            )}

            {/* Back to Store */}
            <a
                href="/"
                style={{
                    display: 'inline-block',
                    padding: '14px 32px',
                    background: 'transparent',
                    color: '#059669',
                    border: '2px solid #059669',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                }}
            >
                ← Back to Store
            </a>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '80px 24px' }}>
            <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #E5E7EB',
                borderTopColor: '#059669',
                borderRadius: '50%',
                margin: '0 auto 24px',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#6B6B6B', fontSize: '16px' }}>Loading your confirmation...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function MasterclassSuccessPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #F0FDF4 0%, #FAF8F5 100%)',
            fontFamily: "'Inter', sans-serif",
            padding: '40px 24px'
        }}>
            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            <Suspense fallback={<LoadingFallback />}>
                <SuccessContent />
            </Suspense>

            {/* Animations */}
            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes confettiFall {
                    from { transform: translateY(-100%); opacity: 1; }
                    to { transform: translateY(100vh); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
