import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import {
	LEARNING_SKILLS_PROMPT_CONFIG,
	DEFAULT_PROMPT_CONFIG,
	OPENAI_SYSTEM_PROMPT
} from '@/constants/promptConfig';
import { createClient } from '@/utils/supabase/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return new Response(
				JSON.stringify({ error: 'Unauthorized' }),
				{ status: 401, headers: { 'Content-Type': 'application/json' } }
			);
		}

		const { text, activeTab } = await req.json();

		if (!text || !activeTab) {
			return new Response(
				JSON.stringify({ error: 'Missing required fields: text and activeTab' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		let prompt;
		if (activeTab === 'learning skills') {
			const { minCharacters, maxCharacters } = LEARNING_SKILLS_PROMPT_CONFIG;
			prompt = `Refine this learning skill comment for clarity and specificity. Maintain a professional, encouraging tone. Preserve the first paragraph unchanged. Target ${minCharacters}-${maxCharacters} characters. Return only the refined comment.\n\n${text}`;
		} else {
			const { idealCharacters, maxCharacters } = DEFAULT_PROMPT_CONFIG;
			prompt = `Refine this report card comment for clarity and specificity. Maintain a professional, encouraging tone. Target ${idealCharacters} characters (max ${maxCharacters}). Return only the refined comment.\n\n${text}`;
		}

		const result = await generateText({
			model: openai('gpt-4.1-mini'),
			system: OPENAI_SYSTEM_PROMPT,
			prompt
		});

		return new Response(result.text, { status: 200 });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'An unknown error occurred';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
