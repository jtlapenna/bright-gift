# Broken Image Investigation & Diagnosis Plan
*Generated: December 2024*

## Executive Summary

After 7-8 failed attempts to fix broken image issues, this document outlines a systematic investigation plan to finally identify and resolve the root cause. The issue persists despite multiple fixes, suggesting we're missing a critical source of image URL generation.

## Current State Analysis

### **Critical Findings from Ahrefs CSV**
- **34 broken image URLs** all returning 404 status
- **Pattern**: All URLs follow format `https://bright-gift.com/images/blog/[post-name]/[post-name]-banner.jpg`
- **Source**: Each broken image has exactly 1 inlink (meaning 1 page references it)
- **Status**: All confirmed as 404 errors

### **Deployment Status**
- **Last Deployment**: 13 hours ago (commit 20ee21b)
- **Cloudflare Issues**: API errors (504, 503, authentication failures)
- **GitHub Status**: Shows successful deployments
- **Build Logs**: Show successful build and deployment
- **Discrepancy**: Cloudflare dashboard inaccessible but site loads via deployment links

### **User Workflow Context**
- **Image Generation**: User generates images externally, then asks agents to move files
- **Expected Behavior**: Only .webp files should be used for SEO
- **Unexpected**: .jpg files appearing in frontmatter and build process
- **Root Question**: Why are .jpg files being included when never instructed?

## Investigation Plan

### **Phase 1: Current State Analysis**

#### **1.1 Verify What Ahrefs is Actually Seeing**
- **Action**: Analyze the provided CSV file for patterns
- **Method**: 
  - Extract all 34 broken URLs
  - Identify common patterns in URL structure
  - Map each URL to its source page
- **Deliverable**: Pattern analysis report

#### **1.2 Check Live Site vs Local Build**
- **Action**: Compare what's deployed vs what we're building locally
- **Method**: 
  - Test specific broken URLs on live site
  - Check if our local changes are actually deployed
  - Verify Cloudflare cache isn't serving old content
- **Deliverable**: Deployment verification report

#### **1.3 Trace Image URL Generation**
- **Action**: Find every possible source of image URLs
- **Method**: 
  - Search entire codebase for image URL patterns
  - Check all templates, components, and API endpoints
  - Look for dynamic URL generation we missed
- **Deliverable**: Complete source map of image URL generation

### **Phase 2: Deep Code Analysis**

#### **2.1 Template Analysis**
- **Action**: Examine every template that could generate image URLs
- **Files to Check**:
  - `src/pages/blog/[...slug].astro`
  - `src/pages/blog/index.astro`
  - `src/pages/index.astro`
  - `src/layouts/Layout.astro`
  - Any other templates
- **Method**: Line-by-line analysis of image handling
- **Deliverable**: Template analysis report

#### **2.2 API Endpoint Analysis**
- **Action**: Check all API endpoints for image URL generation
- **Files to Check**:
  - `src/pages/api/blog-posts.ts`
  - `src/pages/api/blog-posts/latest.ts`
  - `src/pages/api/generate.ts`
- **Method**: Verify no image URLs are being generated server-side
- **Deliverable**: API analysis report

#### **2.3 Static Generation Analysis**
- **Action**: Check if images are being generated during build
- **Method**: 
  - Examine build output for image references
  - Check sitemap generation
  - Look for any static file generation
- **Deliverable**: Build process analysis report

### **Phase 3: Content Analysis**

#### **3.1 Frontmatter Deep Dive**
- **Action**: Check every blog post for hidden image references
- **Method**: 
  - Search all frontmatter for any image-related fields
  - Look for fields we haven't checked yet
  - Check for malformed or hidden references
- **Deliverable**: Frontmatter analysis report

#### **3.2 Content Body Analysis**
- **Action**: Check blog post content for image references
- **Method**: 
  - Search all markdown content for image patterns
  - Look for HTML img tags
  - Check for any dynamic image generation
- **Deliverable**: Content analysis report

### **Phase 4: External Factor Analysis**

#### **4.1 CDN/Cache Analysis**
- **Action**: Check if Cloudflare is serving cached content
- **Method**: 
  - Verify cache headers
  - Check if old content is being served
  - Look for cache invalidation issues
- **Deliverable**: Cache analysis report

#### **4.2 Build Process Analysis**
- **Action**: Verify our changes are actually being applied
- **Method**: 
  - Check if build process is using our changes
  - Verify no other processes are overriding our fixes
  - Look for deployment issues
- **Deliverable**: Build verification report

### **Phase 5: Ahrefs-Specific Analysis**

#### **5.1 Crawl Source Identification**
- **Action**: Determine how Ahrefs is discovering these URLs
- **Method**: 
  - Check if URLs are in sitemap
  - Look for internal links pointing to broken images
  - Check if URLs are in structured data
- **Deliverable**: Crawl source analysis report

#### **5.2 URL Pattern Analysis**
- **Action**: Analyze the pattern of broken URLs
- **Method**: 
  - Look for common patterns in broken URLs
  - Check if they follow a specific naming convention
  - Identify if they're being generated systematically
- **Deliverable**: URL pattern analysis report

### **Phase 6: Systematic Testing**

#### **6.1 Local Testing**
- **Action**: Test every possible image URL locally
- **Method**: 
  - Generate list of all possible image URLs
  - Test each one locally
  - Verify which ones return 404
- **Deliverable**: Local testing report

#### **6.2 Live Site Testing**
- **Action**: Test the same URLs on live site
- **Method**: 
  - Use curl to test specific URLs
  - Check response codes
  - Verify what's actually being served
- **Deliverable**: Live site testing report

### **Phase 7: Root Cause Identification**

#### **7.1 Pattern Recognition**
- **Action**: Identify the common pattern in all broken images
- **Method**: 
  - Compare all broken URLs
  - Look for systematic generation
  - Identify the source code responsible
- **Deliverable**: Pattern recognition report

#### **7.2 Code Path Tracing**
- **Action**: Trace how each broken URL is generated
- **Method**: 
  - Follow the code path for each URL
  - Identify the exact line of code
  - Understand the generation logic
- **Deliverable**: Code path tracing report

### **Phase 8: Solution Development**

#### **8.1 Targeted Fix**
- **Action**: Fix the specific code causing the issue
- **Method**: 
  - Modify the exact problematic code
  - Test the fix thoroughly
  - Verify no new issues are created
- **Deliverable**: Targeted fix implementation

#### **8.2 Validation**
- **Action**: Verify the fix works completely
- **Method**: 
  - Test all previously broken URLs
  - Run comprehensive checks
  - Wait for Ahrefs to re-crawl
- **Deliverable**: Validation report

## Documentation System

### **Investigation Log**
- **File**: `investigation-log.md`
- **Purpose**: Track every step of the investigation
- **Format**: Timestamp, action, findings, next steps
- **Update Frequency**: After each investigation step

### **Findings Database**
- **File**: `findings-database.md`
- **Purpose**: Store all discovered information
- **Format**: Categorized by type (code, content, deployment, etc.)
- **Update Frequency**: Continuously as findings are made

### **Evidence Collection**
- **File**: `evidence-collection.md`
- **Purpose**: Store proof of findings
- **Format**: Code snippets, URLs, screenshots, logs
- **Update Frequency**: As evidence is gathered

### **Root Cause Analysis**
- **File**: `root-cause-analysis.md`
- **Purpose**: Document the final root cause
- **Format**: Problem statement, evidence, solution
- **Update Frequency**: Once root cause is identified

### **Solution Implementation**
- **File**: `solution-implementation.md`
- **Purpose**: Document the fix process
- **Format**: Steps taken, testing performed, results
- **Update Frequency**: As solution is implemented

## Success Criteria

### **Investigation Success**
- ✅ **Root cause identified** with 100% certainty
- ✅ **All sources of .jpg URLs** documented
- ✅ **Code path traced** from generation to HTML output
- ✅ **Evidence collected** for every finding

### **Solution Success**
- ✅ **All 34 broken URLs** return 200 or are removed
- ✅ **No new broken URLs** generated
- ✅ **Ahrefs re-crawl** shows 0 broken images
- ✅ **Site functionality** remains intact

## Risk Mitigation

### **Investigation Risks**
- **False positives**: Verify every finding with evidence
- **Missing sources**: Use multiple search methods
- **Cache issues**: Test both live and local environments

### **Solution Risks**
- **Breaking functionality**: Test thoroughly before deployment
- **New issues**: Monitor closely after fixes
- **Deployment problems**: Have rollback plan ready

## Timeline

### **Phase 1-2**: 2-3 hours (Current state and code analysis)
### **Phase 3-4**: 1-2 hours (Content and external factors)
### **Phase 5-6**: 1-2 hours (Ahrefs analysis and testing)
### **Phase 7-8**: 1-2 hours (Root cause and solution)

**Total Estimated Time**: 5-9 hours

## Next Steps

1. **Begin Phase 1**: Start with current state analysis
2. **Document everything**: Use the documentation system
3. **Follow the plan**: Don't skip steps or make assumptions
4. **Verify findings**: Double-check every discovery
5. **Implement solution**: Only after root cause is certain

---

*This plan will be updated as the investigation progresses and new information is discovered.*
