"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
async function GET({ locals, request, params, site, env }) {
    // Try to access env vars via Cloudflare runtime context
    return new Response(JSON.stringify({
        now: Date.now(),
        env: env || {},
        locals: locals || {}
    }, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
