import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import {
	LEARNING_SKILLS_PROMPT_CONFIG,
	DEFAULT_PROMPT_CONFIG,
	OPENAI_SYSTEM_PROMPT,
	LEARNING_SKILLS_OPENING_TEXT
} from '@/constants/promptConfig';
import { createClient } from '@/utils/supabase/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const { text, activeTab } = await req.json();

		if (!text || !activeTab) {
			return new Response(
				JSON.stringify({ error: 'Missing required fields: text and activeTab' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		let prompt;
		let maxCharacters: number;

		if (activeTab === 'learning skills') {
			const { minCharacters, maxCharacters: max } = LEARNING_SKILLS_PROMPT_CONFIG;
			maxCharacters = max;
			prompt = `Refine this learning skill comment for clarity and specificity. Maintain a professional, encouraging tone.

IMPORTANT RULES:
- The opening sentence MUST remain EXACTLY as written — do not modify it: "${LEARNING_SKILLS_OPENING_TEXT}"
- The comment ends with " (SW)" — preserve this suffix exactly, including parentheses.
- Your response MUST be between ${minCharacters}-${maxCharacters} characters. Do NOT exceed ${maxCharacters} characters.

Comment to refine:
${text}`;
		} else {
			const { idealCharacters, maxCharacters: max } = DEFAULT_PROMPT_CONFIG;
			maxCharacters = max;
			prompt = `Refine this report card comment for clarity and specificity. Maintain a professional, encouraging tone.

IMPORTANT RULES:
- The comment ends with " (SW)" — preserve this suffix exactly, including parentheses.
- Your response MUST NOT exceed ${maxCharacters} characters. This is a hard cap. Aim for ${idealCharacters} characters.

Comment to refine:
${text}`;
		}

		// Calculate max tokens based on character limit (~3.5 chars per token)
		const maxTokens = Math.ceil(maxCharacters / 3.5);

		// Retry loop to enforce character limits
		const MAX_ATTEMPTS = 2;
		let responseText = '';

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const currentPrompt =
				attempt === 0
					? prompt
					: `${prompt}\n\nCRITICAL: Your previous response was ${responseText.length} characters, which exceeds the limit of ${maxCharacters}. You MUST shorten it significantly.`;

			const result = await generateText({
				model: openai('gpt-4.1'),
				system: OPENAI_SYSTEM_PROMPT,
				prompt: currentPrompt,
				maxTokens,
				temperature: 0.5
			});

			responseText = result.text;

			if (responseText.length <= maxCharacters) {
				break;
			}

			console.log(
				`Attempt ${attempt + 1}: Response was ${responseText.length} chars (limit: ${maxCharacters}). Retrying...`
			);
		}

		return new Response(responseText, { status: 200 });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'An unknown error occurred';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
