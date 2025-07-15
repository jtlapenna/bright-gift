/**
 * Utility function to add 'amazon-link' class to "View on Amazon" links in HTML content
 * @param {string} htmlContent - The HTML content to process
 * @returns {string} - The processed HTML content with amazon-link classes added
 */
export function processAmazonLinks(htmlContent) {
  // Use regex to find and replace "View on Amazon" links
  return htmlContent.replace(
    /<a([^>]*?)>([^<]*?View on Amazon[^<]*?)<\/a>/gi,
    (match, attributes, linkText) => {
      // Check if class attribute already exists
      if (attributes.includes('class=')) {
        // Add amazon-link to existing class
        return `<a${attributes.replace(/class="([^"]*)"/, 'class="$1 amazon-link"')}>${linkText}</a>`;
      } else {
        // Add new class attribute
        return `<a${attributes} class="amazon-link">${linkText}</a>`;
      }
    }
  );
} 