export async function GET({ locals, request, params, site, env }: { locals: any, request: any, params: any, site: any, env: any }) {
  // Try to access env vars via Cloudflare runtime context
  return new Response(
    JSON.stringify({
      now: Date.now(),
      env: env || {},
      locals: locals || {}
    }, null, 2),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
} 