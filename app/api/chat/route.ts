import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import {
	LEARNING_SKILLS_PROMPT_CONFIG,
	DEFAULT_PROMPT_CONFIG,
	OPENAI_SYSTEM_PROMPT,
	LEARNING_SKILLS_OPENING_TEXT
} from '@/constants/promptConfig';
import { createClient } from '@/utils/supabase/server';

// gpt-5.5 is a reasoning model and can be slow; allow up to 60 seconds,
// since a single request may make two generation passes (initial + retry).
export const maxDuration = 60;

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
- Output as a single continuous paragraph — no line breaks or paragraph separation.

Comment to refine:
${text}`;
		} else {
			const { idealCharacters, maxCharacters: max } = DEFAULT_PROMPT_CONFIG;
			maxCharacters = max;
			prompt = `Refine this report card comment for clarity and specificity. Maintain a professional, encouraging tone.

IMPORTANT RULES:
- The comment ends with " (SW)" — preserve this suffix exactly, including parentheses.
- Your response MUST NOT exceed ${maxCharacters} characters. This is a hard cap. Aim for ${idealCharacters} characters.
- Output as a single continuous paragraph — no line breaks or paragraph separation.

Comment to refine:
${text}`;
		}

		// Calculate output tokens based on character limit (~3.5 chars per token),
		// plus headroom for gpt-5.5 reasoning tokens (which count against this budget).
		const maxOutputTokens = Math.ceil(maxCharacters / 3.5) + 2000;

		// Retry loop to enforce character limits
		const MAX_ATTEMPTS = 2;
		let responseText = '';

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const currentPrompt =
				attempt === 0
					? prompt
					: `${prompt}\n\nCRITICAL: Your previous response was ${responseText.length} characters, which exceeds the limit of ${maxCharacters}. You MUST shorten it significantly.`;

			const result = await generateText({
				model: openai('gpt-5.5'),
				system: OPENAI_SYSTEM_PROMPT,
				prompt: currentPrompt,
				maxOutputTokens,
				// temperature is unsupported on reasoning models. Use low reasoning
				// effort to keep latency down so the retry pass still fits in maxDuration.
				providerOptions: { openai: { reasoningEffort: 'low' } }
			});

			responseText = result.text;

			console.log(
				`[chat] tab="${activeTab}" attempt=${attempt + 1} finishReason=${result.finishReason} ` +
					`chars=${responseText.length} limit=${maxCharacters} usage=${JSON.stringify(result.usage)}`
			);

			if (responseText.length <= maxCharacters) {
				break;
			}

			console.log(
				`Attempt ${attempt + 1}: Response was ${responseText.length} chars (limit: ${maxCharacters}). Retrying...`
			);
		}

		return new Response(responseText, { status: 200 });
	} catch (error) {
		console.error('[chat] generation failed:', error);
		const message = error instanceof Error ? error.message : 'An unknown error occurred';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
