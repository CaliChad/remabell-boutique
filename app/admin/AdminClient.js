'use client';

import { useState, useEffect, useRef } from 'react';

const CATEGORIES = ['Face', 'Body', 'Hair', 'Accessories', 'Uncategorized', 'Consultations'];

const EMPTY_FORM = {
    name: '',
    brand: 'Generic',
    price: '',
    category: '',
    description: '',
    inStock: true,
    image: '',
};

export default function AdminClient({ isVercel }) {
    const [authState, setAuthState] = useState('loading'); // 'loading' | 'login' | 'dashboard'
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const [modalMode, setModalMode] = useState(null); // null | 'add' | 'edit'
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [formSaving, setFormSaving] = useState(false);

    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    const [toast, setToast] = useState(null);
    const [vercelDismissed, setVercelDismissed] = useState(false);

    const fileInputRef = useRef(null);

    // On mount: try to load products to determine auth state
    useEffect(() => {
        fetch('/api/admin/products')
            .then(r => {
                if (r.status === 401) {
                    setAuthState('login');
                    return null;
                }
                return r.json();
            })
            .then(data => {
                if (data && data.success) {
                    setProducts(data.products);
                    setAuthState('dashboard');
                }
            })
            .catch(() => setAuthState('login'));
    }, []);

    function showToast(message, type = 'success') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }

    // ─── Auth ─────────────────────────────────────────────────────────────────

    async function handleLogin(e) {
        e.preventDefault();
        if (!password) { setLoginError('Please enter the password'); return; }
        setLoginLoading(true);
        setLoginError('');

        try {
            const r = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await r.json();
            if (data.success) {
                // Now load products
                const pr = await fetch('/api/admin/products');
                const pd = await pr.json();
                if (pd.success) setProducts(pd.products);
                setAuthState('dashboard');
                setPassword('');
            } else {
                setLoginError(data.message || 'Invalid password');
            }
        } catch {
            setLoginError('Connection error. Please try again.');
        }
        setLoginLoading(false);
    }

    async function handleLogout() {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        setAuthState('login');
        setProducts([]);
        setPassword('');
    }

    // ─── Modal open/close ─────────────────────────────────────────────────────

    function openAdd() {
        setFormData(EMPTY_FORM);
        setFormErrors({});
        setImagePreview('');
        setEditingProduct(null);
        setModalMode('add');
    }

    function openEdit(product) {
        const priceNum = parseInt(String(product.price || '').replace(/[₦,]/g, ''), 10);
        setFormData({
            name: product.name || '',
            brand: product.brand || 'Generic',
            price: isNaN(priceNum) ? '' : priceNum,
            category: product.category || '',
            description: product.description || '',
            inStock: product.inStock !== false,
            image: product.image || '',
        });
        setFormErrors({});
        setImagePreview(product.image || '');
        setEditingProduct(product);
        setModalMode('edit');
    }

    function closeModal() {
        setModalMode(null);
        setEditingProduct(null);
        setFormErrors({});
        setImagePreview('');
    }

    // ─── Image upload ─────────────────────────────────────────────────────────

    async function handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Show local preview immediately
        setImagePreview(URL.createObjectURL(file));
        setUploadingImage(true);

        const fd = new FormData();
        fd.append('file', file);

        try {
            const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            const data = await r.json();
            if (data.success) {
                setFormData(f => ({ ...f, image: data.url }));
            } else {
                showToast(data.message || 'Image upload failed', 'error');
                setImagePreview(formData.image || '');
            }
        } catch {
            showToast('Image upload failed', 'error');
            setImagePreview(formData.image || '');
        }
        setUploadingImage(false);
    }

    // ─── Save product ─────────────────────────────────────────────────────────

    function validateForm() {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Product name is required';
        if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            errors.price = 'Enter a valid price (e.g. 21000)';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function handleSave() {
        if (!validateForm()) return;
        setFormSaving(true);

        const method = modalMode === 'add' ? 'POST' : 'PUT';
        const payload = { ...formData };
        if (modalMode === 'edit') payload.id = editingProduct.id;

        try {
            const r = await fetch('/api/admin/products', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await r.json();

            if (r.ok && data.success) {
                if (modalMode === 'add') {
                    setProducts(prev => [...prev, data.product]);
                    showToast('Product added successfully!');
                } else {
                    setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p));
                    showToast('Product updated successfully!');
                }
                closeModal();
            } else {
                showToast(data.message || 'Failed to save product', 'error');
            }
        } catch {
            showToast('Connection error. Please try again.', 'error');
        }
        setFormSaving(false);
    }

    // ─── Delete product ───────────────────────────────────────────────────────

    async function handleDelete(product) {
        if (!confirm(`Delete "${product.name}"?\n\nThis cannot be undone.`)) return;

        try {
            const r = await fetch(`/api/admin/products?id=${product.id}`, { method: 'DELETE' });
            const data = await r.json();
            if (r.ok && data.success) {
                setProducts(prev => prev.filter(p => p.id !== product.id));
                showToast('Product deleted');
            } else {
                showToast(data.message || 'Failed to delete product', 'error');
            }
        } catch {
            showToast('Connection error. Please try again.', 'error');
        }
    }

    // ─── Filtered products ────────────────────────────────────────────────────

    const filtered = products.filter(p => {
        const matchesSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // ─── Render: Loading ──────────────────────────────────────────────────────

    if (authState === 'loading') {
        return (
            <div style={{ minHeight: '100vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, system-ui, sans-serif' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #E8EDE8', borderTopColor: '#2C5F5D', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6B6B6B', fontSize: '14px' }}>Checking authentication...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ─── Render: Login ────────────────────────────────────────────────────────

    if (authState === 'login') {
        return (
            <div style={{ minHeight: '100vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Poppins, system-ui, sans-serif' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '48px 40px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 40px rgba(44,95,93,0.12)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '32px', color: '#2C5F5D', margin: '0 0 4px', letterSpacing: '1px' }}>
                            Remabell
                        </h1>
                        <p style={{ color: '#C9B98F', fontSize: '13px', fontWeight: '500', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
                            Admin Panel
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#6B6B6B', marginBottom: '6px', fontWeight: '500' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                                placeholder="Enter admin password"
                                autoFocus
                                style={{ width: '100%', padding: '12px', border: `1px solid ${loginError ? '#C0392B' : '#ddd'}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
                            />
                        </div>

                        {loginError && (
                            <p style={{ color: '#C0392B', fontSize: '13px', margin: '0 0 16px' }}>{loginError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loginLoading}
                            style={{ width: '100%', padding: '12px', background: loginLoading ? '#6B6B6B' : '#2C5F5D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontFamily: 'inherit', fontWeight: '500', cursor: loginLoading ? 'default' : 'pointer', transition: 'background 0.2s' }}
                        >
                            {loginLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ─── Render: Dashboard ────────────────────────────────────────────────────

    return (
        <div style={{ minHeight: '100vh', background: '#FAF8F5', fontFamily: 'Poppins, system-ui, sans-serif' }}>

            {/* Header */}
            <div style={{ background: '#2C5F5D', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '20px', letterSpacing: '1px' }}>Remabell</span>
                    <span style={{ color: '#C9B98F', fontSize: '12px', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin</span>
                    <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '2px 10px', fontSize: '12px' }}>
                        {products.length} products
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
                >
                    Logout
                </button>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 80px' }}>

                {/* Vercel warning */}
                {isVercel && !vercelDismissed && (
                    <div style={{ background: '#fff8e1', border: '1px solid #C9B98F', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#5a4a1f', lineHeight: '1.5' }}>
                            <strong>Running on Vercel:</strong> Product changes won&apos;t persist here since Vercel&apos;s filesystem is read-only.
                            Run the admin locally (<code>npm run dev</code>), make your changes, then commit and push to deploy.
                        </p>
                        <button onClick={() => setVercelDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a4a1f', fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>×</button>
                    </div>
                )}

                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="search"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: '1', minWidth: '200px', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', background: 'white' }}
                    />
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', background: 'white', cursor: 'pointer' }}
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        onClick={openAdd}
                        style={{ background: '#2C5F5D', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                        + Add Product
                    </button>
                </div>

                {/* Results count */}
                {search || filterCategory !== 'All' ? (
                    <p style={{ fontSize: '13px', color: '#6B6B6B', marginBottom: '12px' }}>
                        Showing {filtered.length} of {products.length} products
                    </p>
                ) : null}

                {/* Products table */}
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#F5F7F5', borderBottom: '1px solid #E8EDE8' }}>
                                    <th style={thStyle}>Image</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>Name</th>
                                    <th style={thStyle}>Price</th>
                                    <th style={thStyle}>Category</th>
                                    <th style={thStyle}>Stock</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6B6B6B' }}>
                                            {search ? 'No products match your search.' : 'No products yet. Click "+ Add Product" to get started.'}
                                        </td>
                                    </tr>
                                ) : filtered.map(product => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #F0F0F0', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#FAFCFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >
                                        <td style={{ padding: '10px 16px', textAlign: 'center', width: '64px' }}>
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    loading="lazy"
                                                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E8EDE8' }}
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div style={{ width: '48px', height: '48px', background: '#E8EDE8', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📦</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 16px', maxWidth: '260px' }}>
                                            <div style={{ fontWeight: '500', color: '#2C2C2C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                                            {product.brand && product.brand !== 'Generic' && (
                                                <div style={{ fontSize: '12px', color: '#6B6B6B' }}>{product.brand}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: '500', color: '#2C5F5D', whiteSpace: 'nowrap' }}>
                                            {product.price}
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <span style={{ background: '#E8EDE8', borderRadius: '12px', padding: '2px 10px', fontSize: '12px', color: '#2C2C2C' }}>
                                                {product.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <span style={{ background: product.inStock !== false ? '#d4edda' : '#f8d7da', color: product.inStock !== false ? '#155724' : '#721c24', borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: '500' }}>
                                                {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            <button
                                                onClick={() => openEdit(product)}
                                                style={{ background: '#E8EDE8', border: 'none', color: '#2C5F5D', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', marginRight: '6px', fontWeight: '500' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                style={{ background: '#fdf0f0', border: 'none', color: '#C0392B', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: '500' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {modalMode && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                    onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
                >
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        {/* Modal header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8EDE8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', borderRadius: '16px 16px 0 0' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', color: '#2C2C2C', fontWeight: '600' }}>
                                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
                            </h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6B6B6B', lineHeight: 1, padding: '4px' }}>×</button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                                {/* Product Name - full width */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => { setFormData(f => ({ ...f, name: e.target.value })); setFormErrors(fe => ({ ...fe, name: '' })); }}
                                        placeholder="e.g. Lait Peau De Lune"
                                        style={{ ...inputStyle, borderColor: formErrors.name ? '#C0392B' : '#ddd' }}
                                    />
                                    {formErrors.name && <p style={errorStyle}>{formErrors.name}</p>}
                                </div>

                                {/* Price */}
                                <div>
                                    <label style={labelStyle}>Price (₦) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => { setFormData(f => ({ ...f, price: e.target.value })); setFormErrors(fe => ({ ...fe, price: '' })); }}
                                        placeholder="21000"
                                        min="1"
                                        style={{ ...inputStyle, borderColor: formErrors.price ? '#C0392B' : '#ddd' }}
                                    />
                                    {formErrors.price && <p style={errorStyle}>{formErrors.price}</p>}
                                </div>

                                {/* Category */}
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <input
                                        type="text"
                                        list="admin-categories"
                                        value={formData.category}
                                        onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                                        placeholder="Select or type..."
                                        style={inputStyle}
                                    />
                                    <datalist id="admin-categories">
                                        {CATEGORIES.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>

                                {/* Description - full width */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Brief product description..."
                                        rows={3}
                                        style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                                    />
                                </div>

                                {/* In Stock */}
                                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                                        <div
                                            onClick={() => setFormData(f => ({ ...f, inStock: !f.inStock }))}
                                            style={{
                                                width: '44px', height: '24px', borderRadius: '12px',
                                                background: formData.inStock ? '#2C5F5D' : '#ccc',
                                                position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute', top: '3px', width: '18px', height: '18px',
                                                borderRadius: '50%', background: 'white',
                                                left: formData.inStock ? '23px' : '3px',
                                                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#2C2C2C', fontWeight: '500' }}>
                                            {formData.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </label>
                                </div>

                                {/* Image upload - full width */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Product Image</label>

                                    {/* Current image preview */}
                                    {(imagePreview || formData.image) && (
                                        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img
                                                src={imagePreview || formData.image}
                                                alt="Preview"
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E8EDE8' }}
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                            <div>
                                                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B6B6B' }}>
                                                    {uploadingImage ? 'Uploading...' : 'Image ready'}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '11px', color: '#aaa', wordBreak: 'break-all', maxWidth: '200px' }}>
                                                    {formData.image}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            style={{ background: uploadingImage ? '#ccc' : '#E8EDE8', color: '#2C5F5D', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: uploadingImage ? 'default' : 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: '500' }}
                                        >
                                            {uploadingImage ? 'Uploading...' : '📁 Choose Image'}
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ fontSize: '12px', color: '#aaa' }}>JPEG, PNG, WebP — max 10 MB</span>
                                    </div>

                                    {/* Or direct URL input */}
                                    <div style={{ marginTop: '10px' }}>
                                        <label style={{ fontSize: '12px', color: '#6B6B6B', display: 'block', marginBottom: '4px' }}>
                                            Or enter image URL/path
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={e => { setFormData(f => ({ ...f, image: e.target.value })); setImagePreview(e.target.value); }}
                                            placeholder="/images/PRODUCT-NAME.jpeg"
                                            style={{ ...inputStyle, fontSize: '12px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #E8EDE8', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={closeModal}
                                style={{ padding: '10px 20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', color: '#6B6B6B' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={formSaving || uploadingImage}
                                style={{ padding: '10px 24px', background: formSaving || uploadingImage ? '#6B6B6B' : '#2C5F5D', color: 'white', border: 'none', borderRadius: '8px', cursor: formSaving || uploadingImage ? 'default' : 'pointer', fontSize: '14px', fontFamily: 'inherit', fontWeight: '500' }}
                            >
                                {formSaving ? 'Saving...' : modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast notification */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? '#C0392B' : '#2C5F5D',
                    color: 'white', padding: '12px 24px', borderRadius: '8px',
                    zIndex: 300, fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    whiteSpace: 'nowrap', fontWeight: '500',
                }}>
                    {toast.message}
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// Shared style objects
const thStyle = {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
};

const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: '#6B6B6B',
    marginBottom: '6px',
    fontWeight: '500',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'Poppins, system-ui, sans-serif',
    boxSizing: 'border-box',
    outline: 'none',
    background: 'white',
};

const errorStyle = {
    color: '#C0392B',
    fontSize: '12px',
    margin: '4px 0 0',
};
