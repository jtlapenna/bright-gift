import OpenAI from 'openai';

export async function GET({ locals }: { locals: any }) {
  try {
    const env = locals?.runtime?.env || {};
    const rawKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const normalizedKey = typeof rawKey === 'string' ? rawKey.trim().replace(/^"|"$/g, '') : rawKey;
    const rawProject = env.OPENAI_PROJECT || env.OPENAI_PROJECT_ID || process.env.OPENAI_PROJECT || process.env.OPENAI_PROJECT_ID;
    const project = typeof rawProject === 'string' ? rawProject.trim().replace(/^"|"$/g, '') : undefined;
    const hasOpenAIKey = Boolean(normalizedKey);
    const keySource = env.OPENAI_API_KEY ? 'locals.runtime.env' : (process.env.OPENAI_API_KEY ? 'process.env' : 'none');

    const redacted = (val?: string) => (val ? `${val.slice(0, 3)}***${val.slice(-2)}` : undefined);

    const envKeys = Object.keys(env).sort();
    const details: Record<string, any> = {
      runtime: {
        adapter: 'cloudflare',
        hasLocals: Boolean(locals),
        hasRuntime: Boolean(locals?.runtime),
        hasEnv: Boolean(locals?.runtime?.env),
      },
      envBindings: envKeys,
      openai: {
        hasKey: hasOpenAIKey,
        keySource,
        keyPrefix: typeof normalizedKey === 'string' ? normalizedKey.slice(0, 6) : undefined,
        keyLength: typeof normalizedKey === 'string' ? normalizedKey.length : undefined,
        projectPresent: Boolean(project),
        projectPreview: typeof project === 'string' ? `${(project as string).slice(0, 4)}***` : undefined,
      },
    };

    // Try a lightweight authenticated call to verify the key works
    if (hasOpenAIKey) {
      const apiKey = normalizedKey as string;
      const openai = new OpenAI(project ? { apiKey, project } : { apiKey });
      try {
        // List models; this should be cheap and confirms auth
        const res = await openai.models.list();
        details.openai.test = { ok: true, total: res.data?.length ?? 0 };
      } catch (e: any) {
        details.openai.test = { ok: false, error: String(e?.message || e) };
      }
    }

    return new Response(JSON.stringify(details), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST() {
  return new Response(JSON.stringify({ error: 'Use GET' }), { status: 405 });
}


