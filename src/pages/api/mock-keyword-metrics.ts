import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const keyword = searchParams.get('q');
    
    if (!keyword) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Keyword parameter "q" is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mock realistic keyword data based on the keyword
    const mockData = generateMockKeywordData(keyword);

    return new Response(JSON.stringify({
      success: true,
      data: [mockData]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error in mock keyword metrics:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate mock data'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

function generateMockKeywordData(keyword: string) {
  const keywordLower = keyword.toLowerCase();
  
  // Generate realistic metrics based on keyword type
  let searchVolume = 1000;
  let competition = 0.3;
  let cpc = 0.5;
  
  // Adjust based on keyword characteristics
  if (keywordLower.includes('gift')) {
    searchVolume = Math.floor(Math.random() * 5000) + 2000;
    competition = Math.random() * 0.7 + 0.2;
    cpc = Math.random() * 2 + 0.5;
  }
  
  if (keywordLower.includes('under') || keywordLower.includes('cheap')) {
    searchVolume = Math.floor(Math.random() * 3000) + 1000;
    competition = Math.random() * 0.5 + 0.1;
    cpc = Math.random() * 1.5 + 0.3;
  }
  
  if (keywordLower.includes('unique') || keywordLower.includes('creative')) {
    searchVolume = Math.floor(Math.random() * 2000) + 500;
    competition = Math.random() * 0.4 + 0.1;
    cpc = Math.random() * 1.2 + 0.4;
  }

  return {
    keyword: keyword,
    search_volume: searchVolume,
    competition: competition,
    cpc: cpc,
    suggested_keyword: keyword,
    keyword_type: 'Broad'
  };
} 