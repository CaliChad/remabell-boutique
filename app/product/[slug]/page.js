import { notFound } from 'next/navigation';
import { shopProducts, productSlug, getProductBySlug } from '../../../lib/products';
import ProductDetail from './ProductDetail';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.remabellexquisite.ng').replace(/\/$/, '');

// Build a page for every product when the site is deployed
export function generateStaticParams() {
    return shopProducts.map(p => ({ slug: productSlug(p) }));
}

// What WhatsApp, Instagram, Meta and Google show when the link is shared
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = getProductBySlug(slug);
    if (!product) return { title: 'Product not found | Remabell Exquisite' };

    const url = `${SITE_URL}/product/${productSlug(product)}`;
    const image = SITE_URL + encodeURI(product.image);
    const title = `${product.name} - ${product.price} | Remabell Exquisite`;
    const description = product.description && product.description !== product.name
        ? product.description
        : `${product.name} - 100% original, ${product.price}. Delivery across Lagos, Nigeria and worldwide.`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title: `${product.name} - ${product.price}`,
            description,
            url,
            siteName: 'Remabell Exquisite',
            images: [{ url: image, width: 1080, height: 1350, alt: product.name }],
            type: 'website'
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} - ${product.price}`,
            description,
            images: [image]
        }
    };
}

export default async function ProductPage({ params }) {
    const { slug } = await params;
    const product = getProductBySlug(slug);
    if (!product) notFound();

    const related = shopProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return <ProductDetail product={product} related={related} />;
}
