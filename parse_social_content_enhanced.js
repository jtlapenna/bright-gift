// Parse social media content (supports both pre-generated and AI-generated)
const input = $input.first().json;
const postData = input.postData;
const imageUrl = input.imageUrl;
const platform = input.platform || 'general';

// Helper function to select appropriate image based on platform
function getPlatformImage(postData, platform) {
  switch(platform) {
    case 'twitter':
      return postData.socialImage || postData.image; // 1200x675 preferred
    case 'instagram':
      return postData.socialImage || postData.image; // 1080x1080 preferred
    case 'facebook':
      return postData.socialImage || postData.image; // 1200x630 preferred
    case 'linkedin':
      return postData.ogImage || postData.socialImage || postData.image; // 1200x627 preferred
    case 'pinterest':
      return postData.socialImage || postData.image; // 1000x1500 preferred
    default:
      return postData.socialImage || postData.image;
  }
}

// Helper function to generate platform-specific content
function generatePlatformContent(postData, platform) {
  const baseContent = {
    title: postData.title,
    description: postData.description,
    url: postData.url,
    audience: postData.audience || [],
    themes: postData.themes || [],
    budget: postData.budget || ''
  };

  // Generate hashtags
  const hashtags = [];
  if (baseContent.themes) {
    baseContent.themes.forEach(theme => {
      hashtags.push(`#${theme.replace(/\s+/g, '')}`);
    });
  }
  if (baseContent.audience) {
    baseContent.audience.forEach(audience => {
      hashtags.push(`#${audience.replace(/\s+/g, '')}`);
    });
  }
  hashtags.push('#giftideas', '#brightgift');

  switch(platform) {
    case 'twitter':
      // Twitter: Concise, engaging, with hashtags
      let twitterContent = `🎁 ${baseContent.title}\n\n`;
      if (baseContent.budget) {
        twitterContent += `💰 Budget: ${baseContent.budget}\n\n`;
      }
      twitterContent += `${baseContent.description.substring(0, 200)}${baseContent.description.length > 200 ? '...' : ''}\n\n`;
      twitterContent += `🔗 ${baseContent.url}\n\n`;
      twitterContent += hashtags.slice(0, 5).join(' '); // Limit hashtags for Twitter
      return twitterContent;

    case 'facebook':
      // Facebook: Community-focused, longer content
      let facebookContent = `🎁 Looking for the perfect gift?\n\n`;
      facebookContent += `${baseContent.title}\n\n`;
      if (baseContent.budget) {
        facebookContent += `💰 All gifts under ${baseContent.budget}\n\n`;
      }
      facebookContent += `${baseContent.description}\n\n`;
      if (baseContent.audience.length > 0) {
        facebookContent += `Perfect for: ${baseContent.audience.join(', ')}\n\n`;
      }
      facebookContent += `🔗 Read the full guide: ${baseContent.url}\n\n`;
      facebookContent += hashtags.join(' ');
      return facebookContent;

    case 'instagram':
      // Instagram: Visual-first, engaging captions
      let instagramContent = `🎁 ${baseContent.title}\n\n`;
      if (baseContent.budget) {
        instagramContent += `💰 Budget-friendly: ${baseContent.budget}\n\n`;
      }
      instagramContent += `${baseContent.description.substring(0, 150)}${baseContent.description.length > 150 ? '...' : ''}\n\n`;
      if (baseContent.audience.length > 0) {
        instagramContent += `Perfect for: ${baseContent.audience.join(', ')}\n\n`;
      }
      instagramContent += `🔗 Link in bio\n\n`;
      instagramContent += hashtags.join(' ');
      return instagramContent;

    case 'linkedin':
      // LinkedIn: Professional, business-focused
      let linkedinContent = `🎁 Gift Guide: ${baseContent.title}\n\n`;
      if (baseContent.budget) {
        linkedinContent += `💰 Budget: ${baseContent.budget}\n\n`;
      }
      linkedinContent += `${baseContent.description}\n\n`;
      if (baseContent.audience.length > 0) {
        linkedinContent += `Target audience: ${baseContent.audience.join(', ')}\n\n`;
      }
      linkedinContent += `🔗 Read the complete guide: ${baseContent.url}\n\n`;
      linkedinContent += hashtags.slice(0, 8).join(' '); // Professional hashtags
      return linkedinContent;

    case 'pinterest':
      // Pinterest: Descriptive, keyword-rich, call-to-action
      let pinterestContent = `${baseContent.title}\n\n`;
      if (baseContent.budget) {
        pinterestContent += `💰 All gifts under ${baseContent.budget}\n\n`;
      }
      pinterestContent += `${baseContent.description}\n\n`;
      if (baseContent.audience.length > 0) {
        pinterestContent += `Perfect for: ${baseContent.audience.join(', ')}\n\n`;
      }
      pinterestContent += `🔗 Click to see all gift ideas!\n\n`;
      pinterestContent += hashtags.join(' ');
      return pinterestContent;

    default:
      // Generic content
      let genericContent = `${baseContent.title}\n\n`;
      genericContent += `${baseContent.description}\n\n`;
      genericContent += `🔗 ${baseContent.url}\n\n`;
      genericContent += hashtags.join(' ');
      return genericContent;
  }
}

// Check if we have pre-generated content from frontmatter
let socialPosts = {};

if (postData.socialPosts && typeof postData.socialPosts === 'object') {
  // Use pre-generated content from YAML frontmatter
  Object.keys(postData.socialPosts).forEach(platformKey => {
    socialPosts[platformKey] = {
      content: postData.socialPosts[platformKey],
      imageUrl: getPlatformImage(postData, platformKey),
      url: postData.url,
      platform: platformKey,
      source: 'pre_generated'
    };
  });
} else if (input.aiResponse) {
  // Parse AI-generated content (fallback for real-time generation)
  const aiResponse = input.aiResponse;
  const platforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'pinterest'];
  
  platforms.forEach(platformKey => {
    const platformRegex = new RegExp(`${platformKey}[:\s]*([\s\S]*?)(?=\n\w+:|$)`, 'i');
    const match = aiResponse.match(platformRegex);
    
    if (match) {
      socialPosts[platformKey] = {
        content: match[1].trim(),
        imageUrl: getPlatformImage(postData, platformKey),
        url: postData.url,
        platform: platformKey,
        source: 'ai_generated'
      };
    } else {
      // Generate platform-specific fallback content
      socialPosts[platformKey] = {
        content: generatePlatformContent(postData, platformKey),
        imageUrl: getPlatformImage(postData, platformKey),
        url: postData.url,
        platform: platformKey,
        source: 'fallback_generated'
      };
    }
  });
} else {
  // Generate platform-specific content if neither pre-generated nor AI content exists
  const platforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'pinterest'];
  
  platforms.forEach(platformKey => {
    socialPosts[platformKey] = {
      content: generatePlatformContent(postData, platformKey),
      imageUrl: getPlatformImage(postData, platformKey),
      url: postData.url,
      platform: platformKey,
      source: 'template_generated'
    };
  });
}

// Add Pinterest-specific data structure
if (socialPosts.pinterest) {
  socialPosts.pinterest.pinterestData = {
    title: postData.title.substring(0, 100), // Pinterest title limit
    description: socialPosts.pinterest.content.substring(0, 500), // Pinterest description limit
    link: postData.url,
    board_id: 'default_board_id' // Will be replaced by environment variable in Pinterest node
  };
}

return {
  socialPosts,
  postData,
  totalPosts: Object.keys(socialPosts).length,
  contentSource: Object.values(socialPosts)[0]?.source || 'unknown',
  platforms: Object.keys(socialPosts),
  pinterestReady: !!socialPosts.pinterest
}; 