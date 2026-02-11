'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, clearCart } from '../../lib/cart';
import { generateReference, calculateCartTotalKobo, formatAmount, validateEmail, validateNigerianPhone, hasVirtualProducts } from '../../lib/paystack';
import { createOrder, saveOrder, markOrderAsPaid } from '../../lib/orders';
import PaystackPopup from '../../components/PaystackPopup';

// Location data arrays
const mainlandAreas = [
    'Agege', 'Alimosho', 'Egbeda', 'Ejigbo', 'Gbagada', 'Idimu', 'Ikeja',
    'Ikotun', 'Ikorodu', 'Ilupeju', 'Ipaja', 'Isolo', 'Ketu', 'Magodo',
    'Maryland', 'Mushin', 'Ogba', 'Ojodu', 'Ojota', 'Oshodi', 'Surulere', 'Yaba',
    'Other (Contact us on WhatsApp)'
];

const islandAreas = [
    'Ajah', 'Agungi', 'Banana Island', 'Chevron', 'Ikoyi', 'Lekki Phase 1',
    'Lekki Phase 2', 'Oniru', 'Sangotedo', 'Victoria Island (VI)', 'VGC',
    'Other (Contact us on WhatsApp)'
];

const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
    'Kebbi', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
    'Other (Contact us on WhatsApp)'
];

// Shipping fee constants (in Naira)
const SHIPPING_FEES = {
    'lagos-mainland': 4000,
    'lagos-island': 5000,
    'outside-lagos': 7500
};

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [reference, setReference] = useState('');
    const [errors, setErrors] = useState({});

    // Sunday detection
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const [sundayBannerDismissed, setSundayBannerDismissed] = useState(false);

    // Customer form state
    const [customer, setCustomer] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    // Shipping state
    const [shippingRegion, setShippingRegion] = useState('');
    const [specificLocation, setSpecificLocation] = useState('');
    const [shippingFee, setShippingFee] = useState(0);

    // Consultation date/time (for virtual products)
    const [consultationDateTime, setConsultationDateTime] = useState('');

    // Load cart and saved shipping selections on mount
    useEffect(() => {
        const cartData = getCart();
        if (!cartData || cartData.length === 0) {
            router.push('/');
            return;
        }
        setCart(cartData);
        setReference(generateReference());

        // Restore saved shipping selections from localStorage
        const savedRegion = localStorage.getItem('remabell_shipping_region');
        const savedLocation = localStorage.getItem('remabell_shipping_location');
        if (savedRegion) {
            setShippingRegion(savedRegion);
            setShippingFee(SHIPPING_FEES[savedRegion] || 7500);
        }
        if (savedLocation) {
            setSpecificLocation(savedLocation);
        }

        setLoading(false);
    }, [router]);

    // Update shipping fee when region changes
    const handleRegionChange = (region) => {
        setShippingRegion(region);
        setSpecificLocation(''); // Clear location when region changes
        localStorage.setItem('remabell_shipping_region', region);
        localStorage.removeItem('remabell_shipping_location');

        if (region) {
            setShippingFee(SHIPPING_FEES[region] || 7500);
        } else {
            setShippingFee(0);
        }

        // Clear errors
        if (errors.shippingRegion) {
            setErrors(prev => ({ ...prev, shippingRegion: '' }));
        }
    };

    // Handle location change
    const handleLocationChange = (location) => {
        setSpecificLocation(location);
        localStorage.setItem('remabell_shipping_location', location);
        if (errors.specificLocation) {
            setErrors(prev => ({ ...prev, specificLocation: '' }));
        }
    };

    // Get location options based on region
    const getLocationOptions = () => {
        switch (shippingRegion) {
            case 'lagos-mainland':
                return mainlandAreas;
            case 'lagos-island':
                return islandAreas;
            case 'outside-lagos':
                return nigerianStates;
            default:
                return [];
        }
    };

    // Check if "Other" location is selected
    const isOtherLocation = specificLocation.includes('Other');

    // Calculate totals
    const subtotalKobo = calculateCartTotalKobo(cart);
    const shippingKobo = shippingFee * 100;
    const hasConsultations = hasVirtualProducts(cart);
    const hasPhysicalProducts = cart.some(item => !item.isVirtual);

    // Total includes shipping only for physical products
    const totalKobo = hasPhysicalProducts ? subtotalKobo + shippingKobo : subtotalKobo;
    const subtotalDisplay = formatAmount(subtotalKobo);
    const shippingDisplay = shippingFee > 0 ? formatAmount(shippingKobo) : null;
    const totalDisplay = formatAmount(totalKobo);

    // Get delivery timeline
    const getDeliveryTimeline = () => {
        if (shippingRegion.includes('lagos')) {
            return '1-2 days';
        }
        return '3-5 days';
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!customer.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!customer.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!customer.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(customer.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!customer.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!validateNigerianPhone(customer.phone)) {
            newErrors.phone = 'Please enter a valid Nigerian phone number';
        }

        // Shipping validation for physical products
        if (hasPhysicalProducts) {
            if (!shippingRegion) {
                newErrors.shippingRegion = 'Please select your delivery region';
            }
            if (shippingRegion && !specificLocation) {
                newErrors.specificLocation = 'Please select your specific location';
            }
            if (!customer.address.trim()) {
                newErrors.address = 'Street address is required for delivery';
            }
        }

        if (hasConsultations && !consultationDateTime) {
            newErrors.consultationDateTime = 'Please select your preferred consultation date/time';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomer(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle successful payment
    const handlePaymentSuccess = async (transaction) => {
        setProcessing(true);

        try {
            const verifyResponse = await fetch(`/api/paystack/verify?reference=${transaction.reference}`);
            const verifyData = await verifyResponse.json();

            if (verifyData.success && verifyData.data.isSuccessful) {
                const order = createOrder({
                    reference: transaction.reference,
                    cart,
                    customer: {
                        ...customer,
                        shippingRegion,
                        specificLocation,
                        shippingFee
                    },
                    totalAmount: totalKobo / 100,
                    shippingFee: shippingFee,
                    paymentStatus: 'paid',
                    consultationDateTime: hasConsultations ? consultationDateTime : null
                });

                markOrderAsPaid(transaction.reference, {
                    transaction_id: verifyData.data.transaction_id
                });

                // Track TikTok Pixel conversion
                if (typeof window !== 'undefined' && window.ttq) {
                    window.ttq.track('CompletePayment', {
                        value: totalKobo / 100,
                        currency: 'NGN',
                        content_type: 'product'
                    });
                }

                // Clear cart and saved shipping
                clearCart();
                localStorage.removeItem('remabell_shipping_region');
                localStorage.removeItem('remabell_shipping_location');

                router.push(`/order-success?reference=${transaction.reference}`);
            } else {
                alert('Payment verification failed. Please contact support.');
                setProcessing(false);
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            alert('An error occurred. Please contact support with your reference: ' + transaction.reference);
            setProcessing(false);
        }
    };

    const handlePaymentClose = () => {
        console.log('Payment popup closed');
    };

    const handleProceedToPayment = () => {
        if (!validateForm()) {
            const firstError = document.querySelector('.error-field');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }

        if (isOtherLocation) {
            alert('Please contact us on WhatsApp to arrange delivery to your location.');
            return false;
        }

        const order = createOrder({
            reference,
            cart,
            customer: {
                ...customer,
                shippingRegion,
                specificLocation,
                shippingFee
            },
            totalAmount: totalKobo / 100,
            shippingFee: shippingFee,
            paymentStatus: 'pending',
            consultationDateTime: hasConsultations ? consultationDateTime : null
        });
        saveOrder(order);

        return true;
    };

    // Check if form is complete for payment
    const isFormComplete = () => {
        if (!customer.email || !customer.firstName || !customer.lastName || !customer.phone) return false;
        if (hasPhysicalProducts) {
            if (!shippingRegion || !specificLocation || !customer.address) return false;
            if (isOtherLocation) return false;
        }
        if (hasConsultations && !consultationDateTime) return false;
        return true;
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid #E8EDE8', borderTopColor: '#2C5F5D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6B6B6B' }}>Loading checkout...</p>
                </div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#FAF8F5', fontFamily: "'Poppins', sans-serif" }}>
            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #F0F0F0', padding: '20px 24px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#2C5F5D,#1F4A48)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 600 }}>R</span>
                        </div>
                        <div>
                            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '18px', fontWeight: 600, color: '#2C2C2C', margin: 0, lineHeight: 1 }}>Remabell</p>
                            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '18px', fontStyle: 'italic', color: '#2C2C2C', margin: 0, lineHeight: 1 }}>Exquisite</p>
                        </div>
                    </a>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4CAF50', fontSize: '13px', fontWeight: 500 }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Secure Checkout</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 64px' }}>
                {/* Sunday Closure Notice Banner */}
                {isSunday && !sundayBannerDismissed && (
                    <div style={{
                        background: '#FFF4E6',
                        borderLeft: '4px solid #FB923C',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '24px',
                        maxWidth: '900px',
                        margin: '0 auto 24px',
                        position: 'relative',
                        animation: 'fadeIn 0.5s ease-in-out'
                    }}>
                        <button
                            onClick={() => setSundayBannerDismissed(true)}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                fontSize: '18px',
                                color: '#7C2D12',
                                opacity: 0.7
                            }}
                            aria-label="Dismiss notice"
                        >
                            ✕
                        </button>
                        <p style={{
                            color: '#7C2D12',
                            fontSize: '14px',
                            fontWeight: 500,
                            margin: 0,
                            paddingRight: '24px',
                            lineHeight: 1.5
                        }}>
                            📅 <strong>Sunday Notice:</strong> We're closed today for rest! You can still place your order, but it will be processed and dispatched on Monday morning. Thank you for understanding! 💛
                        </p>
                    </div>
                )}

                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 600, color: '#2C2C2C', marginBottom: '32px', textAlign: 'center' }}>
                    Secure Checkout
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>

                    {/* Customer Information Form */}
                    <section style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2C2C2C', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '28px', height: '28px', background: '#2C5F5D', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>1</span>
                            Customer Information
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            {/* First Name */}
                            <div className={errors.firstName ? 'error-field' : ''}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#2C2C2C', marginBottom: '6px' }}>
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={customer.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Enter first name"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: errors.firstName ? '2px solid #EF4444' : '2px solid #E8EDE8',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                                {errors.firstName && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.firstName}</p>}
                            </div>

                            {/* Last Name */}
                            <div className={errors.lastName ? 'error-field' : ''}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#2C2C2C', marginBottom: '6px' }}>
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={customer.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Enter last name"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: errors.lastName ? '2px solid #EF4444' : '2px solid #E8EDE8',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none'
                                    }}
                                />
                                {errors.lastName && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.lastName}</p>}
                            </div>

                            {/* Email */}
                            <div className={errors.email ? 'error-field' : ''}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#2C2C2C', marginBottom: '6px' }}>
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={customer.email}
                                    onChange={handleInputChange}
                                    placeholder="your@email.com"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: errors.email ? '2px solid #EF4444' : '2px solid #E8EDE8',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none'
                                    }}
                                />
                                {errors.email && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div className={errors.phone ? 'error-field' : ''}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#2C2C2C', marginBottom: '6px' }}>
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={customer.phone}
                                    onChange={handleInputChange}
                                    placeholder="08012345678"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: errors.phone ? '2px solid #EF4444' : '2px solid #E8EDE8',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none'
                                    }}
                                />
                                {errors.phone && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Consultation Date/Time - Only for virtual products */}
                        {hasConsultations && (
                            <div style={{ marginTop: '24px', padding: '20px', background: '#F0F7F6', borderRadius: '12px', border: '1px solid #2C5F5D20' }} className={errors.consultationDateTime ? 'error-field' : ''}>
                                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#2C5F5D', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Consultation Appointment
                                </h3>
                                <label style={{ display: 'block', fontSize: '13px', color: '#6B6B6B', marginBottom: '8px' }}>
                                    Select your preferred date and time for the consultation *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={consultationDateTime}
                                    onChange={(e) => {
                                        setConsultationDateTime(e.target.value);
                                        if (errors.consultationDateTime) setErrors(prev => ({ ...prev, consultationDateTime: '' }));
                                    }}
                                    min={new Date().toISOString().slice(0, 16)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: errors.consultationDateTime ? '2px solid #EF4444' : '2px solid #E8EDE8',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        background: 'white'
                                    }}
                                />
                                {errors.consultationDateTime && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.consultationDateTime}</p>}
                                <p style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '8px', fontStyle: 'italic' }}>
                                    We'll contact you to confirm the exact time within 24 hours
                                </p>
                            </div>
                        )}

                        {/* Order Notes */}
                        <div style={{ marginTop: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#2C2C2C', marginBottom: '6px' }}>
                                Order Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={customer.notes}
                                onChange={handleInputChange}
                                placeholder="Any special instructions or notes for your order..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #E8EDE8',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </section>

                    {/* Delivery Information - Only for physical products */}
                    {hasPhysicalProducts && (
                        <section style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2C2C2C', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '28px', height: '28px', background: '#2C5F5D', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>2</span>
                                Delivery Information
                            </h2>

                            {/* Shipping Region Selector */}
                            <div className={errors.shippingRegion ? 'error-field' : ''} style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '8px' }}>
                                    Select Your Delivery Region *
                                </label>
                                <select
                                    value={shippingRegion}
                                    onChange={(e) => handleRegionChange(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        border: errors.shippingRegion ? '2px solid #EF4444' : '2px solid #E8EDE8',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        outline: 'none',
                                        background: 'white',
                                        cursor: 'pointer',
                                        minHeight: '54px'
                                    }}
                                >
                                    <option value="">-- Choose your region --</option>
                                    <option value="lagos-mainland">Lagos Mainland (₦4,000)</option>
                                    <option value="lagos-island">Lagos Island (₦5,000)</option>
                                    <option value="outside-lagos">Outside Lagos (₦7,500)</option>
                                </select>
                                {errors.shippingRegion && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.shippingRegion}</p>}
                                <p style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '8px' }}>
                                    🚚 Mainland/Island: 1-2 days delivery • Outside Lagos: 3-5 days delivery
                                </p>
                            </div>

                            {/* Specific Location Dropdown - Conditional */}
                            {shippingRegion && (
                                <div
                                    className={errors.specificLocation ? 'error-field' : ''}
                                    style={{
                                        marginBottom: '20px',
                                        animation: 'fadeIn 0.3s ease'
                                    }}
                                >
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '8px' }}>
                                        Select Your Specific Location *
                                    </label>
                                    <select
                                        value={specificLocation}
                                        onChange={(e) => handleLocationChange(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            border: errors.specificLocation ? '2px solid #EF4444' : '2px solid #E8EDE8',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: 500,
                                            outline: 'none',
                                            background: 'white',
                                            cursor: 'pointer',
                                            minHeight: '54px'
                                        }}
                                    >
                                        <option value="">-- Choose your {shippingRegion === 'outside-lagos' ? 'state' : 'area'} --</option>
                                        {getLocationOptions().map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                    {errors.specificLocation && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.specificLocation}</p>}
                                </div>
                            )}

                            {/* Other Location Warning */}
                            {isOtherLocation && (
                                <div style={{
                                    padding: '16px',
                                    background: '#FEF3C7',
                                    borderRadius: '12px',
                                    border: '1px solid #F59E0B',
                                    marginBottom: '20px'
                                }}>
                                    <p style={{ fontSize: '14px', color: '#92400E', fontWeight: 500, margin: 0 }}>
                                        ⚠️ Please contact us on WhatsApp to arrange delivery to your location.
                                    </p>
                                    <a
                                        href="https://wa.me/2347080803226"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '12px',
                                            padding: '10px 20px',
                                            background: '#25D366',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Contact WhatsApp
                                    </a>
                                </div>
                            )}

                            {/* Street Address */}
                            <div className={errors.address ? 'error-field' : ''} style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '8px' }}>
                                    Street Address *
                                </label>
                                <textarea
                                    name="address"
                                    value={customer.address}
                                    onChange={handleInputChange}
                                    placeholder="House number, street name, landmarks..."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: errors.address ? '2px solid #EF4444' : '2px solid #E8EDE8',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                {errors.address && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.address}</p>}
                            </div>

                            {/* Delivery Fee Display */}
                            {shippingRegion && !isOtherLocation && (
                                <div style={{
                                    padding: '20px',
                                    background: '#F0F7F6',
                                    borderRadius: '12px',
                                    border: '2px solid #2C5F5D30',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '24px' }}>🚚</span>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#2C2C2C', margin: 0 }}>Delivery Fee</p>
                                            <p style={{ fontSize: '12px', color: '#6B6B6B', margin: 0 }}>{getDeliveryTimeline()} delivery</p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#2C5F5D', margin: 0 }}>
                                        ₦{shippingFee.toLocaleString('en-NG')}
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Order Summary */}
                    <section style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2C2C2C', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '28px', height: '28px', background: '#2C5F5D', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{hasPhysicalProducts ? '3' : '2'}</span>
                            Order Summary
                        </h2>

                        {/* Cart Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', background: '#FAF8F5', borderRadius: '12px' }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '11px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{item.brand}</p>
                                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#2C2C2C', marginBottom: '4px' }}>{item.name}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', color: '#6B6B6B' }}>Qty: {item.quantity}</span>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#2C5F5D' }}>{item.price}</span>
                                        </div>
                                        {item.isVirtual && (
                                            <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 8px', background: '#2C5F5D20', color: '#2C5F5D', fontSize: '11px', fontWeight: 500, borderRadius: '4px' }}>
                                                Virtual Product
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Totals */}
                        <div style={{ borderTop: '1px solid #E8EDE8', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#6B6B6B' }}>Items Subtotal</span>
                                <span style={{ fontWeight: 500 }}>{subtotalDisplay}</span>
                            </div>

                            {hasPhysicalProducts && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                    <span style={{ color: '#6B6B6B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        🚚 Delivery
                                    </span>
                                    {shippingDisplay ? (
                                        <span style={{ fontWeight: 600, color: '#2C5F5D' }}>{shippingDisplay}</span>
                                    ) : (
                                        <span style={{ fontWeight: 500, color: '#9CA3AF', fontSize: '13px' }}>Select region above</span>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '2px solid #2C5F5D', marginTop: '8px' }}>
                                <span style={{ fontSize: '18px', fontWeight: 600, color: '#2C2C2C' }}>Order Total</span>
                                <span style={{ fontSize: '24px', fontWeight: 700, color: '#2C5F5D' }}>{totalDisplay}</span>
                            </div>
                        </div>
                    </section>

                    {/* Payment Section */}
                    <section style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2C2C2C', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '28px', height: '28px', background: '#2C5F5D', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{hasPhysicalProducts ? '4' : '3'}</span>
                            Payment
                        </h2>

                        {/* Validation Warning */}
                        {!isFormComplete() && (
                            <div style={{
                                padding: '16px',
                                background: '#FEF3C7',
                                borderRadius: '12px',
                                border: '1px solid #F59E0B',
                                marginBottom: '24px'
                            }}>
                                <p style={{ fontSize: '14px', color: '#92400E', fontWeight: 500, margin: 0 }}>
                                    ⚠️ Please complete all delivery information above to proceed with payment.
                                </p>
                            </div>
                        )}

                        {/* Payment Method Display */}
                        <div style={{ padding: '16px', background: '#FAF8F5', borderRadius: '12px', marginBottom: '24px' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C2C2C', marginBottom: '8px' }}>
                                Debit/Credit Cards (Paystack Secure Checkout)
                            </p>
                            <p style={{ fontSize: '13px', color: '#6B6B6B' }}>
                                Pay securely with Mastercard, Visa, Verve, or Bank Transfer. 100% safe and encrypted.
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <div style={{ padding: '6px 12px', background: 'white', borderRadius: '6px', border: '1px solid #E8EDE8' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1F71' }}>VISA</span>
                                </div>
                                <div style={{ padding: '6px 12px', background: 'white', borderRadius: '6px', border: '1px solid #E8EDE8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#EB001B', borderRadius: '50%' }} />
                                    <div style={{ width: '12px', height: '12px', background: '#F79E1B', borderRadius: '50%', marginLeft: '-4px' }} />
                                </div>
                                <div style={{ padding: '6px 12px', background: 'white', borderRadius: '6px', border: '1px solid #E8EDE8' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#00425F' }}>VERVE</span>
                                </div>
                                <div style={{ padding: '6px 12px', background: 'white', borderRadius: '6px', border: '1px solid #E8EDE8' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B6B6B' }}>Bank Transfer</span>
                                </div>
                            </div>
                        </div>

                        {/* Paystack Payment Button */}
                        <PaystackPopup
                            email={customer.email}
                            amount={totalKobo}
                            reference={reference}
                            metadata={{
                                customer_name: `${customer.firstName} ${customer.lastName}`,
                                phone: customer.phone,
                                items_count: cart.length,
                                shipping_region: shippingRegion || 'N/A',
                                delivery_location: specificLocation || 'N/A',
                                shipping_fee: shippingFee,
                                delivery_timeline: hasPhysicalProducts ? getDeliveryTimeline() : 'N/A',
                                street_address: customer.address || 'N/A',
                                cart_items: JSON.stringify(cart.map(item => ({
                                    name: item.name,
                                    quantity: item.quantity,
                                    price: item.price
                                })))
                            }}
                            onSuccess={handlePaymentSuccess}
                            onClose={handlePaymentClose}
                            disabled={processing || !isFormComplete() || isOtherLocation}
                            buttonText={processing ? 'Processing...' : `Pay ${totalDisplay} Securely`}
                        />

                        {/* Trust Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginTop: '24px', padding: '16px', background: '#F0F7F6', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4CAF50', fontWeight: 500 }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                SSL Secured
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#2C5F5D', fontWeight: 500 }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Verified by Paystack
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#C9B98F', fontWeight: 500 }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                100% Original Products
                            </div>
                        </div>

                        {/* Alternative: WhatsApp Order */}
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <p style={{ fontSize: '13px', color: '#6B6B6B', marginBottom: '8px' }}>Prefer to order via WhatsApp?</p>
                            <a
                                href="https://wa.me/2347080803226"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: '#25D36620',
                                    border: '2px solid #25D366',
                                    borderRadius: '10px',
                                    color: '#25D366',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    textDecoration: 'none'
                                }}
                            >
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Contact Us on WhatsApp
                            </a>
                        </div>
                    </section>

                </div>
            </main>

            {/* Secure Footer */}
            <footer style={{ background: '#2C2C2C', color: 'white', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                    Your payment is secured by Paystack, Nigeria's leading payment processor
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    © 2026 Remabell Exquisite. All rights reserved.
                </p>
            </footer>

            {/* Animations */}
            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
