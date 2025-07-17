import { getCollection } from 'astro:content';

export async function GET({ request, locals }: { request: any, locals: any }) {
  try {
    console.log('GET /api/blog-posts invoked');
    
    // Get the blog collection
    const blogCollection = await getCollection('blog');
    
    // Get all published blog posts (not draft)
    const publishedPosts = blogCollection
      .filter((post: any) => !post.data.draft)
      .sort((a: any, b: any) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
    
    if (publishedPosts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No published blog posts found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Format all posts for the idea generation workflow
    const postsData = publishedPosts.map((post: any) => ({
      title: post.data.title,
      description: post.data.description,
      slug: post.id,
      url: `https://bright-gift.com/blog/${post.id}`,
      tags: post.data.tags || [],
      keywords: post.data.keywords || [],
      image: post.data.image,
      socialImage: post.data.socialImage,
      ogImage: post.data.ogImage,
      category: post.data.category,
      date: post.data.date,
      readTime: post.data.readTime,
      featured: post.data.featured || false,
      metaTitle: post.data.metaTitle,
      metaDescription: post.data.metaDescription
    }));
    
    console.log(`Returning ${postsData.length} blog posts`);
    
    return new Response(
      JSON.stringify(postsData),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } }
    );
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch blog posts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST() {
  return new Response(
    JSON.stringify({ error: 'This endpoint only supports GET requests' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
} 