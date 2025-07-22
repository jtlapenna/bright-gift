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

function getAfrofiliateIcon(title: string, tag: string) {
  const lowerTitle = title.toLowerCase();
  const lowerTag = tag.toLowerCase();
  
  // Map Afrofiliate brands to appropriate icons
  if (lowerTitle.includes('beautystat') || lowerTitle.includes('kadalys') || 
      lowerTag.includes('skincare') || lowerTag.includes('beauty') || lowerTag.includes('makeup')) {
    return 'Sparkle'; // Beauty/skincare icon
  }
  
  if (lowerTitle.includes('furi-sport') || lowerTitle.includes('be-yourself-314') || 
      lowerTag.includes('athletic') || lowerTag.includes('sport') || lowerTag.includes('fitness')) {
    return 'SoccerBall'; // Sports/athletics icon
  }
  
  if (lowerTitle.includes('be-rooted') || lowerTag.includes('stationery') || lowerTag.includes('planner')) {
    return 'Note'; // Stationery icon
  }
  
  if (lowerTitle.includes('endorf') || lowerTag.includes('wellness') || lowerTag.includes('supplement')) {
    return 'Heartbeat'; // Health/wellness icon
  }
  
  if (lowerTitle.includes('caribe-coffee') || lowerTag.includes('coffee')) {
    return 'CookingPot'; // Coffee/food icon
  }
  
  // Default fallback
  return 'ShoppingBag';
}

// Afrofiliate Black-owned business affiliate links
const AFROFILIATE_LINKS = {
  'beautystat': 'https://www.arjdj2msd.com/7LKLK3/QWRG9C/',
  'furi-sport': 'https://www.arjdj2msd.com/7LKLK3/R2Z4H6/',
  'be-rooted': 'https://www.arjdj2msd.com/7LKLK3/R74QP1/',
  'kadalys': 'https://www.arjdj2msd.com/7LKLK3/RC9DWS/',
  'be-yourself-314': 'https://www.arjdj2msd.com/7LKLK3/24BMB4P/',
  'endorf': 'https://www.arjdj2msd.com/7LKLK3/24D26TB/',
  'caribe-coffee': 'https://www.arjdj2msd.com/7LKLK3/24R58Q6/',
  'cashblack-uk': 'https://www.arjdj2msd.com/7LKLK3/2CTPL1/',
  'cashblack-us': 'https://www.arjdj2msd.com/7LKLK3/M823SF/'
};

// Product categories that match Afrofiliate brands
const AFROFILIATE_CATEGORIES = {
  'skincare': ['beautystat', 'kadalys'],
  'athletic-wear': ['furi-sport', 'be-yourself-314'],
  'stationery': ['be-rooted'],
  'supplements': ['endorf'],
  'coffee': ['caribe-coffee'],
  'cashback': ['cashblack-uk', 'cashblack-us']
};

function determineAfrofiliateLink(title: string, tag: string): string | null {
  const lowerTitle = title.toLowerCase();
  const lowerTag = tag.toLowerCase();
  
  // Check if title contains brand names
  for (const [brand, link] of Object.entries(AFROFILIATE_LINKS)) {
    if (lowerTitle.includes(brand.replace('-', ' ')) || lowerTitle.includes(brand.replace('-', ''))) {
      return link;
    }
  }
  
  // Check if tag matches Afrofiliate categories - be more flexible with matching
  for (const [category, brands] of Object.entries(AFROFILIATE_CATEGORIES)) {
    const categoryVariations = [
      category,
      category.replace('-', ' '),
      category.replace('-', ''),
      // Add common variations for sports/athletics
      ...(category === 'athletic-wear' ? ['athletic', 'athletics', 'sport', 'sports', 'fitness', 'workout', 'athletic wear', 'sports equipment', 'fitness gear', 'workout accessory'] : []),
      // Add common variations for skincare
      ...(category === 'skincare' ? ['skincare', 'beauty', 'makeup', 'cosmetic'] : []),
      // Add common variations for wellness
      ...(category === 'supplements' ? ['wellness', 'health', 'supplement', 'vitamin'] : [])
    ];
    
    if (categoryVariations.some(variation => lowerTag.includes(variation))) {
      // Return the first brand in that category
      const firstBrand = brands[0];
      return AFROFILIATE_LINKS[firstBrand as keyof typeof AFROFILIATE_LINKS];
    }
  }
  
  return null;
}

function determineAffiliateSource(title: string, tag: string, styles: string[]) {
  const lowerTitle = title.toLowerCase();
  const lowerTag = tag.toLowerCase();
  
  // Always check for Afrofiliate matches first, regardless of style selection
  const afrofiliateLink = determineAfrofiliateLink(title, tag);
  if (afrofiliateLink) {
    return 'afrofiliate';
  }
  
  // If Black-owned style is selected but no Afrofiliate match, prioritize Black-owned suggestions
  const isBlackOwnedStyle = styles && styles.includes('black-owned');
  if (isBlackOwnedStyle) {
    return 'black-owned-amazon'; // Special case for Black-owned style with Amazon fallback
  }
  
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
      let description = match[2].trim();
      const tag = match[3].trim();
      let link = null;
      let icon = null;
      
      // Check for Afrofiliate match first (regardless of style selection)
      const afrofiliateLink = determineAfrofiliateLink(title, tag);
      const amazonLink = generateAmazonLink(title, tag);
      
      // Determine affiliate source based on improved logic
      const affiliateSource = determineAffiliateSource(title, tag, styles);
      
      if (affiliateSource === 'bookshop') {
        // Bookshop.org for book-related items
        link = generateBookshopLink(title, bookshopAffiliateId);
        icon = 'Book';
        ideas.push({ title, description, tag, link, icon });
      } else if (afrofiliateLink) {
        // Afrofiliate match found - show both options
        const afrofiliateIcon = getAfrofiliateIcon(title, tag);
        const amazonIcon = getAmazonIcon(tag);
        
        // Add Afrofiliate option
        ideas.push({ 
          title, 
          description, 
          tag, 
          link: afrofiliateLink, 
          icon: afrofiliateIcon,
          affiliateType: 'afrofiliate'
        });
        
        // Add Amazon option
        ideas.push({ 
          title: title, 
          description, 
          tag, 
          link: amazonLink, 
          icon: amazonIcon,
          affiliateType: 'amazon'
        });
      } else if (affiliateSource === 'black-owned-amazon') {
        // Black-owned style selected but no Afrofiliate match - use Amazon with disclaimer
        link = generateAmazonLink(title, tag);
        icon = getAmazonIcon(tag);
        // Add a note that this is a general suggestion, not specifically Black-owned
        description += ' (Note: This is a general suggestion. For Black-owned business options, we recommend checking out our Afrofiliate partner brands.)';
        ideas.push({ title, description, tag, link, icon });
      } else {
        // Amazon for everything else (including wellness, athletics, beauty styles)
        link = generateAmazonLink(title, tag);
        icon = getAmazonIcon(tag);
        ideas.push({ title, description, tag, link, icon });
      }
    }

    // Always return an array; fallback if parsing fails
    if (ideas.length === 0) {
      // If Black-owned style was selected, suggest Afrofiliate brands
      const isBlackOwnedStyle = styles && styles.includes('black-owned');
      if (isBlackOwnedStyle) {
        ideas.push({
          title: "BeautyStat - Science-Backed Skincare",
          description: "Professional-grade skincare products from a Black-owned cosmetic chemist brand. Perfect for skincare enthusiasts who love science-backed formulations.",
          tag: "Skincare",
          link: AFROFILIATE_LINKS['beautystat'],
          icon: "Sparkle"
        });
        ideas.push({
          title: "Furi Sport - High-Performance Athletic Wear",
          description: "Stylish, high-performance athletic wear designed for serious athletes. Quality sportswear that combines fashion with function.",
          tag: "Athletic Wear",
          link: AFROFILIATE_LINKS['furi-sport'],
          icon: "SoccerBall"
        });
        ideas.push({
          title: "Caribe Coffee - Sustainable Coffee",
          description: "Ethically sourced, high-quality coffee beans roasted to perfection. Perfect for coffee connoisseurs who appreciate sustainable practices.",
          tag: "Coffee",
          link: AFROFILIATE_LINKS['caribe-coffee'],
          icon: "CookingPot"
        });
      } else {
        ideas.push({
          title: "Sorry, no gift ideas found.",
          description: "We couldn't parse the AI's response. Please try again or adjust your search.",
          tag: "",
          link: "#",
          icon: "Gift"
        });
      }
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