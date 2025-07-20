const fs = require('fs');
const path = require('path');

// Files that need meta content added
const filesToUpdate = [
  '25-thoughtful-housewarming-gifts-for-new-homeowners-under-75.md',
  'affordable-gifts-for-pet-lovers-under-30.md',
  'best-gifts-for-dads-who-love-outdoor-adventures.md',
  'best-home-gifts-on-amazon-2024.md',
  'chic-wedding-gifts-for-the-stylish-couple.md',
  'eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature.md',
  'fun-gifts-for-kids-birthday-parties.md',
  'gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience.md',
  'gifts-for-new-homeowners-2025.md',
  'last-minute-birthday-gifts-for-busy-professionals.md',
  'special-birthday-gifts-for-lgbtq-youth.md',
  'unique-christmas-gifts-for-gamers-who-have-everything-2024.md',
  'unique-gifts-for-board-game-enthusiasts.md',
  'unique-graduation-gifts-creative-minds.md'
];

// Meta content templates for each file
const metaContent = {
  '25-thoughtful-housewarming-gifts-for-new-homeowners-under-75.md': {
    metaTitle: '25 Thoughtful Housewarming Gifts for New Homeowners Under $75 | BrightGift',
    metaDescription: 'Discover 25 thoughtful housewarming gifts under $75 that new homeowners will love. From practical essentials to stylish decor, find the perfect gift for their new home.'
  },
  'affordable-gifts-for-pet-lovers-under-30.md': {
    metaTitle: 'Affordable Gifts for Pet Lovers Under $30: Budget-Friendly Pet Gifts | BrightGift',
    metaDescription: 'Find the perfect affordable gifts for pet lovers under $30. From toys to treats, discover budget-friendly pet gifts that will make any animal lover happy.'
  },
  'best-gifts-for-dads-who-love-outdoor-adventures.md': {
    metaTitle: 'Best Gifts for Dads Who Love Outdoor Adventures | BrightGift',
    metaDescription: 'Discover the best gifts for adventurous dads who love the outdoors. From camping gear to hiking essentials, find perfect gifts for outdoor enthusiasts.'
  },
  'best-home-gifts-on-amazon-2024.md': {
    metaTitle: 'Best Home Gifts on Amazon 2024: Top-Rated Home & Garden Gifts | BrightGift',
    metaDescription: 'Discover the best home gifts on Amazon for 2024. From kitchen essentials to garden tools, find top-rated home and garden gifts for any occasion.'
  },
  'chic-wedding-gifts-for-the-stylish-couple.md': {
    metaTitle: 'Chic Wedding Gifts for the Stylish Couple: Elegant Wedding Gift Ideas | BrightGift',
    metaDescription: 'Find chic wedding gifts for the stylish couple. Discover elegant wedding gift ideas that combine sophistication with practicality for modern newlyweds.'
  },
  'eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature.md': {
    metaTitle: 'Eco-Friendly Gifts for Outdoor Lovers: Sustainable Nature Gifts | BrightGift',
    metaDescription: 'Discover eco-friendly gifts for outdoor lovers who want to celebrate nature sustainably. Find green gift ideas for hikers, campers, and nature enthusiasts.'
  },
  'fun-gifts-for-kids-birthday-parties.md': {
    metaTitle: 'Fun Gifts for Kids Birthday Parties: Best Birthday Gifts for Children | BrightGift',
    metaDescription: 'Find fun gifts for kids birthday parties that will make any celebration special. Discover the best birthday gifts for children of all ages.'
  },
  'gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience.md': {
    metaTitle: 'Gifts for Dungeons & Dragons Enthusiasts: Level Up Their D&D Experience | BrightGift',
    metaDescription: 'Discover perfect gifts for Dungeons & Dragons enthusiasts. From dice to accessories, find gifts that will level up their D&D gaming experience.'
  },
  'gifts-for-new-homeowners-2025.md': {
    metaTitle: 'Gifts for New Homeowners 2025: Best Housewarming Gift Ideas | BrightGift',
    metaDescription: 'Find the best gifts for new homeowners in 2025. Discover thoughtful housewarming gift ideas that will help make their new house feel like home.'
  },
  'last-minute-birthday-gifts-for-busy-professionals.md': {
    metaTitle: 'Last Minute Birthday Gifts for Busy Professionals | BrightGift',
    metaDescription: 'Find perfect last minute birthday gifts for busy professionals. Quick, thoughtful gift ideas that are easy to find and deliver on time.'
  },
  'special-birthday-gifts-for-lgbtq-youth.md': {
    metaTitle: 'Special Birthday Gifts for LGBTQ+ Youth: Inclusive Gift Ideas | BrightGift',
    metaDescription: 'Discover special birthday gifts for LGBTQ+ youth. Find inclusive, supportive gift ideas that celebrate identity and show love and acceptance.'
  },
  'unique-christmas-gifts-for-gamers-who-have-everything-2024.md': {
    metaTitle: 'Unique Christmas Gifts for Gamers Who Have Everything 2024 | BrightGift',
    metaDescription: 'Find unique Christmas gifts for gamers who have everything. Discover creative gaming gift ideas that will surprise even the most dedicated gamers.'
  },
  'unique-gifts-for-board-game-enthusiasts.md': {
    metaTitle: 'Unique Gifts for Board Game Enthusiasts: Perfect Gaming Gifts | BrightGift',
    metaDescription: 'Discover unique gifts for board game enthusiasts. Find perfect gaming gifts that will enhance their board game collection and gaming experience.'
  },
  'unique-graduation-gifts-creative-minds.md': {
    metaTitle: 'Unique Graduation Gifts for Creative Minds: Artistic Graduation Ideas | BrightGift',
    metaDescription: 'Find unique graduation gifts for creative minds. Discover artistic graduation gift ideas that celebrate creativity and support their artistic journey.'
  }
};

function addMetaContent() {
  console.log('🔧 ADDING MISSING META CONTENT\n');
  
  let updatedCount = 0;
  let errorCount = 0;
  
  filesToUpdate.forEach(filename => {
    const filePath = path.join(__dirname, '..', 'src', 'content', 'blog', filename);
    
    try {
      // Read the file
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if metaTitle and metaDescription already exist
      if (content.includes('metaTitle:') || content.includes('metaDescription:')) {
        console.log(`⏭️  ${filename}: Already has meta content, skipping`);
        return;
      }
      
      // Get the meta content for this file
      const meta = metaContent[filename];
      if (!meta) {
        console.log(`❌ ${filename}: No meta content template found`);
        errorCount++;
        return;
      }
      
      // Find the end of the frontmatter (after the closing ---)
      const frontmatterEnd = content.indexOf('---', 3);
      if (frontmatterEnd === -1) {
        console.log(`❌ ${filename}: Could not find frontmatter end`);
        errorCount++;
        return;
      }
      
      // Insert meta content before the closing ---
      const beforeClosing = content.substring(0, frontmatterEnd);
      const afterClosing = content.substring(frontmatterEnd);
      
      const newContent = `${beforeClosing}metaTitle: '${meta.metaTitle}'
metaDescription: '${meta.metaDescription}'
${afterClosing}`;
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, newContent);
      
      console.log(`✅ ${filename}: Added meta content`);
      updatedCount++;
      
    } catch (error) {
      console.log(`❌ ${filename}: Error - ${error.message}`);
      errorCount++;
    }
  });
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Errors: ${errorCount} files`);
  console.log(`   Total processed: ${filesToUpdate.length} files`);
  
  if (updatedCount > 0) {
    console.log(`\n✅ Successfully added meta content to ${updatedCount} files!`);
  }
  
  if (errorCount > 0) {
    console.log(`\n❌ ${errorCount} files had errors and need manual review.`);
  }
}

// Run the script
addMetaContent(); 