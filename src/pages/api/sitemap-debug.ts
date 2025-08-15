import { getCollection } from 'astro:content';

export async function GET() {
  try {
    const all = await getCollection('blog');
    const published = await getCollection('blog', ({ data }) => {
      const status = (data as any).status || 'published';
      const isDraft = Boolean((data as any).draft);
      return status === 'published' && !isDraft;
    });

    const summary = {
      totalAll: all.length,
      totalPublished: published.length,
      sampleAll: all.slice(0, 10).map(p => ({ slug: p.slug, status: (p.data as any).status, draft: (p.data as any).draft })),
      samplePublished: published.slice(0, 10).map(p => ({ slug: p.slug })),
      allSlugs: all.map(p => p.slug),
      publishedSlugs: published.map(p => p.slug)
    };

    return new Response(JSON.stringify(summary, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}

