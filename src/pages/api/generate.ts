import { buildPrompt, type PromptData } from '../../utils/promptBuilder.js';
import OpenAI from 'openai';

// Helper to fetch Etsy product for a keyword
async function fetchEtsyProduct(keywords, token) {
  const url = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(keywords)}&limit=1&includes=images`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) return null;
  const data = await res.json();
  const product = data.results?.[0];
  if (!product) return null;
  return {
    url: product.url,
    image: product.images?.[0]?.url_fullxfull || null
  };
}

export const POST = async ({ request, locals }) => {
  const data = await request.json();
  const { recipient, interests, budget, style } = data as PromptData;

  if (!recipient || !interests || !budget) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400 }
    );
  }

  // Get the OpenAI API key from Cloudflare SSR runtime context
  const apiKey = locals?.runtime?.env?.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not found in SSR runtime context' }),
      { status: 500 }
    );
  }

  // Get Etsy OAuth2 token from env
  const etsyToken = locals?.runtime?.env?.ETSY_OAUTH_TOKEN;

  const openai = new OpenAI({ apiKey });
  const prompt = buildPrompt({ recipient, interests, budget, style });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that suggests thoughtful and creative gift ideas.' },
        { role: 'user', content: prompt },
      ],
    });
    const ideasText = completion.choices[0]?.message?.content?.trim() || '';

    // Parse markdown output into ideas (simple regex for demo)
    const ideaRegex = /\*\*(\d+\.\s+.+?)\*\*\s+([^_]+)_Tag: ([^_]+)_/g;
    let match;
    const ideas = [];
    while ((match = ideaRegex.exec(ideasText)) !== null) {
      const title = match[1].replace(/^\d+\.\s*/, '');
      const description = match[2].trim();
      const tag = match[3].trim();
      let link = null;
      let image = null;
      if (/handmade|etsy/i.test(tag) && etsyToken) {
        // Try to fetch Etsy product
        const product = await fetchEtsyProduct(title, etsyToken);
        if (product) {
          link = product.url;
          image = product.image;
        } else {
          link = `https://www.etsy.com/search?q=${encodeURIComponent(title)}`;
          image = '/placeholders/handmade.jpg';
        }
      } else {
        // Fallback: Amazon search (no image)
        link = `https://www.amazon.com/s?k=${encodeURIComponent(title)}&tag=bright-gift-20`;
        image = '/placeholders/amazon.jpg';
      }
      ideas.push({ title, description, tag, link, image });
    }

    // Always return an array; fallback if parsing fails
    if (ideas.length === 0) {
      ideas.push({
        title: "Sorry, no gift ideas found.",
        description: "We couldn't parse the AI's response. Please try again or adjust your search.",
        tag: "",
        link: "#",
        image: "/placeholders/handmade.jpg"
      });
    }

    return new Response(JSON.stringify({ ideas }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({ error: error?.message || String(error) }), { status: 500 });
  }
}; 