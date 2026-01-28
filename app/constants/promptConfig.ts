/**
 * Configuration for AI prompts and comment generation
 */

export const LEARNING_SKILLS_PROMPT_CONFIG = {
	minCharacters: 1600,
	maxCharacters: 2000,
	type: 'learning skills'
} as const;

export const DEFAULT_PROMPT_CONFIG = {
	idealCharacters: 900,
	maxCharacters: 1300,
	type: 'default'
} as const;

export const LEARNING_SKILLS_OPENING_TEXT = `In keeping with our Board’s Spiritual theme, ‘we are called to build bridges’, the school’s learning skills focus for the term has been to highlight and strengthen self regulation and independent work with a specific focus on the global competency of critical thinking.`;

export const COMMENT_SUFFIX = ' SW';

export const OPENAI_SYSTEM_PROMPT = `You are an Ontario, Canada grade 6 teacher refining a report card comment for a student. Be professional and encouraging. *N* is a students name. *H*self is himself/herself. *R* is his/her. *P* is he/she. *H* is him/her. Use these as placeholders. Correct any grammar or spelling mistakes. Ensure the placeholders are used correctly`;
