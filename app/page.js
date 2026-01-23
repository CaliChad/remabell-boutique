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
  const brands = ['The Ordinary', 'CeraVe', 'Neutrogena', 'La Roche-Posay', 'Clean & Clear'];

  useEffect(() => { setCart(getCart()); setCartCount(getCartCount()); }, []);
  useEffect(() => { const i = setInterval(() => setBrandIndex(p => (p + 1) % brands.length), 2500); return () => clearInterval(i); }, []);

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'All Products' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (p) => { addToCart(p, 1); setCart(getCart()); setCartCount(getCartCount()); };
  const handleRemove = (id) => { removeFromCart(id); setCart(getCart()); setCartCount(getCartCount()); };
  const handleQty = (id, q) => { updateQuantity(id, q); setCart(getCart()); setCartCount(getCartCount()); };

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
                  <a href={generateCartWhatsAppLink(cart)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', padding: '16px', background: '#25D366', color: 'white', borderRadius: '12px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}>
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    Order via WhatsApp ({cart.length} items)
                  </a>
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
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '10px 20px', background: selectedCategory === cat ? '#2C5F5D' : 'white', color: selectedCategory === cat ? 'white' : '#2C5F5D', border: '2px solid #2C5F5D', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '24px' }}>
              {filtered.map(product => (
                <div key={product.id} className="card-lift" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
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
              { q: 'How long does delivery take?', a: 'Same-day delivery in Lagos, 2-3 days nationwide in Nigeria, and 5-7 days for international shipping.' },
              { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide! Contact us via WhatsApp for international shipping rates.' },
              { q: 'What payment methods do you accept?', a: 'We accept bank transfers, card payments, and cash on delivery for Lagos orders.' },
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
      <footer style={{ background: '#2C2C2C', color: 'white', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#2C5F5D', fontFamily: "'Cormorant Garamond',serif", fontSize: '24px', fontWeight: 600 }}>R</span></div>
              <div><p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', margin: 0 }}>Remabell</p><p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontStyle: 'italic', margin: 0 }}>Exquisite</p></div>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Lagos&apos; most trusted destination for 100% authentic, premium skincare products. CAC registered and verified.</p>
          </div>
          <div><h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Links</h3><ul style={{ listStyle: 'none', padding: 0, margin: 0 }}><li style={{ marginBottom: '8px' }}><a href="#products" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Collection</a></li><li style={{ marginBottom: '8px' }}><a href="https://wa.me/2347080803226" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Order Now</a></li></ul></div>
          <div><h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact</h3><a href="https://wa.me/2347080803226" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>+234 708 080 3226</a></div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '48px auto 0', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>© 2026 Remabell Exquisite. All rights reserved.</p></div>
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
      <style jsx>{`
        .group-hover\\:opacity-100:hover { opacity: 1 !important; }
        .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
