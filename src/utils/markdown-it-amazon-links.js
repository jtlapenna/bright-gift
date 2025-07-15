/**
 * Custom markdown-it plugin to add 'amazon-link' class to "View on Amazon" links
 * This plugin processes the rendered HTML and adds the class to links with "View on Amazon" text
 */

function amazonLinksPlugin(md) {
  // Store the original renderer
  const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  // Override the link_open renderer
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    
    // Look ahead to find the link text in the next few tokens
    let linkText = '';
    for (let i = idx + 1; i < tokens.length && i < idx + 5; i++) {
      if (tokens[i].type === 'text') {
        linkText += tokens[i].content;
      } else if (tokens[i].type === 'link_close') {
        break;
      }
    }
    
    // Check if this link contains "View on Amazon" text
    if (linkText.includes('View on Amazon')) {
      // Add the amazon-link class to the link
      if (!token.attrs) {
        token.attrs = [];
      }
      
      // Check if class attribute already exists
      const classIndex = token.attrs.findIndex(attr => attr[0] === 'class');
      if (classIndex >= 0) {
        // Append amazon-link to existing class
        token.attrs[classIndex][1] += ' amazon-link';
      } else {
        // Add new class attribute
        token.attrs.push(['class', 'amazon-link']);
      }
    }
    
    // Call the original renderer
    return defaultRender(tokens, idx, options, env, self);
  };
}

module.exports = amazonLinksPlugin; 