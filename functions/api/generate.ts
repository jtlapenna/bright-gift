import { buildPrompt, type PromptData } from '../../src/utils/promptBuilder.js';
import OpenAI from 'openai';

export const onRequestPost = async (context) => {
  const { request, env } = context;
  const data = await request.json();
  const { recipient, interests, budget, style } = data as PromptData;

  if (!recipient || !interests || !budget) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
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
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({ error: error?.message || String(error) }), { status: 500 });
  }
}; 