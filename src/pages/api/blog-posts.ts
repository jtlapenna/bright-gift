import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  try {
    // Get all blog posts from the content collection
    const blogPosts = await getCollection('blog');
    
    // Transform the data to match what the n8n workflow expects
    const postsData = blogPosts.map(post => ({
      title: post.data.title,
      tags: post.data.tags || [],
      keywords: post.data.keywords || [],
      description: post.data.description,
      date: post.data.date,
      slug: post.id
    }));

    return new Response(JSON.stringify({
      success: true,
      data: postsData,
      count: postsData.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch blog posts'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 