import { buildPrompt } from '../../utils/promptBuilder.js';
import OpenAI from 'openai';

// Helper to generate Bookshop.org affiliate link
function generateBookshopLink(keywords: string, affiliateId: string) {
  // Bookshop.org uses a simple search URL format with affiliate tracking
  const searchQuery = encodeURIComponent(keywords);
  return `https://bookshop.org/search?keywords=${searchQuery}&affiliate=${affiliateId}`;
}

// Helper to generate direct Bookshop.org book link (when ISBN is available)
function generateBookshopDirectLink(isbn: string, affiliateId: string) {
  return `https://bookshop.org/a/${affiliateId}/${isbn}`;
}

// Helper to generate better Amazon search links
function generateAmazonLink(title: string, tag: string) {
  // Extract key search terms from title for better results
  const searchTerms = title
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .split(' ')
    .filter(word => word.length > 2) // Filter out short words
    .slice(0, 4) // Take first 4 meaningful words
    .join(' ');
  
  return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerms)}&tag=bright-gift-20`;
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
  decor: 'FrameCorners', // decor
  outdoor: 'Backpack', // outdoor gear
  'outdoor gear': 'Backpack', // outdoor gear
  gear: 'Backpack', // outdoor gear
  kitchen: 'CookingPot',
  food: 'CookingPot',
  toys: 'PuzzlePiece',
  games: 'PuzzlePiece',
  beauty: 'Sparkle', // beauty/makeup
  makeup: 'Sparkle', // beauty/makeup
  personal: 'Flower',
  personalized: 'Gift', // personalized gift
  'personalized gift': 'Gift', // personalized gift
  sports: 'SoccerBall',
  pets: 'PawPrint',
  baby: 'Baby',
  automotive: 'Car',
  office: 'Briefcase',
  music: 'MusicNote',
  health: 'Heartbeat',
  generic: 'ShoppingBag',
  jewelry: 'Diamond', // jewelry
  'art supplies': 'PaintBrush',
  craft: 'Scissors',
  art: 'Palette',
  gadgets: 'DeviceMobile',
  film: 'FilmSlate',
  lighting: 'Lamp',
  stationary: 'Note',
  stationery: 'Note',
  entertainment: 'Ticket',
  safety: 'Shield',
  helmet: 'Shield',
  'reading accessories': 'Book',
  'literary gifts': 'Book',
  'book journal': 'Note'
};

function getAmazonIcon(tag: string) {
  const lower = tag.toLowerCase();
  for (const [key, icon] of Object.entries(amazonCategoryIconMap)) {
    if (lower.includes(key)) return icon;
  }
  return amazonCategoryIconMap.generic;
}

// Helper to determine if an item should go to Bookshop.org or Amazon
function determineAffiliateSource(title: string, tag: string, styles: string[]) {
  const lowerTitle = title.toLowerCase();
  const lowerTag = tag.toLowerCase();
  
  // Check if book-lover style is selected
  const isBookLoverStyle = styles && styles.includes('book-lover');
  
  // For book-lover style, use specific categorization
  if (isBookLoverStyle) {
    // Books go to Bookshop.org - must be tagged exactly as "Book" or contain "book" but not "journal" or "accessory"
    if (lowerTag === 'book' || 
        (lowerTag.includes('book') && !lowerTag.includes('journal') && !lowerTag.includes('accessory') && !lowerTag.includes('gift'))) {
      return 'bookshop';
    }
    
    // Reading accessories and literary gifts go to Amazon
    if (lowerTag === 'reading accessories' || 
        lowerTag === 'literary gifts' || 
        lowerTag === 'book journal' ||
        lowerTag.includes('bookmark') ||
        lowerTag.includes('reading light') ||
        lowerTag.includes('book stand') ||
        lowerTag.includes('reading journal') ||
        lowerTag.includes('journal') ||
        lowerTag.includes('accessory')) {
      return 'amazon';
    }
  }
  
  // Fallback logic for non-book-lover styles - be more specific about books
  if (lowerTag === 'book' || 
      (lowerTag.includes('book') && !lowerTag.includes('journal') && !lowerTag.includes('accessory')) ||
      (lowerTag.includes('fiction') || lowerTag.includes('nonfiction') || lowerTag.includes('novel') || lowerTag.includes('poetry')) &&
      !lowerTag.includes('journal') && !lowerTag.includes('accessory')) {
    return 'bookshop';
  }
  
  // Everything else goes to Amazon
  return 'amazon';
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
    const { recipient, interests, budget, styles } = data;
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

    // Get Bookshop.org affiliate ID from env
    const bookshopAffiliateId = locals?.runtime?.env?.BOOKSHOP_AFFILIATE_ID || 'brightgift';
    console.log('Bookshop.org affiliate ID:', bookshopAffiliateId);

    const openai = new OpenAI({ apiKey });
    const prompt = buildPrompt({ recipient, interests, budget, styles });

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
      let icon = null;
      
      // Determine affiliate source based on improved logic
      const affiliateSource = determineAffiliateSource(title, tag, styles);
      
      if (affiliateSource === 'bookshop') {
        // Bookshop.org for book-related items
        link = generateBookshopLink(title, bookshopAffiliateId);
        icon = 'Book';
      } else {
        // Amazon for everything else
        link = generateAmazonLink(title, tag);
        icon = getAmazonIcon(tag);
      }
      
      ideas.push({ title, description, tag, link, icon });
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
    
    // Provide user-friendly error messages based on error type
    let userMessage = "We're having trouble generating gift ideas right now. Please try again in a moment.";
    let statusCode = 500;
    
    if (error?.message) {
      const errorMessage = error.message.toLowerCase();
      
      // Handle OpenAI API quota/billing errors
      if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('429')) {
        userMessage = "We're experiencing high demand right now. Please try again in a few minutes.";
        statusCode = 429;
      }
      // Handle rate limiting
      else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        userMessage = "We're a bit busy right now. Please wait a moment and try again.";
        statusCode = 429;
      }
      // Handle authentication errors
      else if (errorMessage.includes('authentication') || errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
        userMessage = "We're having technical difficulties. Please try again later.";
        statusCode = 500;
      }
      // Handle network/timeout errors
      else if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage = "The connection is taking longer than expected. Please try again.";
        statusCode = 408;
      }
      // Handle OpenAI model errors
      else if (errorMessage.includes('model') || errorMessage.includes('gpt')) {
        userMessage = "Our AI service is temporarily unavailable. Please try again in a few minutes.";
        statusCode = 503;
      }
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 