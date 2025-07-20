#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Function to validate YAML frontmatter
function validateYamlFrontmatter() {
  const blogDir = 'src/content/blog';
  const files = fs.readdirSync(blogDir);
  let hasErrors = false;
  
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        
        try {
          // Try to parse YAML
          yaml.load(frontmatter);
          console.log(`✅ ${file}: YAML is valid`);
        } catch (error) {
          console.error(`❌ ${file}: YAML error - ${error.message}`);
          hasErrors = true;
        }
      }
    }
  });
  
  if (hasErrors) {
    console.error('\n🚨 YAML validation failed! Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All YAML frontmatter is valid!');
  }
}

validateYamlFrontmatter(); 