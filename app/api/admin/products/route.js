import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { verifyRequestAuth } from '@/lib/adminAuth';

const PRODUCTS_FILE = path.join(process.cwd(), 'lib', 'products.js');

function extractProducts(raw) {
    // Split on the categories export to isolate the products array section
    const cutoff = raw.indexOf('\nexport const categories');
    if (cutoff === -1) throw new Error('Could not find categories export in products.js');
    const productSection = raw.slice(0, cutoff);
    const arrayStart = productSection.indexOf('[');
    if (arrayStart === -1) throw new Error('Could not find products array in products.js');
    let arrayText = productSection.slice(arrayStart).trimEnd().replace(/;?\s*$/, '');
    // Strip single-line JS comments (e.g. // Consultation Services) before JSON parsing
    arrayText = arrayText.replace(/\/\/[^\n]*/g, '');
    return JSON.parse(arrayText);
}

function buildNewContent(raw, updatedProducts) {
    const cutoff = raw.indexOf('\nexport const categories');
    if (cutoff === -1) throw new Error('Could not find categories export in products.js');
    const afterProducts = raw.slice(cutoff);
    const header = '// Product catalog\n// Currency: Nigerian Naira (₦)\n\nexport const products = ';
    return header + JSON.stringify(updatedProducts, null, 4) + ';\n' + afterProducts.trimStart();
}

function formatPrice(raw) {
    const n = parseInt(String(raw).replace(/[₦,\s]/g, ''), 10);
    if (isNaN(n) || n <= 0) throw new Error('Invalid price value');
    return `₦${n.toLocaleString('en-NG')}`;
}

export async function GET(request) {
    if (!verifyRequestAuth(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const raw = await readFile(PRODUCTS_FILE, 'utf-8');
        const products = extractProducts(raw);
        return NextResponse.json({ success: true, products });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!verifyRequestAuth(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
    }

    const { name, price, category, description, inStock, image, images } = body;

    if (!name || !name.trim()) {
        return NextResponse.json({ success: false, message: 'Product name is required' }, { status: 400 });
    }
    if (!price) {
        return NextResponse.json({ success: false, message: 'Price is required' }, { status: 400 });
    }

    try {
        const raw = await readFile(PRODUCTS_FILE, 'utf-8');
        const products = extractProducts(raw);

        const newId = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
        const primaryImage = (images && images.length > 0) ? images[0] : (image || '');

        const newProduct = {
            id: newId,
            name: name.trim(),
            brand: body.brand || 'Generic',
            category: category || 'Uncategorized',
            description: description || name.trim(),
            price: formatPrice(price),
            image: primaryImage,
            inStock: inStock !== false,
        };

        if (images && images.length > 1) {
            newProduct.images = images;
        }

        products.push(newProduct);

        const newContent = buildNewContent(raw, products);
        await writeFile(PRODUCTS_FILE, newContent, 'utf-8');

        return NextResponse.json({ success: true, product: newProduct });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(request) {
    if (!verifyRequestAuth(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
    }

    const { id } = body;
    if (!id) {
        return NextResponse.json({ success: false, message: 'Product id is required' }, { status: 400 });
    }

    try {
        const raw = await readFile(PRODUCTS_FILE, 'utf-8');
        const products = extractProducts(raw);

        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        const existing = products[idx];
        const updated = { ...existing };

        if (body.name !== undefined) updated.name = body.name.trim();
        if (body.brand !== undefined) updated.brand = body.brand;
        if (body.category !== undefined) updated.category = body.category;
        if (body.description !== undefined) updated.description = body.description;
        if (body.inStock !== undefined) updated.inStock = body.inStock;
        if (body.price !== undefined) updated.price = formatPrice(body.price);
        if (body.image !== undefined) updated.image = body.image;
        if (body.images !== undefined) {
            updated.images = body.images;
            if (body.images.length > 0) updated.image = body.images[0];
        }

        products[idx] = updated;

        const newContent = buildNewContent(raw, products);
        await writeFile(PRODUCTS_FILE, newContent, 'utf-8');

        return NextResponse.json({ success: true, product: updated });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    if (!verifyRequestAuth(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'), 10);

    if (!id || isNaN(id)) {
        return NextResponse.json({ success: false, message: 'Valid product id is required' }, { status: 400 });
    }

    try {
        const raw = await readFile(PRODUCTS_FILE, 'utf-8');
        const products = extractProducts(raw);

        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        products.splice(idx, 1);

        const newContent = buildNewContent(raw, products);
        await writeFile(PRODUCTS_FILE, newContent, 'utf-8');

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
