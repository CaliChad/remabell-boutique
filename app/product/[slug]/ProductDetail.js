'use client';

import { useState, useEffect } from 'react';
import { addToCart, getCartCount, generateProductWhatsAppLink } from '../../../lib/cart';
import { isDiscountActive, getDiscountedPrice, DISCOUNT_AMOUNT } from '../../../lib/discount';
import { productSlug, slugify } from '../../../lib/products';

const priceToNumber = (price) => parseInt(String(price).replace(/[₦,\s]/g, ''), 10) || 0;

export default function ProductDetail({ product, related }) {
    const [cartCount, setCartCount] = useState(0);
    const [added, setAdded] = useState(false);
    const discountActive = isDiscountActive();
    const categoryLink = `/?category=${slugify(product.category)}`;

    useEffect(() => { setCartCount(getCartCount()); }, []);

    // Tell TikTok and Snapchat which product was viewed, so ads can be measured
    useEffect(() => {
        const value = priceToNumber(product.price);
        if (typeof window === 'undefined') return;
        window.ttq?.track?.('ViewContent', {
            content_type: 'product',
            content_id: String(product.id),
            content_name: product.name,
            value,
            currency: 'NGN'
        });
        window.snaptr?.('track', 'VIEW_CONTENT', {
            item_ids: [String(product.id)],
            price: value,
            currency: 'NGN'
        });
    }, [product]);

    const handleAdd = () => {
        addToCart(product, 1);
        setCartCount(getCartCount());
        setAdded(true);
        const value = priceToNumber(product.price);
        window.ttq?.track?.('AddToCart', {
            content_type: 'product',
            content_id: String(product.id),
            content_name: product.name,
            value,
            currency: 'NGN'
        });
        window.snaptr?.('track', 'ADD_CART', {
            item_ids: [String(product.id)],
            price: value,
            currency: 'NGN',
            number_items: 1
        });
    };

    const whatsappLink = generateProductWhatsAppLink(product);

    return (
        <div style={{ minHeight: '100vh', background: '#FAF8F5', fontFamily: "'Poppins', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            {/* Header */}
            <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(201,185,143,0.2)' }}>
                <nav style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
                    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#2C5F5D,#1F4A48)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 600 }}>R</span>
                        </div>
                        <div>
                            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 600, color: '#2C2C2C', margin: 0, lineHeight: 1 }}>Remabell</p>
                            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontStyle: 'italic', color: '#2C2C2C', margin: 0, lineHeight: 1 }}>Exquisite</p>
                        </div>
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <a href="/checkout" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(44,95,93,0.1)', border: '2px solid #2C5F5D', borderRadius: '12px', color: '#2C5F5D', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                            <svg width="20" height="20" fill="none" stroke="#2C5F5D" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Cart ({cartCount})
                        </a>
                        <a href="https://wa.me/2347080803226" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(37,211,102,0.1)', border: '2px solid #25D366', borderRadius: '12px', color: '#2C2C2C', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                            <svg width="18" height="18" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            <span className="hidden sm:inline">Contact Us</span>
                        </a>
                    </div>
                </nav>
            </header>

            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 64px' }}>
                {/* Breadcrumb */}
                <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#6B6B6B', marginBottom: '20px' }}>
                    <a href="/" style={{ color: '#2C5F5D', textDecoration: 'none' }}>Home</a>
                    <span>/</span>
                    <a href={categoryLink} style={{ color: '#2C5F5D', textDecoration: 'none' }}>{product.category}</a>
                </nav>

                {/* Product */}
                <div className="product-layout" style={{ display: 'grid', gap: '32px', alignItems: 'start' }}>
                    <div style={{ position: 'relative', background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                        <img src={product.image} alt={product.name} style={{ display: 'block', width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ background: 'linear-gradient(135deg,#C9B98F,#D4AF37)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '5px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ Original</div>
                            {discountActive && (
                                <div style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '5px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Save ₦{DISCOUNT_AMOUNT.toLocaleString()}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <a href={categoryLink} style={{ fontSize: '12px', color: '#C9B98F', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>{product.category}</a>
                        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,5vw,38px)', fontWeight: 600, color: '#2C2C2C', margin: '8px 0 16px', lineHeight: 1.15 }}>{product.name}</h1>

                        {discountActive ? (
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through', margin: '0 0 4px' }}>{product.price}</p>
                                <p style={{ fontSize: '30px', fontWeight: 700, color: '#16A34A', margin: 0 }}>{getDiscountedPrice(product.price)}</p>
                                <p style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, margin: '4px 0 0' }}>🔥 You save ₦{DISCOUNT_AMOUNT.toLocaleString()}!</p>
                            </div>
                        ) : (
                            <p style={{ fontSize: '30px', fontWeight: 700, color: '#2C5F5D', margin: '0 0 20px' }}>{product.price}</p>
                        )}

                        {product.description && product.description !== product.name && (
                            <p style={{ color: '#4A4A4A', lineHeight: 1.6, margin: '0 0 16px' }}>{product.description}</p>
                        )}
                        {product.benefits && (
                            <div style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#2C2C2C', fontSize: '14px' }}>Benefits:</strong>
                                <p style={{ color: '#4A4A4A', margin: '4px 0 0' }}>{product.benefits}</p>
                            </div>
                        )}
                        {product.skinType && (
                            <div style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#2C2C2C', fontSize: '14px' }}>Skin type:</strong>
                                <p style={{ color: '#4A4A4A', margin: '4px 0 0' }}>{product.skinType}</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '24px 0 16px' }}>
                            <button onClick={handleAdd} className="btn-luxury" style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2C5F5D, #1F4A48)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(44,95,93,0.25)' }}>
                                {added ? 'Added to cart ✓' : 'Add to Cart'}
                            </button>
                            {added && (
                                <a href="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: 'white', border: '2px solid #2C5F5D', color: '#2C5F5D', borderRadius: '12px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                                    Go to checkout
                                </a>
                            )}
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', background: '#25D366', color: 'white', borderRadius: '12px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
                                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                Order on WhatsApp
                            </a>
                        </div>

                        <div style={{ padding: '14px 16px', background: 'white', border: '1px solid #F5EFE0', borderLeft: '3px solid #D4AF37', borderRadius: '8px', fontSize: '13px', color: '#6B6B6B', lineHeight: 1.5 }}>
                            100% verified and authentic. Pay securely by card, bank transfer or USSD, or order on WhatsApp. Delivery across Lagos, Nigeria and worldwide.
                        </div>
                    </div>
                </div>

                {/* More from the same category */}
                {related.length > 0 && (
                    <section style={{ marginTop: '56px' }}>
                        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: 600, color: '#2C2C2C', margin: '0 0 6px' }}>More {product.category}</h2>
                        <a href={categoryLink} style={{ fontSize: '13px', color: '#2C5F5D', fontWeight: 600, textDecoration: 'none' }}>See all {product.category} →</a>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '16px', marginTop: '20px' }}>
                            {related.map(item => (
                                <a key={item.id} href={`/product/${productSlug(item)}`} className="card-lift" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #F0F0F0', textDecoration: 'none', display: 'block' }}>
                                    <img src={item.image} alt={item.name} loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
                                    <div style={{ padding: '12px' }}>
                                        <p style={{ fontSize: '13px', color: '#2C2C2C', margin: '0 0 6px', lineHeight: 1.3 }}>{item.name}</p>
                                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#2C5F5D', margin: 0 }}>{discountActive ? getDiscountedPrice(item.price) : item.price}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                <p style={{ marginTop: '40px' }}>
                    <a href="/#products" style={{ color: '#2C5F5D', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>← Back to all products</a>
                </p>
            </main>
        </div>
    );
}
