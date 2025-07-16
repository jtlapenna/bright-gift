function buildPrompt(data) {
    const { recipient, interests, budget, styles } = data;
    // Always request 6–9 ideas (randomly pick a number in that range for variety)
    const ideaCount = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, or 9
    
    // Style definitions for better AI understanding
    const styleDefinitions = {
        'eco-friendly': 'environmentally conscious, sustainable materials, reusable, biodegradable, or energy-efficient items',
        'handmade': 'crafted by artisans, unique, one-of-a-kind, personalized, or locally made items (available on Amazon)',
        'funny': 'humorous, witty, gag gifts, novelty items, or items with clever humor',
        'pride-gifts': 'LGBTQ+ themed, rainbow colors, inclusive, supportive, or pride-related items',
        'quirky': 'unusual, unexpected, offbeat, creative, or conversation-starting items',
        'luxury': 'premium quality, high-end, sophisticated, elegant, or indulgent items',
        'techy': 'technology-focused, gadgets, innovative, smart devices, or digital items',
        'cultural-gifts': 'celebrating diverse cultures, traditional items, cultural heritage, or international gifts',
        'book-lover': 'books from Bookshop.org (supporting independent bookstores), reading accessories from Amazon, literary-themed items, bookmarks, reading lights, or book-related gifts'
    };
    
    // Build style-specific guidance
    let styleGuidance = '';
    if (styles && Array.isArray(styles) && styles.length > 0) {
        const styleDescriptions = styles.map(style => styleDefinitions[style] || style).join(', ');
        styleGuidance = `\n\nIMPORTANT: Each gift idea MUST incorporate these style elements: ${styleDescriptions}.`;
        
        // Generate dynamic guidance for each selected style
        styles.forEach(style => {
            switch(style) {
                case 'eco-friendly':
                    styleGuidance += `\n- For eco-friendly: Focus on environmentally conscious, sustainable, reusable, or biodegradable items.`;
                    break;
                case 'handmade':
                    styleGuidance += `\n- For handmade: Focus on artisan-crafted, unique, one-of-a-kind, or personalized items.`;
                    break;
                case 'funny':
                    styleGuidance += `\n- For funny: Include humor, wit, gag gifts, or novelty elements that will make them laugh.`;
                    break;
                case 'pride-gifts':
                    styleGuidance += `\n- For pride-gifts: Include LGBTQ+ themes, rainbow colors, inclusive, or supportive elements.`;
                    break;
                case 'quirky':
                    styleGuidance += `\n- For quirky: Choose unusual, unexpected, offbeat, or conversation-starting items.`;
                    break;
                case 'luxury':
                    styleGuidance += `\n- For luxury: Focus on premium quality, high-end, sophisticated, or elegant items.`;
                    break;
                case 'techy':
                    styleGuidance += `\n- For techy: Include technology-focused gadgets, innovative, or smart devices.`;
                    break;
                case 'cultural-gifts':
                    styleGuidance += `\n- For cultural-gifts: Celebrate diverse cultures, traditional items, or cultural heritage.`;
                    break;
                case 'book-lover':
                    styleGuidance += `\n- For book-lover: Include a mix of books from Bookshop.org (supporting independent bookstores) and reading accessories from Amazon. Focus on literary-themed items, reading enhancement tools, and book-related gifts.`;
                    break;
                default:
                    styleGuidance += `\n- For ${style}: Incorporate ${style} elements appropriately.`;
            }
        });
        
        styleGuidance += `\n- Combine these styles naturally - multiple styles can work together in creative ways.`;
    }
    
    let prompt = `Suggest ${ideaCount} creative gift ideas for ${recipient}.`;
    if (interests) {
        prompt += ` They enjoy ${interests}.`;
    }
    prompt += ` The budget is under $${budget}.`;
    prompt += styleGuidance;
    prompt += `\n\nReturn the response as a markdown-formatted list. Each item should have a title, a short (1-2 sentence) description that clearly shows the style elements, and a product category tag. For example:\n\n**1. Handmade Wooden Gaming Dice Set**  \nArtisan-crafted wooden dice with quirky gaming references carved into each side - perfect for tabletop gamers who appreciate unique, conversation-starting accessories.  \n_Tag: Games_\n`;
    
    // Add specific guidance for book-lover style to ensure mix of books and accessories
    if (styles && styles.includes('book-lover')) {
        prompt += `\n\nSPECIAL INSTRUCTIONS FOR BOOK LOVERS: When suggesting gifts for book lovers, include a balanced mix of:\n- Books (fiction, non-fiction, genre-specific, or themed books) - use tag "Book"\n- Reading accessories (bookmarks, reading lights, book stands, reading journals) - use tag "Reading Accessories"\n- Literary-themed items (book-themed jewelry, tote bags, candles, etc.) - use tag "Literary Gifts"\n\nIMPORTANT: For books, suggest popular, well-known titles that are likely to be available on Bookshop.org. Avoid obscure or out-of-print books. For reading accessories and literary gifts, suggest common, widely-available items that can be found on Amazon.\n\nCRITICAL TAGGING RULES:\n- Use tag "Book" ONLY for actual books (fiction, non-fiction, etc.)\n- Use tag "Reading Accessories" for bookmarks, reading lights, book stands, reading journals, book journals, etc.\n- Use tag "Literary Gifts" for book-themed items like jewelry, tote bags, candles\n- NEVER tag reading journals, book journals, or any accessories as "Book"\n- NEVER tag actual books as "Reading Accessories" or "Literary Gifts"`;
    }
    
    // Add specific guidance for horror + funny combination
    if (interests && interests.toLowerCase().includes('horror') && styles && styles.includes('funny')) {
        prompt += `\n\nSPECIAL NOTE: Since this involves horror interests with funny style, focus on horror-themed items that are intentionally humorous, witty, or have a playful take on scary themes. Think "funny horror" - items that horror fans would find amusing rather than genuinely frightening.`;
    }
    return prompt;
}

export { buildPrompt };
