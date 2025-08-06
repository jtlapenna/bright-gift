# 🚀 BrightGift Blog Automation Script

This script replicates the n8n automation workflow for creating complete blog posts from Cursor.

## 🎯 What It Does

The automation script performs the following steps:

1. **📋 Loads Configuration** - Reads content ideas, style guides, and SEO requirements
2. **💡 Generates Blog Idea** - Selects next priority blog from content strategy or uses specified topic
3. **✍️ Creates Blog Content** - Generates comprehensive blog post with SEO optimization
4. **🎨 Creates Image Prompts** - Generates BrightGift-style image prompts for banner and social images
5. **📱 Creates Social Posts** - Generates social media content for all platforms
6. **💾 Commits Changes** - Automatically commits all new files to git

## 🛠️ Setup

### Prerequisites

1. **OpenAI API Key**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

2. **Node.js Dependencies**
   ```bash
   npm install openai
   ```

3. **Git Repository**
   - Must be in a git repository
   - Must have write permissions

### Installation

1. Make the script executable:
   ```bash
   chmod +x scripts/create-blog-automation.js
   ```

2. Add to package.json scripts:
   ```json
   {
     "scripts": {
       "create-blog": "node scripts/create-blog-automation.js",
       "create-blog:gift-guide": "node scripts/create-blog-automation.js --type gift-guide",
       "create-blog:educational": "node scripts/create-blog-automation.js --type educational",
       "create-blog:data-driven": "node scripts/create-blog-automation.js --type data-driven"
     }
   }
   ```

## 🚀 Usage

### Basic Usage (Auto-select next priority blog)
```bash
npm run create-blog
```

### Specify Blog Type
```bash
# Educational content
npm run create-blog:educational

# Gift guide
npm run create-blog:gift-guide

# Data-driven content
npm run create-blog:data-driven
```

### Specify Custom Topic
```bash
node scripts/create-blog-automation.js --topic "How to Choose Gifts for Difficult People" --type educational
```

### Command Line Options
- `--topic "Blog Title"` - Specify a custom blog topic
- `--type "gift-guide|educational|data-driven"` - Specify content type

## 📁 Output Structure

The script creates the following files:

```
src/content/blog/
└── [blog-slug].md                    # Blog post with frontmatter

public/images/blog/
└── [blog-slug]/
    ├── [blog-slug]-image-prompts.json # Image generation prompts
    └── sample-image-names.md         # Image requirements documentation

_workflow-documents/social-posts/
└── [blog-slug].md                    # Social media posts for all platforms
```

## 🎨 Blog Types

### Gift Guide
- **Structure:** Introduction, gift categories, tips, combinations
- **Keywords:** "gifts for", "gift guide", "gift ideas"
- **Focus:** Product recommendations with affiliate links

### Educational
- **Structure:** Problem, framework, examples, tips, conclusion
- **Keywords:** "how to", "guide", "tips", "strategies"
- **Focus:** Teaching and skill-building content

### Data-Driven
- **Structure:** Data hook, statistics, analysis, trends
- **Keywords:** "statistics", "data", "trends", "analysis"
- **Focus:** Research and insights content

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY` - Required for content generation

### Configuration Files
- `_workflow-documents/planning/non-gift-guide-content-ideas.md` - Blog ideas and priorities
- `_workflow-documents/planning/04.2_blog_style_guide.md` - Content style requirements
- `_workflow-documents/planning/04.3_SEO_Guide.md` - SEO optimization guidelines

## 🎯 Content Strategy Integration

The script integrates with the existing content strategy:

1. **Priority Selection** - Automatically selects next priority blog from content ideas
2. **SEO Optimization** - Follows established SEO guidelines and keyword strategy
3. **Style Consistency** - Adheres to BrightGift brand voice and formatting
4. **Content Mix** - Supports the 60/25/10/5 content distribution strategy

## 📊 Workflow Comparison

### n8n vs Script Automation

| Feature | n8n Workflow | Script Automation |
|---------|-------------|-------------------|
| **Speed** | Slower (multiple API calls) | Faster (single process) |
| **Integration** | External service | Direct from Cursor |
| **Customization** | Visual interface | Code-based |
| **Version Control** | Limited | Full git integration |
| **Cost** | n8n hosting + API calls | API calls only |
| **Reliability** | Network dependent | Local execution |

## 🔄 Next Steps After Automation

1. **Generate Images**
   - Use the image prompts to create banner and social images
   - Follow BrightGift style guidelines

2. **Review Content**
   - Edit blog post for accuracy and flow
   - Verify SEO optimization
   - Check affiliate link integration

3. **Publish**
   - Generate remaining images
   - Set `draft: false` in frontmatter
   - Push to production

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Error**
   - Verify API key is set correctly
   - Check API quota and billing

2. **Git Commit Failed**
   - Check git status and resolve conflicts
   - Ensure you have write permissions

3. **Missing Directories**
   - Verify all required directories exist
   - Check file permissions

4. **Invalid Blog Response**
   - Check OpenAI prompt formatting
   - Verify response parsing logic

### Debug Mode

Add debug logging by setting:
```bash
export DEBUG=true
```

## 🔮 Future Enhancements

- **Image Generation** - Integrate with DALL-E or Midjourney APIs
- **Auto-publishing** - Direct deployment to production
- **Analytics Integration** - Track performance metrics
- **A/B Testing** - Generate multiple content variations
- **Scheduling** - Automated publishing at optimal times

## 📞 Support

For issues or questions about the automation script:
1. Check the troubleshooting section
2. Review the configuration files
3. Verify environment setup
4. Test with a simple blog topic first 