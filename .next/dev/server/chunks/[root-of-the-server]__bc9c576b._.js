module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [middleware] (ecmascript)");
;
// Define protected routes
const protectedRoutes = [
    '/'
];
const publicRoutes = [
    '/api/health',
    '/healthcheck'
];
// Simple in-memory cache for token verification (valid for 30 seconds)
const tokenCache = new Map();
async function verifyToken(token) {
    // Check cache first
    const cached = tokenCache.get(token);
    if (cached && cached.expires > Date.now()) {
        console.log('[Platform Middleware] Using cached token verification');
        return cached.valid;
    }
    try {
        // Verify token with ff-auth service (the single source of truth)
        const response = await fetch('http://localhost:6800/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const isValid = response.ok;
        // Cache the result for 30 seconds
        tokenCache.set(token, {
            valid: isValid,
            expires: Date.now() + 30000
        });
        return isValid;
    } catch (error) {
        console.error('[Platform Middleware] Token verification failed:', error);
        return false;
    }
}
async function proxy(request) {
    const { pathname, searchParams } = request.nextUrl;
    console.log('[Platform Proxy] Request:', pathname);
    // Allow public routes (health checks, etc.)
    const isPublicRoute = publicRoutes.some((route)=>pathname.startsWith(route));
    if (isPublicRoute) {
        console.log('[Platform Middleware] Public route, allowing access');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Check for authentication token in cookies OR URL query parameter
    let token = request.cookies.get('furfield_token')?.value;
    const tokenFromUrl = searchParams.get('token');
    // If token in URL but not in cookie, use URL token and set cookie
    if (!token && tokenFromUrl) {
        token = tokenFromUrl;
        console.log('[Platform Middleware] Token found in URL, will set cookie');
    }
    console.log('[Platform Middleware] Token found:', !!token);
    if (!token) {
        console.log('[Platform Middleware] No token found, redirecting to auth');
        // No token - redirect to ff-auth
        const loginUrl = new URL('http://localhost:6800/login');
        loginUrl.searchParams.set('returnUrl', request.url);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    // Verify token
    const isValid = await verifyToken(token);
    console.log('[Platform Middleware] Token valid:', isValid);
    if (!isValid) {
        console.log('[Platform Middleware] Invalid token, redirecting to auth');
        // Invalid token - clear cookies and redirect to ff-auth
        const loginUrl = new URL('http://localhost:6800/login');
        loginUrl.searchParams.set('returnUrl', request.url);
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
        response.cookies.delete('furfield_token');
        response.cookies.delete('furfield_user');
        return response;
    }
    console.log('[Platform Proxy] Token valid, allowing access');
    // If token was from URL, set it as cookie and redirect to clean URL
    if (tokenFromUrl) {
        console.log('[Platform Proxy] Token from URL, setting cookie and redirecting');
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(pathname, request.url));
        response.cookies.set('furfield_token', token, {
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
            httpOnly: false,
            sameSite: 'lax',
            secure: false
        });
        console.log('[Platform Proxy] Cookie set, redirecting to:', pathname);
        return response;
    }
    console.log('[Platform Proxy] Token from cookie, allowing access');
    // Valid token - allow access
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */ '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)'
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bc9c576b._.js.map