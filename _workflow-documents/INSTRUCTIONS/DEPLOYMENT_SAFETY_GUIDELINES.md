# Deployment Safety Guidelines

## 🚨 Critical Rule: Never Break Production

**Before making ANY changes to deployment-critical files, verify they won't break the live site.**

---

## 🔒 Protected Files (Require Extra Caution)

These files are **critical to site functionality** and should only be modified with extreme care:

### **Configuration Files**
- `astro.config.mjs` - Core Astro/Cloudflare configuration
- `package.json` - Build scripts and dependencies
- `wrangler.toml` - Cloudflare Workers/Pages configuration
- `nixpacks.toml` - Build configuration (if exists)

### **Build & Deployment Files**
- `public/_redirects` - URL routing
- `public/_headers` - Security headers
- `scripts/generate-sitemap.js` - Sitemap generation
- `package.json` build scripts (`prebuild`, `build`, `postbuild`)

---

## ✅ Pre-Deployment Checklist

Before pushing changes to production:

### 1. **Test Locally First**
```bash
# Run the build locally
npm run build

# Verify build succeeds without errors
# Check that dist/ directory is created correctly
ls -la dist/
```

### 2. **Verify Critical Configurations**
- [ ] `astro.config.mjs` - No breaking changes to adapter configuration
- [ ] `package.json` - Build scripts still work correctly
- [ ] No new framework detection files (`nixpacks.toml`, etc.) that could confuse Cloudflare
- [ ] Output directory matches Cloudflare Pages settings (`dist`)

### 3. **Check for Framework Detection Issues**
- [ ] No conflicting build configuration files
- [ ] `wrangler.toml` (if exists) is correct for Cloudflare Pages
- [ ] No Next.js/OpenNext configuration files that could confuse detection

### 4. **Validation Scripts**
- [ ] If modifying `prebuild`, ensure it doesn't block builds unnecessarily
- [ ] Validation scripts should fail gracefully or be non-blocking
- [ ] Sitemap generation should always run

---

## 🛡️ Safe Change Procedure

### **For Configuration Changes:**

1. **Create a backup branch first:**
   ```bash
   git checkout -b backup-before-config-change
   git push origin backup-before-config-change
   ```

2. **Make changes on a feature branch:**
   ```bash
   git checkout -b config-change-attempt
   # Make your changes
   ```

3. **Test locally:**
   ```bash
   npm run build
   npm run preview  # If available
   ```

4. **If build succeeds, merge to main:**
   ```bash
   git checkout main
   git merge config-change-attempt
   git push origin main
   ```

5. **Monitor deployment:**
   - Watch Cloudflare Pages build logs
   - Verify site loads correctly after deployment
   - Check for runtime errors

### **For Build Script Changes:**

1. **Test the new script locally:**
   ```bash
   npm run prebuild  # Test the exact command
   npm run build     # Ensure full build works
   ```

2. **Use non-blocking approach when possible:**
   ```bash
   # Instead of:
   npm run validate && npm run build
   
   # Use:
   npm run validate || true
   npm run build
   ```

3. **Keep validation scripts separate from critical builds:**
   - Critical: sitemap generation, build process
   - Optional: validation, linting, checks

---

## 🚫 What NOT to Do

### **Never Do These:**

❌ **Remove configuration without understanding its purpose**
- Even if it seems unused, it might be required for Cloudflare
- Check Cloudflare documentation before removing

❌ **Change build output directory without updating Cloudflare Pages settings**
- Cloudflare Pages dashboard must match code configuration

❌ **Add framework-specific config files that confuse auto-detection**
- `nixpacks.toml` for Railway can confuse Cloudflare Pages
- `next.config.js` or OpenNext configs will break Astro detection

❌ **Make blocking validation scripts in prebuild**
- If validation fails, the entire build fails
- Use `|| true` or make validations non-blocking

❌ **Push changes without testing locally first**
- Always run `npm run build` locally before pushing

---

## 🔄 Rollback Procedure

If a deployment breaks:

1. **Immediately revert the breaking commit:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Or restore from backup branch:**
   ```bash
   git checkout main
   git reset --hard backup-before-config-change
   git push origin main --force
   ```

3. **Monitor Cloudflare Pages dashboard:**
   - Check build logs
   - Verify deployment succeeds
   - Test site functionality

---

## 📋 Change Documentation

When making deployment-critical changes:

1. **Document the change:**
   - What was changed
   - Why it was changed
   - What the expected outcome is

2. **Include in commit message:**
   ```bash
   git commit -m "fix(config): remove platformProxy to fix Cloudflare error

   - Removed platformProxy config causing __SKEW_PROTECTION_ENABLED__ error
   - Configuration was disabled anyway, safe to remove
   - Verified build works locally before pushing"
   ```

3. **Test in staging first (if available):**
   - Use preview branch or staging environment
   - Verify changes work before merging to main

---

## 🎯 Quick Reference

### **Safe Commands Before Pushing:**
```bash
# Always run these before pushing deployment changes:
npm run build          # Verify build succeeds
npm run generate:sitemap  # Ensure sitemap generation works
ls -la dist/          # Check output directory exists
```

### **Emergency Rollback:**
```bash
# If site is broken, immediately revert last commit:
git revert HEAD
git push origin main
```

### **Check Current Configuration:**
```bash
# Verify critical files:
cat astro.config.mjs | grep -A 10 "adapter"
cat package.json | grep -A 2 "prebuild"
ls -la | grep -E "(nixpacks|wrangler|next.config)"
```

---

## 📚 Related Documentation

- `07_TECHNICAL_IMPLEMENTATION_GUIDE.md` - Technical deployment details
- `08_VERIFICATION_AND_QUALITY_CONTROL.md` - Verification processes
- Cloudflare Pages documentation for Astro SSR builds

---

**Remember: When in doubt, test locally first, create a backup branch, and verify the change is necessary before pushing to production.**

