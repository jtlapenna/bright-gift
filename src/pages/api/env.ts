export async function GET() {
  // Return all environment variables as JSON (for debugging only!)
  return new Response(
    JSON.stringify(process.env, null, 2),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
} 