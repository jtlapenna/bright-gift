import { getCollection } from 'astro:content';

export async function GET({ request, locals }: { request: any, locals: any }) {
  try {
    console.log('GET /api/blog-posts/latest invoked');
    
    // Get the blog collection
    const blogCollection = await getCollection('blog');
    
    // Get the latest published blog post (not draft)
    const publishedPosts = blogCollection
      .filter((post: any) => !post.data.draft)
      .sort((a: any, b: any) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
    
    if (publishedPosts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No published blog posts found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the most recent post
    const latestPost = publishedPosts[0];
    
    // Format the post data for social media automation
    const postData = {
      title: latestPost.data.title,
      description: latestPost.data.description,
      slug: latestPost.id,
      url: `https://bright-gift.com/blog/${latestPost.id}`,
      tags: latestPost.data.tags || [],
      keywords: latestPost.data.keywords || [],
      image: latestPost.data.image,
      socialImage: latestPost.data.socialImage,
      ogImage: latestPost.data.ogImage,
      category: latestPost.data.category,
      contentType: latestPost.data.contentType || 'gift-guide',
      date: latestPost.data.date,
      readTime: latestPost.data.readTime,
      featured: latestPost.data.featured || false,
      metaTitle: latestPost.data.metaTitle,
      metaDescription: latestPost.data.metaDescription
    };
    
    console.log('Returning latest blog post data:', postData);
    
    return new Response(
      JSON.stringify(postData),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } }
    );
    
  } catch (error) {
    console.error('Error fetching latest blog post:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch latest blog post' }),
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