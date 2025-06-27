/// <reference types="astro/client" />
import type { APIRoute } from 'astro';
import { buildPrompt, type PromptData } from '../../utils/promptBuilder';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();

  const { recipient, interests, budget, style } = data as PromptData;

  if (!recipient || !interests || !budget) {
    return new Response(
      JSON.stringify({
        error: 'Missing required fields',
      }),
      { status: 400 }
    );
  }

  const prompt = buildPrompt({ recipient, interests, budget, style });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that suggests thoughtful and creative gift ideas.' },
        { role: 'user', content: prompt },
      ],
    });

    const ideas = completion.choices[0]?.message?.content?.trim() || '';

    return new Response(JSON.stringify({ ideas }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to generate ideas' }), { status: 500 });
  }
}; 