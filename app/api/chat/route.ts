import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text, activeTab } = await req.json();

    let idealCharacters;
    let maxCharacters;
    switch (activeTab) {
      case 'learning skills':
        idealCharacters = 1700;
        maxCharacters = 2000;
        break;
      default:
        idealCharacters = 900;
        maxCharacters = 1300;
    }

    const result = await generateText({
      model: openai('gpt-3.5-turbo-16k'),
      system: 'You are an Ontario, Canada grade 5 teacher refining a report card comment for a student. Be professional and encouraging. *N* is a students name. *H*self is himself/herself. *R* is his/her. *P* is he/she. *H* is him/her. Use these as placeholders.',
      prompt: `Improve this comment. Make the feedback concise using a professional tone. Make the new comment max ${maxCharacters} characters and ideally ${idealCharacters} characters. Don't include anything other than then new comment in the response. Heres the comment: ${text}`,
    });
  
    return new Response(result.text, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    } else {
      return new Response('An unknown error occurred.', { status: 500 });
    }
  }

}