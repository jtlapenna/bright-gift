# 🔄 Preview Branch Workflow with Validation

## 🎯 Overview

This workflow ensures all content is validated, fixed, and enhanced before merging to main branch. The validation system only runs on the preview branch to keep main deployments fast and reliable.

## 📋 Workflow Steps

### **1. Start New Content Work**
```bash
# Switch to preview branch
git checkout preview

# Create new content or edit existing
# ... work on blog posts, content, etc.
```

### **2. Validate Content Quality**
```bash
# Run comprehensive validation
npm run validate:preview

# This will show:
# ❌ Critical errors (must fix before merge)
# ⚠️  Warnings (should fix for better quality)
# 💡 Suggestions (optional improvements)
```

### **3. Auto-Fix Common Issues**
```bash
# Automatically fix common problems
npm run fix:preview

# This will:
# 🔧 Add missing affiliate disclosures
# 🔧 Fix formatting issues
# 🔧 Update read times
# 🔧 Generate missing meta fields
```

### **4. Add Enhancements**
```bash
# Add SEO optimizations and features
npm run enhance:preview

# This will:
# 🚀 Add schema markup
# 🚀 Generate social media content
# 🚀 Add smart CTAs
# 🚀 Generate keywords and tags
```

### **5. Re-validate After Fixes**
```bash
# Check if fixes resolved issues
npm run validate:preview

# Should show fewer or no errors
```

### **6. Commit and Push**
```bash
# Review changes
git diff

# Add and commit
git add .
git commit -m "fix: resolve validation issues and add enhancements"

# Push to preview
git push origin preview
```

### **7. Test Preview Deployment**
```bash
# Build and test on preview
npm run build

# Check preview deployment
# Visit your preview URL to verify changes
```

### **8. Merge to Main**
```bash
# When satisfied with preview
git checkout main
git merge preview

# Push to main (fast deployment, no validation)
git push origin main
```

## 🛠 Available Commands

### **Preview Branch Commands:**
```bash
npm run validate:preview  # Check content quality
npm run fix:preview       # Auto-fix common issues
npm run enhance:preview   # Add SEO enhancements
npm run prebuild          # Validate before build
npm run postbuild         # Fix and enhance after build
```

### **Main Branch Commands:**
```bash
npm run build             # Fast build (no validation)
npm run dev               # Development server
```

### **General Commands:**
```bash
npm run validate:blog     # Manual validation (any branch)
npm run fix:blog          # Manual fixing (any branch)
npm run enhance:blog      # Manual enhancement (any branch)
```

## 📊 Validation Categories

### **❌ Critical Errors (Block Merge)**
- Missing required frontmatter fields
- Missing affiliate disclosure
- Broken internal links
- Missing H1 headings

### **⚠️ Warnings (Should Fix)**
- Word count too low/high
- Poor readability scores
- Meta description length issues
- Missing images

### **💡 Suggestions (Optional)**
- Low keyword density
- Missing schema markup
- Few internal links
- Missing CTAs

## 🔄 Integration with n8n

### **Add to n8n Workflow:**
```javascript
// In your n8n workflow
const { execSync } = require('child_process');

// Validate content before processing
execSync('npm run validate:preview', { 
  cwd: '/path/to/project',
  stdio: 'inherit'
});

// Auto-fix issues
execSync('npm run fix:preview', { 
  cwd: '/path/to/project',
  stdio: 'inherit'
});

// Add enhancements
execSync('npm run enhance:preview', { 
  cwd: '/path/to/project',
  stdio: 'inherit'
});
```

### **n8n Workflow Steps:**
1. **Content Generation** → Generate blog posts
2. **Validation** → `npm run validate:preview`
3. **Auto-Fix** → `npm run fix:preview`
4. **Enhancement** → `npm run enhance:preview`
5. **Re-Validation** → `npm run validate:preview`
6. **Commit** → Git operations
7. **Deploy Preview** → Build and deploy

## 🚨 Error Handling

### **If Validation Fails:**
```bash
# Check what failed
npm run validate:preview

# Fix automatically
npm run fix:preview

# Add enhancements
npm run enhance:preview

# Re-check
npm run validate:preview
```

### **If Build Fails:**
```bash
# Check for syntax errors
npm run validate:preview

# Fix common issues
npm run fix:preview

# Try build again
npm run build
```

## 📈 Monitoring & Alerts

### **Preview Branch Monitoring:**
- Track validation results over time
- Monitor fix success rates
- Alert on critical errors
- Report enhancement effectiveness

### **Main Branch Monitoring:**
- Deploy success rate
- Build time tracking
- Performance metrics
- Error rate monitoring

## 🔧 Configuration

### **Customize Validation Rules:**
Edit `scripts/blog-validator.js` to modify:
- Word count requirements
- Readability thresholds
- Required frontmatter fields
- Affiliate link patterns

### **Customize Fix Rules:**
Edit `scripts/blog-fixer.js` to modify:
- Auto-fix behaviors
- Disclosure positioning
- Formatting rules
- Meta field generation

### **Customize Enhancement Rules:**
Edit `scripts/blog-enhancer.js` to modify:
- CTA placement
- Schema markup generation
- Social media content
- Keyword generation

## 🎯 Best Practices

### **Content Creation:**
1. Always work on preview branch
2. Run validation before committing
3. Fix critical errors immediately
4. Review warnings and suggestions
5. Test on preview before merging

### **Deployment:**
1. Keep main branch clean and fast
2. Use preview as quality gate
3. Monitor validation results
4. Optimize based on feedback
5. Update rules as needed

### **Maintenance:**
1. Review validation rules quarterly
2. Update enhancement features monthly
3. Monitor performance impact
4. Gather user feedback
5. Iterate and improve

## 📞 Troubleshooting

### **Common Issues:**

#### **Validation Skipped:**
```bash
# Check current branch
git branch --show-current

# Switch to preview if needed
git checkout preview
```

#### **Build Fails:**
```bash
# Check for syntax errors
npm run validate:preview

# Fix issues
npm run fix:preview

# Try again
npm run build
```

#### **Performance Issues:**
```bash
# Run validation on specific files only
node scripts/preview-validator.js --file path/to/file.md

# Skip enhancements if needed
npm run validate:preview && npm run fix:preview
```

### **Getting Help:**
1. Check validation output for specific errors
2. Review the validation documentation
3. Test with sample content
4. Check Node.js version compatibility
5. Verify all dependencies are installed

---

**Remember**: The preview branch is your quality gate. Keep it clean, validated, and ready for production. Main branch should always be fast and reliable for deployments. 