'use client';

import { useState } from 'react';
import { addToCart, generateProductWhatsAppLink } from '../lib/cart';

export default function ProductCard({ product, onQuickView, onCartUpdate }) {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);
        addToCart(product, 1);
        if (onCartUpdate) onCartUpdate();

        setTimeout(() => setIsAdding(false), 1000);
    };

    const whatsappLink = generateProductWhatsAppLink(product);

    return (
        <div className="group bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 card-lift">
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img
                    src={product.image}
                    alt={`${product.brand} ${product.name}`}
                    className="w-full h-full object-cover img-zoom"
                    loading="lazy"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* ORIGINAL Badge */}
                <div className="absolute top-3 left-3">
                    <div className="px-2.5 py-1 bg-white/95 backdrop-blur-sm shadow-sm">
                        <span className="text-[9px] font-bold text-black tracking-widest uppercase">✓ Original</span>
                    </div>
                </div>

                {/* Quick View Button */}
                <button
                    onClick={() => onQuickView(product)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                >
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>

                {/* Hover Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 space-y-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="btn-shine flex items-center justify-center gap-2 w-full py-2.5 bg-black text-white text-[10px] font-semibold tracking-widest uppercase disabled:bg-gray-600"
                    >
                        {isAdding ? (
                            <>
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Added!
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-[9px] text-gray-400 tracking-widest uppercase mb-1">{product.brand}</p>
                <h3 className="font-serif text-sm text-black mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-black">{product.price}</span>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-green-600 hover:text-green-700 font-semibold tracking-wider uppercase flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Order
                    </a>
                </div>
            </div>
        </div>
    );
}
