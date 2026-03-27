import { createHmac, timingSafeEqual } from 'crypto';

export const COOKIE_NAME = 'remabell_admin_token';
const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

function getSecret() {
    const s = process.env.ADMIN_PASSWORD;
    if (!s) throw new Error('ADMIN_PASSWORD environment variable is not set');
    return s;
}

export function generateToken() {
    const ts = Date.now().toString();
    const mac = createHmac('sha256', getSecret()).update(ts).digest('hex');
    return `${ts}.${mac}`;
}

export function verifyToken(token) {
    const parts = (token || '').split('.');
    if (parts.length < 2) return false;
    const mac = parts.pop();
    const ts = parts.join('.');
    if (!ts || !mac) return false;
    if (Date.now() - parseInt(ts, 10) > MAX_AGE_MS) return false;
    const expected = createHmac('sha256', getSecret()).update(ts).digest('hex');
    try {
        const macBuf = Buffer.from(mac, 'hex');
        const expectedBuf = Buffer.from(expected, 'hex');
        if (macBuf.length !== expectedBuf.length) return false;
        return timingSafeEqual(macBuf, expectedBuf);
    } catch {
        return false;
    }
}

export function verifyRequestAuth(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) return false;
    return verifyToken(decodeURIComponent(match[1]));
}

export function buildSetCookieHeader(token) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly${secure}; SameSite=Strict; Max-Age=28800; Path=/`;
}

export function buildClearCookieHeader() {
    return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/`;
}
