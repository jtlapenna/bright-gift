const fs = require('fs');
const path = require('path');

// Orphan pages that need internal links
const orphanPages = [
  '25-books-to-gift-this-holiday-season',
  '30-unique-gift-ideas-for-new-parents-baby-shower-beyond',
  'affordable-gifts-for-pet-lovers-under-30',
  'best-books-for-different-reading-levels',
  'best-gifts-for-dads-who-love-outdoor-adventures',
  'chic-wedding-gifts-for-the-stylish-couple',
  'fun-gifts-for-kids-birthday-parties',
  'gifts-for-book-lovers-under-50',
  'gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience',
  'how-ai-is-revolutionizing-gift-shopping-complete-guide',
  'last-minute-birthday-gifts-for-busy-professionals',
  'special-birthday-gifts-for-lgbtq-youth',
  'unique-christmas-gifts-for-gamers-who-have-everything-2024',
  'unique-gifts-for-board-game-enthusiasts'
];

// Mapping of source files to orphan pages they should link to
const linkMapping = {
  // Books and reading related
  '25-books-to-gift-this-holiday-season.md': [
    'gifts-for-book-lovers-under-50',
    'best-books-for-different-reading-levels'
  ],
  'gifts-for-book-lovers-under-50.md': [
    '25-books-to-gift-this-holiday-season',
    'best-books-for-different-reading-levels'
  ],
  'best-books-for-different-reading-levels.md': [
    '25-books-to-gift-this-holiday-season',
    'gifts-for-book-lovers-under-50'
  ],
  
  // Gaming related
  'gifts-for-gamers-under-50.md': [
    'unique-christmas-gifts-for-gamers-who-have-everything-2024',
    'unique-gifts-for-board-game-enthusiasts',
    'gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience'
  ],
  'unique-christmas-gifts-for-gamers-who-have-everything-2024.md': [
    'gifts-for-gamers-under-50',
    'unique-gifts-for-board-game-enthusiasts',
    'gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience'
  ],
  'unique-gifts-for-board-game-enthusiasts.md': [
    'gifts-for-gamers-under-50',
    'unique-christmas-gifts-for-gamers-who-have-everything-2024',
    'gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience'
  ],
  'gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience.md': [
    'gifts-for-gamers-under-50',
    'unique-christmas-gifts-for-gamers-who-have-everything-2024',
    'unique-gifts-for-board-game-enthusiasts'
  ],
  
  // Pet related
  'affordable-gifts-for-pet-lovers-under-30.md': [
    // Will add links from other pet-related content
  ],
  
  // Outdoor and adventure related
  'eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature.md': [
    'best-gifts-for-dads-who-love-outdoor-adventures'
  ],
  'best-gifts-for-dads-who-love-outdoor-adventures.md': [
    'eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature'
  ],
  
  // Wedding and relationship related
  '25-unique-anniversary-gift-ideas-under-50.md': [
    'chic-wedding-gifts-for-the-stylish-couple'
  ],
  'chic-wedding-gifts-for-the-stylish-couple.md': [
    '25-unique-anniversary-gift-ideas-under-50'
  ],
  
  // Birthday related
  'gifts-for-girlfriend-unique-romantic-ideas.md': [
    'special-birthday-gifts-for-lgbtq-youth',
    'last-minute-birthday-gifts-for-busy-professionals'
  ],
  'last-minute-birthday-gifts-for-busy-professionals.md': [
    'special-birthday-gifts-for-lgbtq-youth',
    'fun-gifts-for-kids-birthday-parties'
  ],
  'special-birthday-gifts-for-lgbtq-youth.md': [
    'last-minute-birthday-gifts-for-busy-professionals',
    'fun-gifts-for-kids-birthday-parties'
  ],
  'fun-gifts-for-kids-birthday-parties.md': [
    'last-minute-birthday-gifts-for-busy-professionals',
    'special-birthday-gifts-for-lgbtq-youth'
  ],
  
  // Home and family related
  '25-thoughtful-housewarming-gifts-for-new-homeowners-under-75.md': [
    '30-unique-gift-ideas-for-new-parents-baby-shower-beyond',
    'gifts-for-new-homeowners-2025'
  ],
  'gifts-for-new-homeowners-2025.md': [
    '25-thoughtful-housewarming-gifts-for-new-homeowners-under-75',
    '30-unique-gift-ideas-for-new-parents-baby-shower-beyond'
  ],
  '30-unique-gift-ideas-for-new-parents-baby-shower-beyond.md': [
    '25-thoughtful-housewarming-gifts-for-new-homeowners-under-75',
    'gifts-for-new-homeowners-2025'
  ],
  
  // AI and technology related
  'how-ai-is-revolutionizing-gift-shopping-complete-guide.md': [
    // Will add links from other tech-related content
  ]
};

// Link text templates for different contexts
const linkTexts = {
  '25-books-to-gift-this-holiday-season': 'holiday book gifts',
  '30-unique-gift-ideas-for-new-parents-baby-shower-beyond': 'gifts for new parents',
  'affordable-gifts-for-pet-lovers-under-30': 'affordable pet gifts',
  'best-books-for-different-reading-levels': 'books for different reading levels',
  'best-gifts-for-dads-who-love-outdoor-adventures': 'outdoor adventure gifts for dads',
  'chic-wedding-gifts-for-the-stylish-couple': 'chic wedding gifts',
  'fun-gifts-for-kids-birthday-parties': 'fun birthday gifts for kids',
  'gifts-for-book-lovers-under-50': 'gifts for book lovers',
  'gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience': 'D&D gifts',
  'how-ai-is-revolutionizing-gift-shopping-complete-guide': 'AI gift shopping guide',
  'last-minute-birthday-gifts-for-busy-professionals': 'last minute birthday gifts',
  'special-birthday-gifts-for-lgbtq-youth': 'birthday gifts for LGBTQ+ youth',
  'unique-christmas-gifts-for-gamers-who-have-everything-2024': 'unique Christmas gifts for gamers',
  'unique-gifts-for-board-game-enthusiasts': 'board game gifts'
};

function addInternalLinks() {
  console.log('🔗 ADDING INTERNAL LINKS TO ORPHAN PAGES\n');
  
  let updatedCount = 0;
  let errorCount = 0;
  
  // Process each source file
  Object.keys(linkMapping).forEach(filename => {
    const filePath = path.join(__dirname, '..', 'src', 'content', 'blog', filename);
    const targetPages = linkMapping[filename];
    
    if (targetPages.length === 0) {
      return; // Skip if no target pages
    }
    
    try {
      // Read the file
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // Add links to each target page
      targetPages.forEach(targetPage => {
        const linkText = linkTexts[targetPage];
        const linkUrl = `/blog/${targetPage}`;
        const linkHtml = `<a href="${linkUrl}" class="internal-link">${linkText}</a>`;
        
        // Find a good place to insert the link (near the end, before the conclusion)
        const sections = content.split('---');
        if (sections.length > 1) {
          const mainContent = sections[sections.length - 1];
          
          // Look for conclusion or ending sections
          const conclusionPatterns = [
            /Tips for Choosing/i,
            /Gift Presentation Tips/i,
            /Conclusion/i,
            /Final Thoughts/i,
            /Looking for more/i
          ];
          
          let insertPosition = -1;
          for (const pattern of conclusionPatterns) {
            const match = mainContent.search(pattern);
            if (match !== -1) {
              insertPosition = match;
              break;
            }
          }
          
          if (insertPosition === -1) {
            // If no conclusion found, add before the last paragraph
            const paragraphs = mainContent.split('\n\n');
            if (paragraphs.length > 2) {
              insertPosition = mainContent.lastIndexOf(paragraphs[paragraphs.length - 2]);
            }
          }
          
          if (insertPosition !== -1) {
            // Insert the link with context
            const beforeInsert = mainContent.substring(0, insertPosition);
            const afterInsert = mainContent.substring(insertPosition);
            
            const linkContext = `\n\n> 💡 **Looking for more gift ideas?** Check out our guide to [${linkText}](${linkUrl}) for even more thoughtful options!\n\n`;
            
            const newMainContent = beforeInsert + linkContext + afterInsert;
            content = sections.slice(0, -1).join('---') + '---' + newMainContent;
            updated = true;
          }
        }
      });
      
      if (updated) {
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filename}: Added internal links`);
        updatedCount++;
      } else {
        console.log(`⏭️  ${filename}: No suitable location found for links`);
      }
      
    } catch (error) {
      console.log(`❌ ${filename}: Error - ${error.message}`);
      errorCount++;
    }
  });
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Errors: ${errorCount} files`);
  console.log(`   Total processed: ${Object.keys(linkMapping).length} files`);
  
  if (updatedCount > 0) {
    console.log(`\n✅ Successfully added internal links to ${updatedCount} files!`);
  }
  
  if (errorCount > 0) {
    console.log(`\n❌ ${errorCount} files had errors and need manual review.`);
  }
}

// Run the script
addInternalLinks(); 