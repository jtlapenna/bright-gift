# Multi-Site Hub API Server

A comprehensive API server for managing multi-site content automation workflows, built with Express.js and Supabase.

## 🚀 Features

- **Authentication**: JWT-based authentication with Supabase Auth
- **Site Management**: CRUD operations for multiple sites
- **Blog Post Management**: Full post lifecycle management
- **Workflow Integration**: n8n workflow status tracking and control
- **Real-time Updates**: WebSocket support for live updates
- **Webhook Support**: Integration with n8n workflows
- **Health Monitoring**: Site health scoring and analytics

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account and project
- n8n instance (for workflow integration)
- GitHub account (for content publishing)

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   cd api-server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL schema from `_workflow-documents/n8n-new-flow/supabase_schema_and_sql.md`
   - Get your project URL and API keys

4. **Start the server:**
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

## 🔧 Configuration

### Required Environment Variables

```env
# Server
PORT=3001
JWT_SECRET=your-jwt-secret

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n
N8N_WEBHOOK_URL=https://your-n8n.com/webhook
WEBHOOK_SECRET=your-webhook-secret
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - User logout

### Sites
- `GET /api/v1/sites` - List user's sites
- `GET /api/v1/sites/{siteId}` - Get site details
- `PUT /api/v1/sites/{siteId}` - Update site settings
- `GET /api/v1/sites/{siteId}/health` - Get site health score

### Blog Posts
- `GET /api/v1/sites/{siteId}/posts` - List posts
- `GET /api/v1/sites/{siteId}/posts/{postId}` - Get post details
- `POST /api/v1/sites/{siteId}/posts` - Create new post
- `PUT /api/v1/sites/{siteId}/posts/{postId}` - Update post
- `DELETE /api/v1/sites/{siteId}/posts/{postId}` - Delete post
- `POST /api/v1/sites/{siteId}/posts/{postId}/publish` - Publish post
- `POST /api/v1/sites/{siteId}/posts/{postId}/approve` - Approve post

### Workflows
- `GET /api/v1/sites/{siteId}/workflows` - List workflows
- `GET /api/v1/sites/{siteId}/workflows/{workflowId}` - Get workflow details
- `POST /api/v1/sites/{siteId}/workflows` - Start new workflow
- `POST /api/v1/sites/{siteId}/workflows/{workflowId}/cancel` - Cancel workflow
- `POST /api/v1/sites/{siteId}/workflows/{workflowId}/retry` - Retry workflow

### Webhooks
- `POST /api/v1/webhooks/workflow-status` - n8n workflow status updates
- `POST /api/v1/webhooks/post-status` - Post status updates

## 🔌 WebSocket Events

Connect to `ws://localhost:3001` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3001?siteId=site_123');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

**Available Events:**
- `workflow_update` - Workflow status changes
- `post_update` - Post status changes
- `site_health_update` - Health score changes

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/sites
```

## 📊 Database Schema

The API uses the Supabase schema defined in `_workflow-documents/n8n-new-flow/supabase_schema_and_sql.md`:

- `sites` - Site information and settings
- `blog_workflow_state` - Blog post workflow state
- `workflow_executions` - n8n workflow execution logs
- `workflow_phases` - Workflow phase definitions
- `users` - User accounts and profiles

## 🔄 n8n Integration

The API integrates with n8n workflows via webhooks:

1. **Workflow Status Updates**: n8n sends status updates to `/api/v1/webhooks/workflow-status`
2. **Workflow Triggering**: API can trigger n8n workflows via HTTP requests
3. **Real-time Updates**: WebSocket notifications for workflow progress

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint

# Format code
npm run format
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker
```bash
docker build -t multisite-hub-api .
docker run -p 3001:3001 multisite-hub-api
```

## 📝 API Documentation

For detailed API documentation, see:
- `API_ENDPOINTS_SPECIFICATION.md` - Complete endpoint specification
- `API_IMPLEMENTATION_PRIORITY_GUIDE.md` - Implementation phases

## 🔗 Related Files

- `_workflow-documents/n8n-new-flow/` - Planning and workflow documents
- `_workflow-documents/approval-hub/` - Frontend dashboard
- `BrightGift_SEO_Idea_Workflow.json` - SEO workflow
- `BrightGift_Blog_and_Image_Generator_Workflow.json` - Content workflow

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests

## 📄 License

This project is part of the Multi-Site Content Automation System. 