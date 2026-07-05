import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { generateToken, buildSetCookieHeader, buildClearCookieHeader } from '@/lib/adminAuth';

export async function POST(request) {
    let password = '';
    try {
        const body = await request.json();
        password = body.password || '';
    } catch {
        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const expected = process.env.ADMIN_PASSWORD || '';

    if (!expected) {
        return NextResponse.json(
            { success: false, message: 'Admin password not configured. Set ADMIN_PASSWORD environment variable.' },
            { status: 500 }
        );
    }

    let valid = false;
    try {
        const inputBuf = Buffer.from(password);
        const expectedBuf = Buffer.from(expected);
        if (inputBuf.length === expectedBuf.length) {
            valid = timingSafeEqual(inputBuf, expectedBuf);
        }
    } catch {
        valid = false;
    }

    if (!valid) {
        await new Promise(r => setTimeout(r, 300)); // slow down brute-force
        return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    const token = generateToken();
    return NextResponse.json({ success: true }, {
        headers: { 'Set-Cookie': buildSetCookieHeader(token) }
    });
}

export async function DELETE() {
    return NextResponse.json({ success: true }, {
        headers: { 'Set-Cookie': buildClearCookieHeader() }
    });
}
