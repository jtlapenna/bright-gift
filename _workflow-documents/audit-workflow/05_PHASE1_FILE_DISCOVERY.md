# Phase 1: File Discovery & Mapping

## 📊 **Audit Session: 2025-01-27**

### **Chunk 1: Root Directory Audit**

#### **Root-Level Files Analysis**

**Configuration Files:**
- `package.json` - ✅ ACTIVE - Main project configuration
- `package-lock.json` - ✅ ACTIVE - Dependency lock file
- `tsconfig.json` - ✅ ACTIVE - TypeScript configuration
- `.astro` - ✅ ACTIVE - Astro configuration
- `README.md` - ✅ ACTIVE - Project documentation

**Script Files (Potential Archive Candidates):**
- `monitor-deployment.js` - ❓ REVIEW - Deployment monitoring script
- `parse_social_content_enhanced.js` - ❓ REVIEW - Social content parser
- `fix-frontmatter.js` - ❓ REVIEW - Frontmatter fixer script
- `test-endpoint.js` - ❓ REVIEW - API testing script
- `test-impact-api.js` - ❓ REVIEW - API testing script
- `test-impact-api-v2.js` - ❓ REVIEW - API testing script (v2)
- `test-impact-api-v3.js` - ❓ REVIEW - API testing script (v3)
- `test-server.js` - ❓ REVIEW - Server testing script
- `index.js` - ❓ REVIEW - Main entry point (check if used)

**Data Files:**
- `image-prompts-psychology-gift-memory.json` - ❓ REVIEW - Image prompt data
- `internal-link-audit-report.json` - ❓ REVIEW - Audit report data

#### **Root-Level Directories Analysis**

**Core Project Directories:**
- `src/` - ✅ ACTIVE - Main source code
- `public/` - ✅ ACTIVE - Public assets
- `scripts/` - ✅ ACTIVE - Utility scripts
- `_workflow-documents/` - ✅ ACTIVE - Documentation and workflows

**API/Server Directories:**
- `api-server/` - ❓ REVIEW - API server implementation
- `brightgift-api-server/` - ❓ REVIEW - BrightGift API server
- `brightgift-worker/` - ❓ REVIEW - Worker implementation

**Build/Deployment Directories:**
- `dist/` - ✅ ACTIVE - Build output
- `.wrangler/` - ✅ ACTIVE - Cloudflare configuration
- `.husky/` - ✅ ACTIVE - Git hooks
- `.cursor/` - ✅ ACTIVE - Cursor IDE configuration

**Export/Archive Directories:**
- `content-automation-export/` - ❓ REVIEW - Content automation exports

---

## 🔍 **Initial Findings**

### **Potential Issues Identified:**

1. **Multiple API Server Directories:**
   - `api-server/` and `brightgift-api-server/` - Need to determine which is active
   - Potential duplicate functionality

2. **Multiple Test Scripts:**
   - `test-impact-api.js`, `test-impact-api-v2.js`, `test-impact-api-v3.js`
   - Indicates API evolution but may have outdated versions

3. **Utility Scripts in Root:**
   - Several utility scripts that may belong in `scripts/` directory
   - Need to assess if they're still needed

4. **Data Files in Root:**
   - JSON files that may belong in specific directories
   - Need to assess relevance and organization

### **Next Steps for Chunk 1:**
- [ ] Analyze each test script to determine current vs. deprecated
- [ ] Check if utility scripts are still needed
- [ ] Assess API server directories for active vs. deprecated
- [ ] Review data files for proper organization

---

## 📋 **Chunk 1 Checklist Progress**

### **Root Directory Audit**
- [x] Map all root-level files and folders
- [x] Identify purpose of each root directory
- [ ] Document file relationships
- [ ] Note any orphaned or misplaced files

### **Immediate Actions:**
- [ ] Move utility scripts to `scripts/` directory if still needed
- [ ] Consolidate API server directories
- [ ] Organize data files into appropriate directories
- [ ] Clean up deprecated test scripts

---

*This document will be updated as the audit progresses through each chunk.* 