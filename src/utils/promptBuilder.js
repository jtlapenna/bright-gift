"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
export function buildPrompt(data) {
    const { recipient, interests, budget, style } = data;
    // Always request 6–9 ideas (randomly pick a number in that range for variety)
    const ideaCount = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, or 9
    let prompt = `Suggest ${ideaCount} ${style ? style + ' ' : ''}gift ideas for ${recipient}.`;
    if (interests) {
        prompt += ` They enjoy ${interests}.`;
    }
    if (style) {
        prompt += ` The style should be clearly reflected in the ideas and tone.`;
    }
    prompt += ` The budget is under $${budget}.`;
    prompt += `\n\nReturn the response as a markdown-formatted list. Each item should have a title, a short (1-2 sentence) description, and a product category tag. For example:\n\n**1. Awesome Gadget**  \nThis is a cool gadget that does amazing things.  \n_Tag: Tech_\n`;
    return prompt;
}
