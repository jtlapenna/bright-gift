# n8n Implementation Guide: Prevent Broken Images

## Problem Solved
This implementation will **prevent broken images** by ensuring:
- ✅ Correct slug generation from titles
- ✅ Proper image directory structure creation
- ✅ Consistent image path naming
- ✅ Automatic frontmatter validation and fixes

## Step-by-Step Implementation

### Step 1: Add Schema Enforcement Code Node

**Add this code node BEFORE your GitHub commit node in n8n:**

1. **Add Code Node** in your n8n workflow
2. **Name it**: "Enforce Schema & Fix Frontmatter"
3. **Copy the code** from `_workflow-documents/n8n-enforced-schema-code.js`
4. **Place it** between your GPT response parsing and GitHub commit nodes

### Step 2: Update GPT Prompt

**Replace your current GPT prompt** with the one from `_workflow-documents/gpt-frontmatter-prompt-fixed.md`

**Key changes:**
- GPT only generates: `title`, `description`, `keywords`
- GPT does NOT generate: `slug`, `image`, `ogImage`, `socialImage`, `category`, `date`, `status`
- n8n will handle all the technical fields automatically

### Step 3: Update Downstream Nodes

**Your downstream nodes will now receive these additional fields:**

```javascript
{
  // Original fields
  frontmatter: { /* corrected frontmatter */ },
  blogPost: "markdown content",
  
  // New fields from schema enforcement
  filename: "correct-slug.md",
  slug: "correct-slug", 
  imageDirectory: "public/images/blog/correct-slug",
  imageFiles: ["correct-slug-banner.webp", "correct-slug-og.webp", "correct-slug-social.webp"],
  imagePaths: {
    banner: "/images/blog/correct-slug/correct-slug-banner.webp",
    og: "/images/blog/correct-slug/correct-slug-og.webp", 
    social: "/images/blog/correct-slug/correct-slug-social.webp"
  },
  validation: {
    passed: true,
    errors: [],
    fixes: { /* any fixes applied */ }
  }
}
```

### Step 4: Update GitHub Node

**Update your GitHub commit node to use the corrected data:**

```javascript
// Use these fields from the schema enforcement node:
const filename = item.json.filename; // "correct-slug.md"
const content = item.json.blogPost; // markdown content
const commitMessage = `Add blog post: ${item.json.frontmatter.title}`;
```

### Step 5: Update Image Generation & Upload (Deep Audit & Checklist)

#### Enforced Image Schema
- **Directory:** `public/images/blog/{slug}/`
- **Filenames:** `{slug}-banner.webp`, `{slug}-og.webp`, `{slug}-social.webp`
- **Label:** Must be one of: `banner`, `og`, `social`
- **All images:** `.webp` format

#### Action Steps & Node Checklist

1. **Image Generation Node (`Generate Image (gpt-image-1)`):**
   - [x] Ensure the prompt and label are set correctly.
   - [x] Output is a base64-encoded image.
   - [x] Label must be exactly `banner`, `og`, or `social`.

2. **Filename and Slug Assignment (`Edit Fields1` and `Edit Fields2`):**
   - [x] Set `filename` as `{{ $json.slug }}-{{ $json.label }}.webp`.
   - [x] Set `slug` as `{{ $json.slug }}`.
   - [x] Ensure label is always one of: `banner`, `og`, `social`.

3. **Image Renaming Node (`renameImages1`):**
   - [x] Map index to label: 0 → `banner`, 1 → `social`, 2 → `og`.
   - [x] Use: `filename = $json.slug + '-' + label + '.webp'`.
   - [x] No extra images should overwrite these three.

4. **GitHub Image Upload Node (`github image upload`):**
   - [x] Upload to: `public/images/blog/{{ $json.slug }}/{{ $json.filename }}`.
   - [x] Ensure the file path and name match the enforced schema.

5. **ImageKit/Temp Uploads (`HTTP Request5`):**
   - [x] Temp uploads use: `public/images/tmp/{{ $json.slug }}-{{ $json.filename }}`.
   - [x] These are cleaned up after conversion.

6. **General:**
   - [ ] Always use the slug from the blog post for the image directory and filename.
   - [ ] All uploads must go to: `public/images/blog/{slug}/{slug}-{label}.webp`.
   - [ ] All images must be `.webp`.
   - [ ] Test the workflow with a new post and verify all images are named and placed correctly.

#### Example Expression for Filename
```n8n
{{ $json.slug }}-{{ $json.label }}.webp
```

#### Example Expression for Upload Path
```n8n
public/images/blog/{{ $json.slug }}/{{ $json.slug }}-{{ $json.label }}.webp
```

---

## Workflow Diagram

```
GPT Response → Parse Frontmatter → [NEW] Enforce Schema → GitHub Commit
                ↓                      ↓                    ↓
            Raw frontmatter      Corrected frontmatter   Files committed
            (may have issues)    (all issues fixed)      (no broken images)

Image Prompts → Generate Image → Set Filename/Slug/Label → Upload to GitHub
                ↓                    ↓                        ↓
           base64 image        {slug}-{label}.webp      public/images/blog/{slug}/
```

## Testing the Implementation

### Test 1: Perfect Input
**Input:** GPT generates correct frontmatter
**Expected:** No changes, everything works as before

### Test 2: Wrong Slug
**Input:** GPT generates `slug: "wrong-slug"`
**Expected:** n8n fixes to `slug: "correct-slug"` and updates all image paths

### Test 3: Missing Fields
**Input:** GPT only generates `title`, `description`, `keywords`
**Expected:** n8n adds all missing fields with correct values

### Test 4: Wrong Image Paths
**Input:** GPT generates wrong image paths
**Expected:** n8n fixes all image paths to match actual file locations

### Test 5: Image Upload QA
**Input:** New blog post with images
**Expected:** All images are named `{slug}-banner.webp`, `{slug}-og.webp`, `{slug}-social.webp` and placed in `public/images/blog/{slug}/`

## Benefits

✅ **No more broken images** - Image paths always match actual files
✅ **Consistent naming** - All slugs follow the same pattern
✅ **Automatic fixes** - Issues are corrected automatically
✅ **Future-proof** - Works regardless of GPT output quality
✅ **Zero risk** - Only fixes issues, doesn't break working content

## Troubleshooting

### If images still appear broken:
1. Check that image generation saves files to `item.json.imageDirectory`
2. Verify image filenames match `item.json.imageFiles`
3. Ensure GitHub commit uses `item.json.filename` for the markdown file
4. Ensure image upload nodes use `{slug}-{label}.webp` and correct directory

### If workflow fails:
1. Check n8n logs for validation errors
2. Verify all required fields are present in input
3. Ensure downstream nodes use the corrected data fields

## Success Criteria

After implementation, you should be able to:
- ✅ Run the n8n workflow with any GPT output
- ✅ Get consistent, working blog posts every time
- ✅ Have images that always load correctly
- ✅ Never see broken image links in your content 
- ✅ All images are named and placed according to the enforced schema 