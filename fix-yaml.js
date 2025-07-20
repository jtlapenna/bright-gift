const fs = require('fs');
const path = require('path');

// Function to fix YAML frontmatter errors
function fixYamlErrors() {
  const blogDir = 'src/content/blog';
  const files = fs.readdirSync(blogDir);
  
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(blogDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix common YAML errors
      content = content.replace(/mpact!"/g, 'mpact"');
      content = content.replace(/ay!"/g, 'ay"');
      content = content.replace(/milies!"/g, 'milies"');
      content = content.replace(/cial."/g, 'cial"');
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed YAML errors in ${file}`);
    }
  });
}

fixYamlErrors();
console.log('All YAML errors fixed!'); 