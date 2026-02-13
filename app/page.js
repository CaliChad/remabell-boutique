'use client';
import { useState, useEffect } from 'react';
import { products, categories } from '../lib/products';
import { getCart, addToCart, removeFromCart, updateQuantity, getCartCount, generateCartWhatsAppLink, generateProductWhatsAppLink } from '../lib/cart';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [brandIndex, setBrandIndex] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(24);
  const [sortBy, setSortBy] = useState('featured');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [consultationModal, setConsultationModal] = useState(null);
  const [consultationEmail, setConsultationEmail] = useState('');
  const [consultationEmailError, setConsultationEmailError] = useState('');
  const brands = ['The Ordinary', 'CeraVe', 'Neutrogena', 'La Roche-Posay', 'Clean & Clear'];
  const PRODUCTS_PER_LOAD = 24;

  useEffect(() => { setCart(getCart()); setCartCount(getCartCount()); }, []);
  useEffect(() => { const i = setInterval(() => setBrandIndex(p => (p + 1) % brands.length), 2500); return () => clearInterval(i); }, []);
  useEffect(() => { setDisplayedCount(24); }, [selectedCategory, searchQuery]);
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load Paystack inline script
  useEffect(() => {
    if (typeof window !== 'undefined' && window.PaystackPop) { setPaystackReady(true); return; }
    const existing = document.querySelector('script[src*="paystack.co"]');
    if (existing) {
      existing.addEventListener('load', () => setPaystackReady(true));
      if (window.PaystackPop) setPaystackReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = () => setPaystackReady(true);
    document.head.appendChild(script);
  }, []);

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'All Products' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    const priceA = parseInt(a.price.replace(/[₦,]/g, ''));
    const priceB = parseInt(b.price.replace(/[₦,]/g, ''));
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'brand') return a.brand.localeCompare(b.brand);
    return 0;
  });

  const displayedProducts = filtered.slice(0, displayedCount);
  const hasMoreProducts = displayedCount < filtered.length;
  const remainingProducts = filtered.length - displayedCount;

  const handleLoadMore = () => {
    setDisplayedCount(prev => Math.min(prev + PRODUCTS_PER_LOAD, filtered.length));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = (p) => {
    addToCart(p, 1);
    setCart(getCart());
    setCartCount(getCartCount());
    // TikTok Pixel: AddToCart event
    if (typeof window !== 'undefined' && window.ttq) {
      const priceNum = parseInt(p.price.replace(/[₦,]/g, '')) || 0;
      window.ttq.track('AddToCart', {
        content_type: 'product',
        content_id: String(p.id),
        content_name: p.name,
        value: priceNum,
        currency: 'NGN'
      });
    }
  };
  const handleRemove = (id) => { removeFromCart(id); setCart(getCart()); setCartCount(getCartCount()); };
  const handleQty = (id, q) => { updateQuantity(id, q); setCart(getCart()); setCartCount(getCartCount()); };

  const openConsultationModal = (type) => {
    setConsultationEmail('');
    setConsultationEmailError('');
    setConsultationModal(type);
  };

  const processConsultationPayment = () => {
    if (!consultationEmail.trim()) { setConsultationEmailError('Please enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(consultationEmail)) { setConsultationEmailError('Please enter a valid email address'); return; }
    if (!paystackReady || !window.PaystackPop) { alert('Payment system is loading. Please wait a moment and try again.'); return; }

    const isVideo = consultationModal === 'video';
    const amount = isVideo ? 3500000 : 2000000;
    const price = isVideo ? 35000 : 20000;
    const serviceName = isVideo ? 'FaceTime Video Consultation' : 'Expert Skincare Consultation';
    const ref = (isVideo ? 'VIDEOCONSULT_' : 'CONSULT_') + Date.now();

    setConsultationModal(null);

    try {
      const popup = new window.PaystackPop();
      popup.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: consultationEmail,
        amount,
        currency: 'NGN',
        ref,
        channels: ['card', 'bank', 'ussd', 'bank_transfer'],
        metadata: {
          product_type: 'consultation',
          service_name: serviceName,
          price,
          custom_fields: [
            { display_name: 'Product Type', variable_name: 'product_type', value: 'consultation' },
            { display_name: 'Service', variable_name: 'service_name', value: serviceName },
            { display_name: 'Customer Email', variable_name: 'customer_email', value: consultationEmail }
          ]
        },
        onSuccess: (transaction) => {
          alert(`Payment successful! We will contact you within 24 hours to schedule your ${isVideo ? 'FaceTime video ' : ''}consultation.`);
          if (window.ttq) {
            window.ttq.track('CompletePayment', { value: price, currency: 'NGN', content_type: 'consultation' });
          }
        },
        onCancel: () => { console.log('Payment cancelled'); }
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to open payment popup. Please try again.');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5', fontFamily: "'Poppins', sans-serif" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(201,185,143,0.2)' }}>
        <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg,#2C5F5D,#1F4A48)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(44,95,93,0.2)' }}>
              <span style={{ color: 'white', fontFamily: "'Cormorant Garamond',serif", fontSize: '24px', fontWeight: 600 }}>R</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 600, color: '#2C2C2C', margin: 0, lineHeight: 1 }}>Remabell</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontStyle: 'italic', color: '#2C2C2C', margin: 0, lineHeight: 1 }}>Exquisite</p>
            </div>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setIsCartOpen(true)} style={{ position: 'relative', padding: '12px', background: 'rgba(44,95,93,0.1)', border: '2px solid #2C5F5D', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s' }}>
              <svg width="24" height="24" fill="none" stroke="#2C5F5D" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cartCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'linear-gradient(135deg,#C9B98F,#D4AF37)', color: 'white', fontSize: '11px', fontWeight: 700, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
            </button>
            <a href="https://wa.me/2347080803226" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(37,211,102,0.1)', border: '2px solid #25D366', borderRadius: '12px', color: '#2C2C2C', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'all 0.3s' }}>
              <svg width="20" height="20" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <span className="hidden sm:inline">Contact Us</span>
            </a>
          </div>
        </nav>
      </header>

      {/* Cart Panel */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setIsCartOpen(false)} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: '420px', background: '#FAF8F5', boxShadow: '-10px 0 40px rgba(0,0,0,0.15)', overflowY: 'auto', animation: 'slideIn 0.3s ease' }}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '28px', fontWeight: 600, color: '#2C2C2C', margin: 0 }}>Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><svg width="24" height="24" fill="none" stroke="#6B6B6B" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <svg width="64" height="64" fill="none" stroke="#C9B98F" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <p style={{ color: '#6B6B6B', fontSize: '16px' }}>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    {cart.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '11px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>{item.brand}</p>
                          <p style={{ fontSize: '14px', fontWeight: 500, color: '#2C2C2C', margin: '0 0 8px' }}>{item.name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button onClick={() => handleQty(item.id, item.quantity - 1)} style={{ width: '28px', height: '28px', border: '1px solid #2C5F5D', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#2C5F5D', fontWeight: 600 }}>-</button>
                            <span style={{ fontWeight: 600, color: '#2C2C2C' }}>{item.quantity}</span>
                            <button onClick={() => handleQty(item.id, item.quantity + 1)} style={{ width: '28px', height: '28px', border: '1px solid #2C5F5D', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#2C5F5D', fontWeight: 600 }}>+</button>
                            <button onClick={() => handleRemove(item.id)} style={{ marginLeft: 'auto', color: '#888', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Secure Pre-Payment Notice */}
                  <div style={{ padding: '14px 16px', background: '#FAF8F5', border: '1px solid #F5EFE0', borderLeft: '3px solid #D4AF37', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <svg width="18" height="18" fill="none" stroke="#D4AF37" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#2C2C2C', margin: '0 0 4px 0' }}>Secure Online Payment</p>
                        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>Pay securely with card, bank transfer, or USSD. 100% safe and encrypted.</p>
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Secure Checkout Button */}
                  <a href="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2C5F5D, #1F4A48)', color: 'white', borderRadius: '12px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(44,95,93,0.3)', marginBottom: '12px' }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Proceed to Secure Checkout
                  </a>

                  {/* Payment Icons */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ padding: '4px 10px', background: 'white', borderRadius: '6px', border: '1px solid #E8EDE8' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1A1F71' }}>VISA</span>
                    </div>
                    <div style={{ padding: '4px 10px', background: 'white', borderRadius: '6px', border: '1px solid #E8EDE8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <div style={{ width: '10px', height: '10px', background: '#EB001B', borderRadius: '50%' }} />
                      <div style={{ width: '10px', height: '10px', background: '#F79E1B', borderRadius: '50%', marginLeft: '-3px' }} />
                    </div>
                    <div style={{ padding: '4px 10px', background: 'white', borderRadius: '6px', border: '1px solid #E8EDE8' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#00425F' }}>VERVE</span>
                    </div>
                  </div>

                  {/* Alternative: WhatsApp Order */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '8px' }}>Or order via WhatsApp:</p>
                    <a href={generateCartWhatsAppLink(cart)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', background: '#25D36620', border: '1px solid #25D366', color: '#25D366', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      WhatsApp Order
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedProduct(null)} />
          <div style={{ position: 'relative', background: 'white', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', background: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" fill="none" stroke="#2C2C2C" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', padding: '24px' }} className="md:grid-cols-2">
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', borderRadius: '12px' }} />
              <div>
                <p style={{ fontSize: '12px', color: '#C9B98F', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 8px' }}>{selectedProduct.brand}</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '28px', fontWeight: 600, color: '#2C2C2C', margin: '0 0 16px' }}>{selectedProduct.name}</h2>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#2C5F5D', margin: '0 0 16px' }}>{selectedProduct.price}</p>
                <p style={{ color: '#6B6B6B', marginBottom: '16px', lineHeight: 1.6 }}>{selectedProduct.description}</p>
                <div style={{ marginBottom: '16px' }}><strong style={{ color: '#2C2C2C' }}>Benefits:</strong><p style={{ color: '#6B6B6B', margin: '4px 0 0' }}>{selectedProduct.benefits}</p></div>
                <div style={{ marginBottom: '24px' }}><strong style={{ color: '#2C2C2C' }}>Skin Type:</strong><p style={{ color: '#6B6B6B', margin: '4px 0 0' }}>{selectedProduct.skinType}</p></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button onClick={() => { handleAdd(selectedProduct); setSelectedProduct(null); }} style={{ width: '100%', padding: '14px', background: '#2C5F5D', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Add to Cart</button>
                  <a href={generateProductWhatsAppLink(selectedProduct)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: '#25D366', color: 'white', borderRadius: '12px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    Order Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(180deg,#FAF8F5 0%,#E8EDE8 100%)', padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ fontSize: '12px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Lagos Premier Skincare Destination</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,6vw,56px)', fontWeight: 600, color: '#2C2C2C', lineHeight: 1.1, marginBottom: '16px' }}>100% Verified & Authentic<br /><span style={{ fontStyle: 'italic' }}>Skincare Excellence</span></h1>
            <p style={{ fontSize: '16px', color: '#C9B98F', marginBottom: '24px', transition: 'opacity 0.5s' }}>Featuring: <strong>{brands[brandIndex]}</strong></p>

            {/* Search */}
            <div style={{ maxWidth: '560px', margin: '0 auto 24px', position: 'relative' }}>
              <input type="text" placeholder="Search products, brands..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '16px 24px 16px 56px', fontSize: '15px', border: '2px solid transparent', borderRadius: '12px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', outline: 'none' }} />
              <svg style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" fill="none" stroke="#C9B98F" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
              {['Cleansers', 'Serums', 'Moisturizers', 'Sunscreen', 'Body Care'].map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat.endsWith('s') ? cat.slice(0, -1) : cat)} style={{ padding: '10px 20px', background: '#E8EDE8', border: 'none', borderRadius: '24px', color: '#2C2C2C', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s' }}>
                  {cat}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '14px', color: '#88A094', marginBottom: '32px' }}>✓ Trusted by 5,000+ Customers Across Lagos & Nigeria</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              <a href="#products" style={{ padding: '16px 32px', background: '#2C5F5D', color: 'white', borderRadius: '12px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(44,95,93,0.3)' }}>Browse Collection</a>
              <a href="https://wa.me/2347080803226" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', background: 'rgba(37,211,102,0.1)', border: '2px solid #25D366', color: '#2C2C2C', borderRadius: '12px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                <svg width="20" height="20" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Order on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" style={{ padding: '64px 24px', background: '#FAF8F5' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', color: '#C9B98F', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>The Collection</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '36px', fontWeight: 600, color: '#2C2C2C' }}>Premium <span style={{ fontStyle: 'italic' }}>Originals</span></h2>
              <p style={{ fontSize: '14px', color: '#6B6B6B', marginTop: '8px' }}>{filtered.length} products available</p>
            </div>

            {/* Filters & Sort */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '10px 20px', background: selectedCategory === cat ? '#2C5F5D' : 'white', color: selectedCategory === cat ? 'white' : '#2C5F5D', border: '2px solid #2C5F5D', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}>
                    {cat}
                  </button>
                ))}
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '10px 16px', background: 'white', border: '2px solid #C9B98F', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#2C2C2C', cursor: 'pointer', outline: 'none' }}>
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="brand">Brand: A-Z</option>
              </select>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '24px' }}>
              {displayedProducts.map((product, index) => (
                <div key={product.id} className="card-lift product-card" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', animation: index >= displayedCount - PRODUCTS_PER_LOAD && displayedCount > PRODUCTS_PER_LOAD ? 'productFadeIn 0.5s ease forwards' : 'none' }}>
                  <div className="group" style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: '#F8F6F3' }}>
                    <img src={product.image} alt={product.name} loading="lazy" className="img-zoom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'linear-gradient(135deg,#C9B98F,#D4AF37)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ Original</div>
                    <button onClick={() => setSelectedProduct(product)} style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', background: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }} className="group-hover:opacity-100">
                      <svg width="18" height="18" fill="none" stroke="#2C2C2C" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: '11px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>{product.brand}</p>
                    <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#2C2C2C', marginBottom: '6px', lineHeight: 1.3 }}>{product.name}</h3>
                    <p style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#2C5F5D', marginBottom: '16px' }}>{product.price}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAdd(product)} style={{ flex: 1, padding: '12px', background: 'white', border: '2px solid #2C5F5D', borderRadius: '8px', color: '#2C5F5D', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}>Add to Cart</button>
                      <a href={generateProductWhatsAppLink(product)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', background: '#25D366', borderRadius: '8px' }}>
                        <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreProducts && (
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <button onClick={handleLoadMore} className="btn-luxury" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 48px', background: 'linear-gradient(135deg, #2C5F5D, #1F4A48)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(44,95,93,0.3)', transition: 'all 0.3s' }}>
                  <span>Discover More</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  <span style={{ opacity: 0.8, fontSize: '13px' }}>({remainingProducts} remaining)</span>
                </button>
              </div>
            )}

            {/* Showing count */}
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6B6B6B' }}>
              Showing {displayedProducts.length} of {filtered.length} products
            </p>
          </div>
        </section>

        {/* Expert Skincare Consultation */}
        <section id="consultation" style={{ padding: '80px 24px', background: '#FAF8F5', borderTop: '1px solid #F5EFE0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ fontSize: '12px', color: '#C9B98F', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>Professional Services</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,5vw,42px)', fontWeight: 600, color: '#2C2C2C', marginBottom: '12px' }}>Expert Skincare Consultation</h2>
              <p style={{ fontSize: '16px', color: '#6B6B6B', maxWidth: '600px', margin: '0 auto' }}>Personalized Guidance from Lagos' Top Skincare Expert</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Service Card 1 - Skincare Routine */}
              <div className="card-lift" style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '1px solid #F5EFE0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg, #C9B98F, #D4AF37)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personalized</div>

                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(201,185,143,0.2), rgba(212,175,55,0.1))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="28" height="28" fill="none" stroke="#C9B98F" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>

                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '28px', fontWeight: 600, color: '#2C2C2C', marginBottom: '8px' }}>Complete Skincare Routine</h3>
                <p style={{ fontSize: '36px', fontWeight: 700, color: '#2C5F5D', marginBottom: '24px' }}>₦20,000</p>

                <div style={{ width: '40%', height: '1px', background: 'linear-gradient(90deg, #C9B98F, transparent)', marginBottom: '24px' }}></div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                  {['Comprehensive skin analysis', 'Customized product recommendations', 'Step-by-step routine creation', 'Product usage directions', 'Ongoing follow-up support via WhatsApp'].map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', fontSize: '14px', color: '#6B6B6B' }}>
                      <svg width="20" height="20" fill="none" stroke="#4CAF50" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button onClick={() => openConsultationModal('standard')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '18px', background: '#2C5F5D', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '12px', transition: 'all 0.3s' }} className="btn-luxury">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Book Expert Consultation
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#6B6B6B' }}>
                  <span>Prefer Telegram?</span>
                  <a href="https://t.me/remabell_exquisite" target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="16" height="16" fill="#0088cc" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                    Message on Telegram
                  </a>
                </div>
              </div>

              {/* Service Card 2 - FaceTime Consultation */}
              <div className="card-lift" style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '1px solid #F5EFE0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg, #2C5F5D, #1F4A48)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Premium</div>

                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(44,95,93,0.2), rgba(31,74,72,0.1))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="28" height="28" fill="none" stroke="#2C5F5D" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>

                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '28px', fontWeight: 600, color: '#2C2C2C', marginBottom: '8px' }}>FaceTime Video Consultation</h3>
                <p style={{ fontSize: '36px', fontWeight: 700, color: '#2C5F5D', marginBottom: '24px' }}>₦35,000</p>

                <div style={{ width: '40%', height: '1px', background: 'linear-gradient(90deg, #2C5F5D, transparent)', marginBottom: '24px' }}></div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                  {['45-minute personal video call', 'Real-time skin assessment', 'Customized skincare routine', 'Product recommendations with explanations', 'Detailed usage directions', '2-week follow-up check-in'].map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', fontSize: '14px', color: '#6B6B6B' }}>
                      <svg width="20" height="20" fill="none" stroke="#4CAF50" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button onClick={() => openConsultationModal('video')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '18px', background: 'linear-gradient(135deg, #2C5F5D, #1F4A48)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '12px', transition: 'all 0.3s' }} className="btn-luxury">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Book Premium Video Call
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#6B6B6B' }}>
                  <span>Prefer Telegram?</span>
                  <a href="https://t.me/remabell_exquisite" target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="16" height="16" fill="#0088cc" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                    Message on Telegram
                  </a>
                </div>
              </div>
            </div>

            {/* Trust Elements */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', marginTop: '48px', padding: '24px', background: 'rgba(232,237,232,0.5)', borderRadius: '12px' }}>
              {[
                { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', subIcon: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z', text: '14.3K+ Followers', color: '#E1306C' },
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Trusted Skincare Expert', color: '#C9B98F' },
                { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', text: 'Personal Attention', color: '#E53E3E' },
                { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', text: 'Professional Advice', color: '#C9B98F' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B6B6B' }}>
                  <svg width="20" height="20" fill="none" stroke={item.color} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                  <span style={{ fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section style={{ padding: '64px 24px', background: '#E8EDE8' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 600, color: '#2C2C2C', textAlign: 'center', marginBottom: '48px' }}>Why Choose Remabell Exquisite</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
              {[
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: '100% Authentic', desc: 'CAC Registered & Verified - Every product sourced from authorized distributors' },
                { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Lightning Fast', desc: 'Same-day delivery in Lagos, 2-3 days nationwide' },
                { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Global Shipping', desc: 'Worldwide shipping - We deliver premium skincare globally' },
                { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', title: 'Trusted by Thousands', desc: '5,000+ satisfied customers across Lagos & Nigeria' }
              ].map((item, i) => (
                <div key={i} className="card-lift" style={{ background: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <svg width="48" height="48" fill="none" stroke="#C9B98F" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#2C2C2C', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Influencer & Partnership Section */}
        <section id="partner" style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #2C5F5D 0%, #1F4A48 100%)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle background particles - using fixed positions to avoid hydration mismatch */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
            {[
              { top: '10%', left: '5%', duration: '4s' },
              { top: '20%', left: '80%', duration: '5s' },
              { top: '30%', left: '25%', duration: '6s' },
              { top: '15%', left: '60%', duration: '4.5s' },
              { top: '45%', left: '10%', duration: '5.5s' },
              { top: '55%', left: '90%', duration: '4s' },
              { top: '70%', left: '15%', duration: '6s' },
              { top: '80%', left: '70%', duration: '5s' },
              { top: '25%', left: '45%', duration: '4.5s' },
              { top: '60%', left: '35%', duration: '5.5s' },
              { top: '85%', left: '55%', duration: '4s' },
              { top: '35%', left: '95%', duration: '6s' },
              { top: '5%', left: '50%', duration: '5s' },
              { top: '90%', left: '20%', duration: '4.5s' },
              { top: '40%', left: '75%', duration: '5.5s' },
            ].map((particle, i) => (
              <div key={i} style={{ position: 'absolute', width: '4px', height: '4px', background: 'white', borderRadius: '50%', top: particle.top, left: particle.left, animation: `float ${particle.duration} ease-in-out infinite` }} />
            ))}
          </div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>Work With Us</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: 600, color: 'white', marginBottom: '12px' }}>Partner With Lagos' Leading Skincare Influencer</h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto' }}>Join 14,300+ engaged followers in the luxury skincare community</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
              {/* Left Column - Stats */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Our Reach</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Instagram */}
                  <a href="https://www.instagram.com/remabell_exqusite_?igsh=cWUwd3F1ZG54dWZh" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.3s' }} className="card-lift">
                    <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #E1306C, #F77737)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1 }}>14.3K+</p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Instagram Followers</p>
                    </div>
                    <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>

                  {/* TikTok */}
                  <a href="https://www.tiktok.com/@remabell_exquisite?_r=1&_t=ZS-93JZwLnnMeN" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.3s' }} className="card-lift">
                    <div style={{ width: '48px', height: '48px', background: '#000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1 }}>Growing Community</p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>TikTok Presence</p>
                    </div>
                    <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>

                  {/* Engagement */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #C9B98F, #D4AF37)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1 }}>High Engagement</p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Authentic Reviews & Trust</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Services */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Collaboration Opportunities</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', title: 'Brand Promotions', desc: 'Instagram Stories, Reels & TikTok product features', note: 'Reach 14.3K+ skincare enthusiasts' },
                    { icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', title: 'Product Reviews', desc: 'Honest, detailed reviews of skincare products', note: 'Authentic testimonials your audience trusts' },
                    { icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', subIcon: 'M15 13a3 3 0 11-6 0 3 3 0 016 0z', title: 'Sponsored Content', desc: 'High-quality product photography & demo videos', note: 'Professional content for your brand' },
                    { icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', title: 'Ambassador Programs', desc: 'Long-term brand partnerships & collaborations', note: 'Custom packages available' }
                  ].map((service, i) => (
                    <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #C9B98F, #D4AF37)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={service.icon} /></svg>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'white', margin: '0 0 4px 0' }}>{service.title}</h4>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '0 0 4px 0' }}>{service.desc}</p>
                          <p style={{ fontSize: '12px', color: '#C9B98F', margin: 0 }}>{service.note}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '56px' }}>
              <a href="https://wa.me/2349027064415?text=Hi%20Remabell%2C%20I'm%20interested%20in%20a%20brand%20collaboration%2Fpartnership.%20I'd%20like%20to%20discuss%20promotion%20opportunities.%20Are%20you%20available%20for%20a%20call%3F" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '20px 48px', background: 'white', color: '#2C5F5D', borderRadius: '12px', fontSize: '16px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.3s' }} className="btn-luxury">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                Discuss Collaboration
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ padding: '64px 24px', background: '#FAF8F5' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 600, color: '#2C2C2C', textAlign: 'center', marginBottom: '48px' }}>What Our Customers Say</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px' }}>
              {[
                { name: 'Chioma A.', loc: 'Lagos', text: 'Finally found a reliable source for authentic skincare! Every product is genuine and delivery is super fast.' },
                { name: 'Tunde O.', loc: 'Abuja', text: "The best skincare vendor in Nigeria. I've ordered multiple times and never been disappointed." },
                { name: 'Blessing M.', loc: 'Port Harcourt', text: 'Excellent customer service and 100% original products. Highly recommended!' },
                { name: 'Funke S.', loc: 'Ibadan', text: 'Love the variety of products available. My skin has never looked better!' },
                { name: 'David K.', loc: 'Lekki', text: 'Same-day delivery is a game changer. Professional service all the way.' },
                { name: 'Amara N.', loc: 'Victoria Island', text: 'Trustworthy and reliable. This is now my go-to for all skincare needs.' }
              ].map((t, i) => (
                <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '12px', borderLeft: '3px solid #2C5F5D', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>{[...Array(5)].map((_, j) => <svg key={j} width="16" height="16" fill="#C9B98F" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                  <p style={{ color: '#6B6B6B', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>&ldquo;{t.text}&rdquo;</p>
                  <p style={{ fontWeight: 600, color: '#2C2C2C', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{t.loc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '64px 24px', background: '#E8EDE8' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 600, color: '#2C2C2C', textAlign: 'center', marginBottom: '48px' }}>Frequently Asked Questions</h2>
            {[
              { q: 'Are all products 100% authentic?', a: 'Yes! Every product is sourced from authorized distributors and verified for authenticity. We are CAC registered and stand behind every item.' },
              { q: 'How long does delivery take?', a: 'Same-day delivery in Lagos, 2-3 days nationwide in Nigeria, and 5-7 days for international shipping. Pre-payment required for all orders.' },
              { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide! Contact us via WhatsApp for international shipping rates.' },
              { q: 'What payment methods do you accept?', a: 'We accept bank transfers and card payments. Payment must be completed before your order is dispatched. We do not offer cash on delivery (COD). Once you place your order via WhatsApp, we\'ll send you our secure payment details.' },
              { q: 'Do you offer payment on delivery?', a: 'No, we require secure pre-payment for all orders. This ensures faster processing and confirms your order. We accept bank transfers and card payments. Payment details will be sent via WhatsApp after you place your order.' },
              { q: 'Can I return products?', a: 'Yes, we have a return policy for unopened products within 7 days of delivery.' }
            ].map((faq, i) => (
              <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2C2C2C', marginBottom: '8px' }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#2C2C2C', color: 'white', padding: '64px 24px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px', marginBottom: '48px' }}>
            {/* Column 1: Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#2C5F5D', fontFamily: "'Cormorant Garamond',serif", fontSize: '24px', fontWeight: 600 }}>R</span>
                </div>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', margin: 0 }}>Remabell</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontStyle: 'italic', margin: 0 }}>Exquisite</p>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '20px' }}>Lagos&apos; most trusted destination for 100% authentic, premium skincare products. CAC registered and verified.</p>
              {/* Social Icons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="https://www.instagram.com/remabell_exqusite_?igsh=cWUwd3F1ZG54dWZh" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                  <svg width="18" height="18" fill="#C9B98F" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href="https://www.tiktok.com/@remabell_exquisite?_r=1&_t=ZS-93JZwLnnMeN" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                  <svg width="18" height="18" fill="#C9B98F" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Links</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'Shop All Products', href: '#products' },
                  { label: 'Consultation Services', href: '#consultation' },
                  { label: 'Partner With Us', href: '#partner' },
                  { label: 'About Us', href: '#' },
                  { label: 'Shipping Information', href: '#' }
                ].map((link, i) => (
                  <li key={i} style={{ marginBottom: '12px' }}>
                    <a href={link.href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Support */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Customer Support</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Work Line 1 */}
                <a href="tel:+2347080803226" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>
                  <svg width="18" height="18" fill="none" stroke="#4CAF50" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>07080803226</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>General Inquiries</p>
                  </div>
                </a>
                {/* Work Line 2 */}
                <a href="tel:+2349129293561" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>
                  <svg width="18" height="18" fill="none" stroke="#4CAF50" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>09129293561</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Help & Support</p>
                  </div>
                </a>
                {/* Premium Line */}
                <a href="tel:+2349027064415" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                  <svg width="18" height="18" fill="none" stroke="#C9B98F" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>09027064415</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#C9B98F' }}>Expert Consultations & Partnerships</p>
                  </div>
                </a>
                {/* WhatsApp Button */}
                <a href="https://wa.me/2347080803226" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#25D366', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginTop: '8px', width: 'fit-content' }}>
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Column 4: Business Hours */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Business Hours</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Monday - Saturday</span>
                  <span style={{ color: 'white' }}>9AM - 7PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sunday</span>
                  <span style={{ color: 'white' }}>10AM - 5PM</span>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <svg width="16" height="16" fill="none" stroke="#C9B98F" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>Lagos, Nigeria</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" fill="none" stroke="#C9B98F" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span>CAC Registered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <svg width="16" height="16" fill="none" stroke="#C9B98F" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span>Secure Pre-Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>© 2026 Remabell Exquisite. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Shipping Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E8EDE8', padding: '12px 16px', display: 'flex', gap: '12px', zIndex: 40 }}>
        <button onClick={() => setIsCartOpen(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#2C5F5D', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Cart ({cartCount})
        </button>
        <a href="https://wa.me/2347080803226" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#25D366', color: 'white', borderRadius: '12px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          WhatsApp
        </a>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        aria-label="Back to top"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Consultation Email Modal */}
      {consultationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setConsultationModal(null)} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setConsultationModal(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <svg width="20" height="20" fill="none" stroke="#6B6B6B" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #2C5F5D, #1F4A48)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">{consultationModal === 'video' ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}</svg>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '24px', fontWeight: 600, color: '#2C2C2C', margin: '0 0 4px' }}>{consultationModal === 'video' ? 'FaceTime Video Consultation' : 'Expert Skincare Consultation'}</h3>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#2C5F5D', margin: 0 }}>{consultationModal === 'video' ? '₦35,000' : '₦20,000'}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#2C2C2C', marginBottom: '6px' }}>Your Email Address</label>
              <input type="email" value={consultationEmail} onChange={(e) => { setConsultationEmail(e.target.value); setConsultationEmailError(''); }} placeholder="you@example.com" style={{ width: '100%', padding: '14px 16px', border: consultationEmailError ? '2px solid #EF4444' : '2px solid #E8EDE8', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              {consultationEmailError && <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0' }}>{consultationEmailError}</p>}
            </div>
            <button onClick={processConsultationPayment} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2C5F5D, #1F4A48)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(44,95,93,0.3)' }}>Proceed to Payment</button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#6B6B6B', marginTop: '12px' }}>🔒 Secured by Paystack. Pay with card, bank transfer, or USSD.</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .group-hover\\:opacity-100:hover { opacity: 1 !important; }
        .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
