# 🎁 Bright-Gift API Server

A dedicated API server for the Bright-Gift site that integrates with the Multi-Site Hub dashboard. This server provides real Bright-Gift data to the hub's frontend and connects to the existing Supabase database.

## 🚀 Features

- **Bright-Gift Specific Endpoints**: Tailored API for gift-related content
- **Supabase Integration**: Uses existing multi-site hub database
- **JWT Authentication**: Secure authentication system
- **Content Type Management**: Gift-specific content categorization
- **Analytics**: Comprehensive analytics for gift content
- **CORS Support**: Configured for Multi-Site Hub frontend

## 📋 Prerequisites

- Node.js 18+
- Access to existing Supabase project
- Multi-Site Hub frontend (for integration testing)

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Start the server:**
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

## 🔧 Configuration

### Required Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration (Use existing multi-site hub project)
SUPABASE_URL=https://pdbgsvtmznaduhcopphq.supabase.co
SUPABASE_ANON_KEY=your-anon-key-from-multi-site-hub
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-multi-site-hub

# Bright-Gift Specific
BRIGHTGIFT_SITE_ID=brightgift
BRIGHTGIFT_DOMAIN=https://brightgift.com

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# CORS (Allow Multi-Site Hub frontend)
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000,http://localhost:5173
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/brightgift/auth/login` - Login to Bright-Gift API
- `GET /api/v1/brightgift/auth/me` - Get current user
- `POST /api/v1/brightgift/auth/logout` - Logout
- `POST /api/v1/brightgift/auth/refresh` - Refresh JWT token

### Blog Posts
- `GET /api/v1/brightgift/posts` - List Bright-Gift posts
- `GET /api/v1/brightgift/posts/:id` - Get single post
- `POST /api/v1/brightgift/posts` - Create new post
- `PUT /api/v1/brightgift/posts/:id` - Update post
- `DELETE /api/v1/brightgift/posts/:id` - Delete post
- `POST /api/v1/brightgift/posts/:id/publish` - Publish post
- `POST /api/v1/brightgift/posts/:id/approve` - Approve post

### Analytics
- `GET /api/v1/brightgift/analytics` - Get site analytics
- `GET /api/v1/brightgift/analytics/posts/:id` - Get post analytics
- `GET /api/v1/brightgift/analytics/affiliates` - Get affiliate analytics
- `GET /api/v1/brightgift/analytics/seasonal` - Get seasonal analytics

### Content Types
- `GET /api/v1/brightgift/content-types` - Get content types
- `PUT /api/v1/brightgift/content-types` - Update content types
- `GET /api/v1/brightgift/content-types/usage` - Get usage statistics
- `GET /api/v1/brightgift/content-types/suggestions` - Get suggestions

## 🎁 Bright-Gift Specific Features

### Content Types
- **gift-guide**: Gift recommendation articles
- **product-review**: Product reviews and recommendations
- **seasonal**: Holiday and seasonal gift guides
- **educational**: Gift-giving tips and guides
- **budget-guide**: Budget-friendly gift ideas
- **occasion-specific**: Gifts for specific occasions

### Gift-Specific Fields
- `recipient`: Target recipient (tech-enthusiasts, coffee-lovers, etc.)
- `budget`: Budget range (under-50, 50-150, etc.)
- `occasion`: Gift occasion (birthday, holiday, etc.)
- `seasonal_relevance`: Seasonal timing (year-round, christmas, etc.)

## 🔌 Integration with Multi-Site Hub

### Frontend Configuration
The Multi-Site Hub frontend expects the API to be available at:
```
http://localhost:3001/api/v1/brightgift
```

### Environment Variables in Multi-Site Hub
Update the Multi-Site Hub's `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3001
```

## 🧪 Testing

### Test Endpoints
```bash
# Test health check
curl http://localhost:3001/health

# Test posts endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/brightgift/posts

# Test content types
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/brightgift/content-types
```

### Authentication Test
```bash
# Login to get token
curl -X POST http://localhost:3001/api/v1/brightgift/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@brightgift.com", "password": "password"}'
```

## 📊 Data Format

### Blog Post Response
```json
{
  "data": {
    "post_id": "brightgift-123",
    "site_id": "brightgift",
    "title": "Best Gifts for Tech Lovers in 2024",
    "content_type": "gift-guide",
    "recipient": "tech-enthusiasts",
    "budget": "100-200",
    "occasion": "birthday",
    "status": "published",
    "views": 1250,
    "revenue": 89.50,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Analytics Response
```json
{
  "data": {
    "totalPosts": 160,
    "publishedPosts": 140,
    "totalViews": 45000,
    "totalRevenue": 8500.75,
    "contentTypeBreakdown": {
      "gift-guide": {
        "count": 45,
        "published": 38,
        "totalViews": 12500,
        "totalRevenue": 1800.50
      }
    }
  }
}
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/brightgift/posts
```

## 🚨 Important Notes

1. **Use Existing Supabase**: This server uses the existing Supabase project from the Multi-Site Hub.

2. **Bright-Gift Specific**: All endpoints are tailored for Bright-Gift content and include gift-specific fields.

3. **CORS Configuration**: Configured to allow requests from the Multi-Site Hub frontend.

4. **Mock Authentication**: Currently uses mock authentication - replace with real implementation.

5. **Data Consistency**: Returns data in the exact format expected by the Multi-Site Hub frontend.

## 📞 Support

This API server is designed to work seamlessly with the Multi-Site Hub. Once implemented:

1. The hub will connect to your API endpoints
2. Real Bright-Gift data will be displayed in the dashboard
3. Content management will be available through the hub interface

The API server serves as the single source of truth for all Bright-Gift data, replacing mock data in the Multi-Site Hub. 