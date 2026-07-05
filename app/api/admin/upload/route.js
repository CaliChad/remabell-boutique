import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { verifyRequestAuth } from '@/lib/adminAuth';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request) {
    if (!verifyRequestAuth(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let formData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json({ success: false, message: 'Failed to parse form data' }, { status: 400 });
    }

    const file = formData.get('file');

    if (!file || typeof file === 'string') {
        return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
            { success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
            { status: 400 }
        );
    }

    if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
            { success: false, message: 'File too large. Maximum size is 10 MB.' },
            { status: 400 }
        );
    }

    // Sanitize filename: allow only safe characters
    const originalName = file.name || 'upload.jpg';
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const baseName = path.basename(originalName, ext);
    const safeName = baseName.replace(/[^a-zA-Z0-9._\-]/g, '-').toLowerCase();
    const timestamp = Date.now();
    const filename = `${safeName}-${timestamp}${ext}`;

    try {
        const uploadDir = path.join(process.cwd(), 'public', 'products');
        await mkdir(uploadDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({ success: true, url: `/products/${filename}` });
    } catch (err) {
        return NextResponse.json({ success: false, message: `Upload failed: ${err.message}` }, { status: 500 });
    }
}
