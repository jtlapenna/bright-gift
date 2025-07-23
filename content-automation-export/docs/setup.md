# Setup Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Git repository

## Installation

1. Clone or extract the project
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Configure your environment variables
5. Run setup: `npm run setup`

## Configuration

### Environment Variables

Edit `.env` file with your API keys and settings.

### Site Configuration

Create a site configuration in `config/sites/`:

```json
{
  "name": "my-site",
  "domain": "example.com",
  "contentDir": "src/content/blog",
  "imagesDir": "public/images/blog"
}
```

## Development

- Start development: `npm run dev`
- Run tests: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`

## Reference Files

All reference files from the original project are in the `reference/` directory.
