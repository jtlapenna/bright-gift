const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/images/favicon.png');
const outputDir = path.join(__dirname, '../public');

// Sizes for different favicon formats
const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
};

// Generate PNG favicons
async function generateFavicons() {
  console.log('Generating favicon files from images/favicon.png...');
  
  if (!fs.existsSync(logoPath)) {
    console.error(`Logo file not found: ${logoPath}`);
    process.exit(1);
  }

  try {
    // Generate all PNG sizes
    for (const [filename, size] of Object.entries(sizes)) {
      const outputPath = path.join(outputDir, filename);
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${filename} (${size}x${size})`);
    }

    // Generate favicon.ico (16x16 and 32x32 combined)
    // For simplicity, we'll use the 32x32 PNG as the ICO
    // Most systems will accept a PNG renamed as ICO
    const favicon32Path = path.join(outputDir, 'favicon-32x32.png');
    const faviconIcoPath = path.join(outputDir, 'favicon.ico');
    
    // Copy 32x32 PNG as favicon.ico (browsers accept this)
    fs.copyFileSync(favicon32Path, faviconIcoPath);
    console.log('✓ Generated favicon.ico');

    // Generate site.webmanifest
    const manifest = {
      name: 'BrightGift - AI Gift Idea Generator',
      short_name: 'BrightGift',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      theme_color: '#FF6B6B',
      background_color: '#FFFFFF',
      display: 'standalone'
    };

    fs.writeFileSync(
      path.join(outputDir, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('✓ Generated site.webmanifest');

    console.log('\n✅ All favicon files generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

