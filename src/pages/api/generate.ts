import { buildPrompt } from '../../utils/promptBuilder.js';
import OpenAI from 'openai';

// Helper to fetch Etsy product for a keyword
async function fetchEtsyProduct(keywords: string, apiKey: string) {
  const url = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(keywords)}&limit=1&includes=images`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    console.error('Etsy API error:', res.status, await res.text());
    return null;
  }
  const data = await res.json();
  const product = data.results?.[0];
  if (!product) {
    console.warn('No Etsy product found for', keywords);
    return null;
  }
  const imageUrl = product.images?.[0]?.url_fullxfull || null;
  if (!imageUrl) {
    console.warn('No image found for Etsy product', product);
  }
  return {
    url: product.url,
    image: imageUrl
  };
}

// Phosphor icon mapping for Amazon placeholders
const amazonCategoryIconMap = {
  tech: 'DeviceMobile',
  electronics: 'DeviceMobile',
  books: 'Book',
  fashion: 'TShirt',
  apparel: 'TShirt',
  clothing: 'TShirt',
  home: 'House',
  decor: 'House',
  outdoor: 'Tree',
  gear: 'Tree',
  kitchen: 'CookingPot',
  food: 'CookingPot',
  toys: 'PuzzlePiece',
  games: 'PuzzlePiece',
  beauty: 'Lipstick',
  personal: 'Lipstick',
  sports: 'SoccerBall',
  pets: 'PawPrint',
  baby: 'Baby',
  automotive: 'Car',
  office: 'Briefcase',
  music: 'MusicNote',
  health: 'Heartbeat',
  generic: 'ShoppingBag'
};

function getAmazonIcon(tag: string) {
  const lower = tag.toLowerCase();
  for (const [key, icon] of Object.entries(amazonCategoryIconMap)) {
    if (lower.includes(key)) return icon;
  }
  return amazonCategoryIconMap.generic;
}

export async function GET() {
  return new Response(
    JSON.stringify({ error: 'This endpoint only supports POST for gift idea generation.' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST({ request, locals }: { request: any, locals: any }) {
  console.log('POST /api/generate invoked');
  let data;
  try {
    data = await request.json();
    console.log('POST /api/generate received data:', data);
    const { recipient, interests, budget, style } = data;
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

    // Get Etsy API key from env (not OAuth2 token)
    const etsyApiKey = locals?.runtime?.env?.ETSY_API_KEY;
    // Log presence of Etsy API key (not the value)
    if (etsyApiKey) {
      console.log('Etsy API key found in environment.');
    } else {
      console.warn('Etsy API key NOT found in environment. Etsy integration will not work.');
    }

    const openai = new OpenAI({ apiKey });
    const prompt = buildPrompt({ recipient, interests, budget, style });

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
      if (/handmade|etsy/i.test(tag) && etsyApiKey) {
        // Try to fetch Etsy product using API key
        const product = await fetchEtsyProduct(title, etsyApiKey);
        if (product) {
          link = product.url;
          image = product.image;
        } else {
          link = `https://www.etsy.com/search?q=${encodeURIComponent(title)}`;
          image = '/placeholders/handmade.jpg';
        }
        ideas.push({ title, description, tag, link, image });
      } else {
        // Fallback: Amazon search (no image, use icon)
        link = `https://www.amazon.com/s?k=${encodeURIComponent(title)}&tag=bright-gift-20`;
        const icon = getAmazonIcon(tag);
        ideas.push({ title, description, tag, link, icon });
      }
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
    console.error('POST /api/generate error:', error);
    return new Response(JSON.stringify({ error: error && error.message ? error.message : String(error) }), { status: 500 });
  }
} 