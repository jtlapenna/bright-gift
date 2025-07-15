# N8N Workflow Setup Guide - SEO Keyword Discovery

## Overview
This guide explains how to import and configure the automated SEO keyword discovery workflow in n8n.

---

## Prerequisites

### **Required Accounts & APIs**
1. **OpenAI API** - For AI-powered topic and keyword generation
2. **Ubersuggest API** - For keyword metrics (search volume, competition)
3. **SerpAPI** - For SERP analysis and competition scoring
4. **Email Account** - For notifications and reply handling

### **N8N Instance**
- Self-hosted n8n or n8n.cloud account
- Admin access to create workflows and configure credentials

---

## Import Instructions

### **1. Download the Workflow JSON**
- The workflow JSON is located at: `_workflow-documents/planning/seo-keyword-discovery-n8n-workflow.json`

### **2. Import into N8N**
1. Open your n8n instance
2. Go to **Workflows** in the left sidebar
3. Click **"Import from file"** button
4. Select the downloaded JSON file
5. Click **"Import"**

### **3. Configure Environment Variables**
Add these environment variables in your n8n settings:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Keyword Research APIs
UBERSUGGEST_API_KEY=your_ubersuggest_api_key_here
SERPAPI_KEY=your_serpapi_key_here

# Email Configuration
NOTIFICATION_EMAIL=your_notification_email@domain.com
ADMIN_EMAIL=your_admin_email@domain.com
EMAIL_PASSWORD=your_email_password_here
IMAP_HOST=imap.gmail.com  # or your email provider's IMAP server
```

### **4. Set Up Credentials**
Configure these credentials in n8n:

#### **OpenAI API**
- **Name:** `openAiApi`
- **Type:** OpenAI API
- **API Key:** Your OpenAI API key

#### **SMTP (Email Sending)**
- **Name:** `smtp`
- **Type:** SMTP
- **Host:** `smtp.gmail.com` (or your email provider)
- **Port:** `587`
- **Username:** Your email address
- **Password:** Your email password or app password

#### **IMAP (Email Reading)**
- **Name:** `imap`
- **Type:** IMAP
- **Host:** `imap.gmail.com` (or your email provider)
- **Port:** `993`
- **Username:** Your email address
- **Password:** Your email password or app password

---

## Workflow Configuration

### **1. Webhook Trigger**
- The workflow starts with a webhook trigger
- You can manually trigger it or set up a cron schedule
- Webhook URL will be provided after activation

### **2. API Endpoints**
Update these URLs in the workflow nodes:

#### **Blog Content Fetch**
```javascript
// In "Fetch Blog Content" node
url: "https://your-domain.com/api/blog-posts"
```

#### **Content Generation Trigger**
```javascript
// In "Trigger Content Generation" node  
url: "https://your-content-api.com/generate"
```

### **3. Email Templates**
Customize email content in the "Format Email" node:

```javascript
// Modify the email template as needed
let emailBody = '🚀 **SEO Keyword Discovery Results**\n\n';
emailBody += 'Here are the top 5 keyword opportunities for your next blog post:\n\n';
// ... rest of template
```

---

## Testing the Workflow

### **1. Manual Test**
1. Activate the workflow in n8n
2. Click the webhook trigger to start manually
3. Monitor execution in the execution log
4. Check for any error messages

### **2. Email Test**
1. Ensure your email credentials are working
2. Test the notification email is received
3. Reply to the email with a number (1-5)
4. Verify the workflow continues to content generation

### **3. API Tests**
1. Test OpenAI API calls work correctly
2. Verify Ubersuggest API returns keyword data
3. Check SerpAPI returns SERP analysis
4. Ensure all rate limits are respected

---

## Troubleshooting

### **Common Issues**

#### **1. API Rate Limits**
- **Problem:** APIs returning 429 errors
- **Solution:** Add delays between API calls or upgrade API plans

#### **2. Email Authentication**
- **Problem:** SMTP/IMAP authentication failing
- **Solution:** Use app passwords for Gmail, enable 2FA

#### **3. JSON Parsing Errors**
- **Problem:** OpenAI responses not in expected format
- **Solution:** Check prompts and add error handling

#### **4. Missing Environment Variables**
- **Problem:** Workflow failing with undefined variables
- **Solution:** Verify all environment variables are set

### **Debug Steps**
1. Check execution logs in n8n
2. Verify all credentials are configured
3. Test individual nodes manually
4. Check API quotas and limits
5. Verify email settings

---

## Customization Options

### **1. Modify Keywords Per Topic**
```javascript
// In "Generate Keywords" node
// Change from 15 to desired number
"list 15 long-tail, buyer-intent search queries"
```

### **2. Adjust Selection Criteria**
```javascript
// In "Calculate Scores" node
// Modify scoring formula
const score = (kw.volume * intentWeight) / (kw.competition + kw.brandPresence + 1);
```

### **3. Change Wait Time**
```javascript
// In "Wait for Reply" node
// Adjust from 24 hours to desired duration
"amount": 24,
"unit": "hours"
```

### **4. Add More Data Sources**
- Integrate Google Trends API
- Add competitor site crawling
- Include Reddit/Quora scraping
- Add social media trend analysis

---

## Monitoring & Maintenance

### **1. Execution Monitoring**
- Check n8n execution logs regularly
- Monitor API usage and costs
- Track email delivery success rates

### **2. Performance Optimization**
- Batch API calls where possible
- Implement caching for repeated requests
- Optimize prompt engineering for better results

### **3. Regular Updates**
- Update API keys when needed
- Refresh email credentials
- Monitor for API changes or deprecations

---

## Security Considerations

### **1. API Key Management**
- Store API keys securely in environment variables
- Rotate keys regularly
- Monitor for unauthorized usage

### **2. Email Security**
- Use app passwords instead of account passwords
- Enable 2FA on email accounts
- Monitor for suspicious activity

### **3. Data Privacy**
- Ensure compliance with data protection regulations
- Implement data retention policies
- Secure any stored keyword data

---

## Support & Resources

### **Useful Links**
- [N8N Documentation](https://docs.n8n.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Ubersuggest API Documentation](https://neilpatel.com/ubersuggest/api/)
- [SerpAPI Documentation](https://serpapi.com/docs)

### **Community Support**
- N8N Community Forum
- GitHub Issues for n8n
- Stack Overflow for specific questions

---

**Last Updated:** July 15, 2025  
**Version:** 1.0  
**Status:** Ready for Production 