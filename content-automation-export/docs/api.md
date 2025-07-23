# API Documentation

## Content Generators

### Blog Ideas Generator

```javascript
const { generateBlogIdeas } = require('./src/generators/blog-ideas');

const ideas = await generateBlogIdeas({
  site: 'my-site',
  count: 10,
  type: 'gift-guide'
});
```

### Blog Content Generator

```javascript
const { generateBlogContent } = require('./src/generators/blog-content');

const content = await generateBlogContent({
  title: 'Blog Title',
  type: 'gift-guide',
  site: 'my-site'
});
```

## Image Processors

### Image Prompt Generator

```javascript
const { generateImagePrompts } = require('./src/generators/image-prompts');

const prompts = await generateImagePrompts({
  title: 'Blog Title',
  excerpt: 'Blog excerpt...',
  style: 'brightgift'
});
```

## Social Media

### Social Post Generator

```javascript
const { generateSocialPosts } = require('./src/generators/social-posts');

const posts = await generateSocialPosts({
  blogContent: '...',
  platforms: ['twitter', 'instagram']
});
```
