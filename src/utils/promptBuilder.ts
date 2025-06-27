export interface PromptData {
  recipient: string;
  interests: string;
  budget: string;
  style?: string;
}

export function buildPrompt(data: PromptData): string {
  const { recipient, interests, budget, style } = data;

  let prompt = `Suggest 3 gift ideas for ${recipient}.`;

  if (interests) {
    prompt += ` They enjoy ${interests}.`;
  }

  if (style) {
    prompt += ` The desired style is ${style}.`;
  }

  prompt += ` The budget is under $${budget}.`;

  prompt += `

Return the response as a markdown-formatted list. Each item should have a title, a short (1-2 sentence) description, and a product category tag. For example:

**1. Awesome Gadget**
This is a cool gadget that does amazing things.
_Tag: Tech_
`;

  return prompt;
} 