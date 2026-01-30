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
			prompt = `Improve this learning skill comment. Make the feedback concise using a professional tone. Do not edit the first paragraph. Make the new comment max ${maxCharacters}, min ${minCharacters} characters. Don't include anything other than then new comment in the response. Heres the comment: ${text}`;
		} else {
			const { idealCharacters, maxCharacters } = DEFAULT_PROMPT_CONFIG;
			prompt = `Improve this comment. Make the feedback concise using a professional tone. Make the new comment max ${maxCharacters} characters and ideally ${idealCharacters} characters. Don't include anything other than then new comment in the response. Heres the comment: ${text}`;
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
