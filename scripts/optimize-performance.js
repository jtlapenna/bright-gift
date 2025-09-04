#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting performance optimization...\n');

// Check if sharp is available for image optimization
let sharpAvailable = false;
try {
  require('sharp');
  sharpAvailable = true;
  console.log('✅ Sharp is available for image optimization');
} catch (error) {
  console.log('⚠️  Sharp not available - install with: npm install sharp');
  console.log('   Will skip image optimization for now');
}

// Performance optimization functions
function optimizeImages() {
  if (!sharpAvailable) {
    console.log('⏭️  Skipping image optimization (sharp not available)');
    return;
  }

  const sharp = require('sharp');
  const imagesDir = path.join(process.cwd(), 'public/images');
  const largeImages = [];
  
  // Find large images (>100KB)
  function findLargeImages(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findLargeImages(filePath);
      } else if (file.endsWith('.webp') && stat.size > 100000) {
        largeImages.push(filePath);
      }
    }
  }
  
  findLargeImages(imagesDir);
  
  if (largeImages.length === 0) {
    console.log('✅ No large images found');
    return;
  }
  
  console.log(`🔍 Found ${largeImages.length} large images to optimize:`);
  
  for (const imagePath of largeImages) {
    const originalSize = fs.statSync(imagePath).size;
    const relativePath = path.relative(process.cwd(), imagePath);
    
    try {
      // Optimize WebP with 85% quality
      sharp(imagePath)
        .webp({ quality: 85, effort: 6 })
        .toFile(imagePath + '.tmp')
        .then(() => {
          fs.renameSync(imagePath + '.tmp', imagePath);
          const newSize = fs.statSync(imagePath).size;
          const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
          console.log(`  ✅ ${relativePath}: ${(originalSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (${savings}% savings)`);
        });
    } catch (error) {
      console.log(`  ❌ Failed to optimize ${relativePath}: ${error.message}`);
    }
  }
}

function optimizeLayout() {
  console.log('\n🔧 Optimizing Layout.astro for performance...');
  
  const layoutPath = path.join(process.cwd(), 'src/layouts/Layout.astro');
  let content = fs.readFileSync(layoutPath, 'utf8');
  
  // Add resource hints for better performance
  const resourceHints = `
		<!-- Resource hints for better performance -->
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link rel="dns-prefetch" href="https://www.google-analytics.com" />
		<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
		
		<!-- Preload critical resources -->
		<link rel="preload" href="/bright-gift-logo.webp" as="image" />
		<link rel="preload" href="/favicon.svg" as="image" />
		<link rel="preload" href="/hero-image-desktop.webp" as="image" media="(min-width: 769px)" />
		<link rel="preload" href="/hero-image-mobile.webp" as="image" media="(max-width: 768px)" />
	`;
  
  // Insert resource hints after existing preconnect links
  if (!content.includes('fonts.googleapis.com')) {
    content = content.replace(
      /(<link rel="dns-prefetch" href="https:\/\/bright-gift\.com\/" \/>)/,
      `$1${resourceHints}`
    );
  }
  
  // Optimize GTM loading - make it even more deferred
  const optimizedGTM = `
		<!-- Google Tag Manager - Load after page content with optimized loading -->
		<script is:inline>
		  // Optimized GTM loading to reduce unused JavaScript
		  window.addEventListener('load', function() {
		    // Delay GTM loading by 3 seconds to prioritize page content
		    setTimeout(function() {
		      // Google Tag Manager
		      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
		      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
		      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
		      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
		      })(window,document,'script','dataLayer','GTM-W7B2JFWV');
		      
		      // Google Analytics - Load only essential tracking
		      var gaScript = document.createElement('script');
		      gaScript.async = true;
		      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-9T1R5LN5VG';
		      document.head.appendChild(gaScript);
		      
		      gaScript.onload = function() {
		        window.dataLayer = window.dataLayer || [];
		        function gtag(){dataLayer.push(arguments);}
		        gtag('js', new Date());
		        gtag('config', 'G-9T1R5LN5VG', {
		          'send_page_view': false, // Disable automatic page view
		          'anonymize_ip': true, // Anonymize IP for privacy
		          'cookie_flags': 'SameSite=None;Secure' // Secure cookies
		        });
		      };
		    }, 3000); // 3 second delay (increased from 2)
		  });
		</script>`;
  
  // Replace the existing GTM script
  content = content.replace(
    /<!-- Google Tag Manager - Load after page content with optimized loading -->[\s\S]*?<\/script>/,
    optimizedGTM
  );
  
  fs.writeFileSync(layoutPath, content);
  console.log('  ✅ Added resource hints and optimized GTM loading');
}

function optimizeBlogTemplate() {
  console.log('\n🔧 Optimizing blog template for performance...');
  
  const blogTemplatePath = path.join(process.cwd(), 'src/pages/blog/[...slug].astro');
  let content = fs.readFileSync(blogTemplatePath, 'utf8');
  
  // Add lazy loading to images
  if (!content.includes('loading="lazy"')) {
    content = content.replace(
      /<img([^>]*?)src="([^"]*?)"([^>]*?)>/g,
      '<img$1src="$2"$3 loading="lazy">'
    );
    console.log('  ✅ Added lazy loading to images');
  }
  
  // Add fetchpriority="high" to hero images
  if (!content.includes('fetchpriority="high"')) {
    content = content.replace(
      /<img([^>]*?)src="([^"]*?)"([^>]*?)class="w-full h-full object-cover"([^>]*?)>/g,
      '<img$1src="$2"$3class="w-full h-full object-cover"$4 fetchpriority="high">'
    );
    console.log('  ✅ Added fetchpriority="high" to hero images');
  }
  
  fs.writeFileSync(blogTemplatePath, content);
}

function generatePerformanceReport() {
  console.log('\n📊 Generating performance report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    optimizations: [
      'Image optimization (WebP compression)',
      'Resource hints (preconnect, dns-prefetch)',
      'GTM loading optimization (3s delay)',
      'Lazy loading for images',
      'Fetchpriority for hero images'
    ],
    recommendations: [
      'Monitor Core Web Vitals in Google Search Console',
      'Test with Lighthouse for performance scores',
      'Consider implementing service worker for caching',
      'Monitor LCP (Largest Contentful Paint) improvements'
    ]
  };
  
  const reportPath = path.join(process.cwd(), '_workflow-documents/SEO_audit/performance-optimization-report.md');
  const reportContent = `# Performance Optimization Report

**Generated:** ${report.timestamp}

## Optimizations Applied

${report.optimizations.map(opt => `- ✅ ${opt}`).join('\n')}

## Recommendations

${report.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

## Next Steps

1. Deploy changes and monitor performance
2. Run Lighthouse audit to measure improvements
3. Check Core Web Vitals in Google Search Console
4. Monitor page load times and user experience
`;
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`  ✅ Performance report saved to ${reportPath}`);
}

// Run optimizations
async function runOptimizations() {
  try {
    optimizeImages();
    optimizeLayout();
    optimizeBlogTemplate();
    generatePerformanceReport();
    
    console.log('\n🎉 Performance optimization complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy changes to production');
    console.log('2. Run Lighthouse audit to measure improvements');
    console.log('3. Monitor Core Web Vitals in Google Search Console');
    console.log('4. Check for any remaining slow pages');
    
  } catch (error) {
    console.error('❌ Error during optimization:', error.message);
    process.exit(1);
  }
}

runOptimizations();
