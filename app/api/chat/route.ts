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
		let minCharacters: number;
		let targetCharacters: number;

		if (activeTab === 'learning skills') {
			const { minCharacters: min, maxCharacters: max } = LEARNING_SKILLS_PROMPT_CONFIG;
			maxCharacters = max;
			minCharacters = min;
			targetCharacters = Math.round((min + max) / 2);
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
			minCharacters = 0;
			targetCharacters = idealCharacters;
			prompt = `Refine this report card comment for clarity and specificity. Maintain a professional, encouraging tone.

IMPORTANT RULES:
- The comment ends with " (SW)" — preserve this suffix exactly, including parentheses.
- Your response MUST NOT exceed ${maxCharacters} characters. This is a hard cap. Aim for ${idealCharacters} characters.
- Output as a single continuous paragraph — no line breaks or paragraph separation.

Comment to refine:
${text}`;
		}

		// Sanity ceiling against runaway generation only. Length is steered by the
		// loop below (via responseText.length), not here, and reasoning tokens count
		// against this budget — so keep it generous enough to never truncate a comment.
		const maxOutputTokens = 4000;

		// Steer length toward the [minCharacters, maxCharacters] window. The model
		// can't count characters, so we adjust textVerbosity per attempt: step down to
		// 'low' when it runs long, up to 'high' when it runs short. The limit is a
		// guideline (cutting text is worse than slightly overshooting), so we never
		// truncate — if no attempt lands in range we return the closest one.
		const MAX_ATTEMPTS = 3;
		let verbosity: 'low' | 'medium' | 'high' = 'medium';
		let correction = '';
		let bestText = '';
		let bestDistance = Infinity;

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			// temperature is unsupported on reasoning models. Low reasoning effort keeps
			// latency down so multiple passes still fit in maxDuration.
			const result = await generateText({
				model: openai('gpt-5.5'),
				system: OPENAI_SYSTEM_PROMPT,
				prompt: prompt + correction,
				maxOutputTokens,
				providerOptions: { openai: { reasoningEffort: 'low', textVerbosity: verbosity } }
			});

			const responseText = result.text;
			const len = responseText.length;
			const distance =
				len > maxCharacters ? len - maxCharacters : len < minCharacters ? minCharacters - len : 0;

			console.log(
				`[chat] tab="${activeTab}" attempt=${attempt + 1} verbosity=${verbosity} ` +
					`finishReason=${result.finishReason} chars=${len} range=${minCharacters}-${maxCharacters} ` +
					`distance=${distance} usage=${JSON.stringify(result.usage)}`
			);

			if (distance < bestDistance) {
				bestDistance = distance;
				bestText = responseText;
			}

			if (distance === 0) {
				break; // landed inside the window
			}

			// Steer the next attempt back toward the target length.
			if (len > maxCharacters) {
				verbosity = 'low';
				correction = `\n\nYour previous response was ${len} characters, over the ${maxCharacters}-character guideline. Make it more concise — aim for about ${targetCharacters} characters — while preserving the required opening sentence and the " (SW)" suffix exactly.`;
			} else {
				verbosity = 'high';
				correction = `\n\nYour previous response was ${len} characters, under the ${minCharacters}-character minimum. Add more specific, concrete detail — aim for about ${targetCharacters} characters — while preserving the required opening sentence and the " (SW)" suffix exactly.`;
			}
		}

		return new Response(bestText, { status: 200 });
	} catch (error) {
		console.error('[chat] generation failed:', error);
		const message = error instanceof Error ? error.message : 'An unknown error occurred';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
