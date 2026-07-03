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
        'wellness': 'health-focused, self-care, mindfulness, fitness, nutrition, or wellness-enhancing items',
        'athletics': 'sports equipment, athletic wear, fitness gear, workout accessories, or performance-enhancing items',
        'beauty': 'skincare, makeup, beauty tools, grooming products, or beauty-enhancing items',
        'book-lover': 'books from Bookshop.org (supporting independent bookstores), reading accessories from Amazon, literary-themed items, bookmarks, reading lights, or book-related gifts',
        'black-owned': 'products from Black-owned businesses, supporting diverse entrepreneurs and inclusive shopping choices',
        'practical': 'useful, everyday, problem-solving, durable, low-clutter, or routine-friendly items',
        'thoughtful': 'personal, meaningful, appreciative, memory-making, or considerate items that show attention to the recipient',
        'cozy': 'warm, comforting, relaxing, home-friendly, soft, or restful items',
        'professional': 'polished, workplace-appropriate, client-safe, manager-safe, discreet, or office-friendly items'
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
                case 'wellness':
                    styleGuidance += `\n- For wellness: Focus on health, self-care, mindfulness, fitness, nutrition, or wellness-enhancing items. When possible, suggest products from Black-owned wellness brands like Endorf or Caribe Coffee.`;
                    break;
                case 'athletics':
                    styleGuidance += `\n- For athletics: Include sports equipment, athletic wear, fitness gear, workout accessories, or performance-enhancing items. When possible, suggest products from Black-owned athletic brands like Furi Sport or Be Yourself 314. IMPORTANT: Only categorize items as "workout accessories" if they are genuinely related to fitness, exercise, or athletic activities. Do not categorize kitchen tools, beverage accessories, or non-athletic items as workout accessories.`;
                    break;
                case 'beauty':
                    styleGuidance += `\n- For beauty: Focus on skincare, makeup, beauty tools, grooming products, or beauty-enhancing items. When possible, suggest products from Black-owned beauty brands like BeautyStat or Kadalys.`;
                    break;
                case 'book-lover':
                    styleGuidance += `\n- For book-lover: Include a mix of books from Bookshop.org (supporting independent bookstores) and reading accessories from Amazon. Focus on literary-themed items, reading enhancement tools, and book-related gifts.`;
                    break;
                case 'black-owned':
                    styleGuidance += `\n- For black-owned: Support diverse entrepreneurs and inclusive shopping by recommending products from Black-owned businesses. When possible, suggest specific products from these Black-owned brands:
  * BeautyStat (skincare and beauty products)
  * Furi Sport (athletic wear and sports equipment)
  * Be Yourself 314 (dance fitness apparel)
  * Be Rooted (stationery and planners)
  * Kadalys (organic skincare)
  * Endorf (wellness and supplements)
  * Caribe Coffee (sustainable coffee)
  * Cashblack (cashback programs)`;
                    break;
                case 'practical':
                    styleGuidance += `\n- For practical: Prioritize useful, durable, low-clutter gifts that solve a real everyday problem for this recipient.`;
                    break;
                case 'thoughtful':
                    styleGuidance += `\n- For thoughtful: Choose gifts that feel personal, appreciative, and connected to the recipient's real routines or interests.`;
                    break;
                case 'cozy':
                    styleGuidance += `\n- For cozy: Focus on comfort, warmth, relaxation, home routines, soft textures, or calm rituals.`;
                    break;
                case 'professional':
                    styleGuidance += `\n- For professional: Keep gifts polished, office-appropriate, manager-safe, client-safe, and not overly intimate.`;
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
    
    // CRITICAL: Add specific instructions to avoid nonsensical suggestions
    prompt += `\n\nCRITICAL INSTRUCTIONS:\n- Focus on the recipient's specific interests (${interests}) and age/life stage\n- Suggest only tangible, physical products that can be purchased online\n- DO NOT suggest vague concepts like "eco-friendly apps" or "mindfulness subscriptions"\n- DO NOT suggest digital services, apps, or subscriptions unless they are clearly defined physical products\n- Each suggestion must be a specific, purchasable item\n- Ensure suggestions are age-appropriate and relevant to the recipient's interests\n- If suggesting books, recommend specific titles, not generic categories\n- If suggesting reading accessories, be specific about the product type\n- Avoid generic wellness suggestions - be specific about the actual product`;
    
    // CRITICAL: Add format instruction for AI response
    prompt += `\n\nReturn the response as a markdown-formatted list. Each item should have a title, a short (1-2 sentence) description that clearly shows the style elements, and a product category tag. For example:\n\n**1. Handmade Wooden Gaming Dice Set**  \nArtisan-crafted wooden dice with quirky gaming references carved into each side - perfect for tabletop gamers who appreciate unique, conversation-starting accessories.  \n_Tag: Games_\n`;
    
    // Add intelligent book suggestions for any topic
    prompt += `\n\nINTELLIGENT BOOK SUGGESTIONS:\n- Consider suggesting relevant books for ANY topic or interest\n- For fitness/athletics: suggest books about training, nutrition, or sports\n- For cooking: suggest cookbooks or food-related books\n- For wellness: suggest health, nutrition, or self-help books\n- For hobbies: suggest books related to the specific hobby\n- For professionals: suggest career or industry-related books\n- Always suggest specific book titles, not generic categories\n- Use tag "Book" for actual books (fiction, non-fiction, etc.)`;
    
    // Add Afrofiliate integration guidance
    prompt += `\n\nAFROFILIATE INTEGRATION:\n- When relevant, suggest products from our Black-owned partner brands:\n  * BeautyStat (skincare and beauty products) - for beauty, wellness, self-care interests\n  * Furi Sport (athletic wear) - for fitness, athletics, workout interests\n  * Be Yourself 314 (dance fitness) - for dance, fitness, athletic interests\n  * Be Rooted (stationery and planners) - for organization, planning, journaling interests\n  * Kadalys (organic skincare) - for skincare, beauty, organic interests\n  * Endorf (wellness and supplements) - for health, wellness, nutrition interests\n  * Caribe Coffee (sustainable coffee) - for coffee, beverage, sustainable interests\n- Only suggest these brands when the interests naturally align\n- Do not force these suggestions - only when genuinely relevant`;
    
    // Add age-appropriate guidance for older recipients
    if (recipient && (recipient.includes('70') || recipient.includes('elderly') || recipient.includes('senior') || recipient.includes('older'))) {
        prompt += `\n\nAGE-APPROPRIATE GUIDANCE FOR OLDER RECIPIENTS:\n- Focus on practical, useful items that enhance daily life\n- Suggest items that are easy to use and maintain\n- Consider comfort and accessibility in suggestions\n- For readers: suggest comfortable reading aids, large-print books, or ergonomic reading accessories\n- Avoid overly complex gadgets or items requiring technical knowledge\n- Prioritize items that support independence and quality of life`;
    }
    
    // Add specific guidance for beverage interests
    if (interests && (interests.toLowerCase().includes('drinking') || interests.toLowerCase().includes('beer') || interests.toLowerCase().includes('wine') || interests.toLowerCase().includes('coffee') || interests.toLowerCase().includes('tea'))) {
        prompt += `\n\nSPECIAL INSTRUCTIONS FOR BEVERAGE INTERESTS:\n- For beer/wine interests: Suggest appropriate beverage accessories like bottle openers, wine glasses, beer steins, wine bags, etc.\n- For coffee interests: Suggest coffee makers, mugs, coffee accessories, coffee beans, etc.\n- For tea interests: Suggest tea sets, tea accessories, tea varieties, etc.\n- IMPORTANT: Categorize beverage accessories appropriately:\n  * Use "Kitchen Tools" for bottle openers, corkscrews, etc.\n  * Use "Food & Beverages" for actual beverages, glasses, mugs, etc.\n  * Use "Kitchen Accessories" for beverage-related tools\n  * NEVER categorize beverage accessories as "Workout Accessories" or "Athletic Wear"\n- Only suggest athletic/sports items if the recipient has genuine athletic interests, not just beverage interests`;
    }
    
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
