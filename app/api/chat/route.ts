import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text, activeTab } = await req.json();

    let prompt;
    switch (activeTab) {
      case 'learning skills': {
        const minCharacters = 1600;
        const maxCharacters = 2000;
        prompt = `Improve this learning skill comment. Make the feedback concise using a professional tone. Do not edit the first paragraph. Make the new comment max ${maxCharacters}, min ${minCharacters} characters. Don't include anything other than then new comment in the response. Heres the comment: ${text}`;
        break;
      }
      default: {
        const idealCharacters = 900;
        const maxCharacters = 1300;
        prompt = `Improve this comment. Make the feedback concise using a professional tone. Make the new comment max ${maxCharacters} characters and ideally ${idealCharacters} characters. Don't include anything other than then new comment in the response. Heres the comment: ${text}`;
        break;
      }
    }

    const result = await generateText({
      model: openai('gpt-3.5-turbo-16k'),
      system: 'You are an Ontario, Canada grade 6 teacher refining a report card comment for a student. Be professional and encouraging. *N* is a students name. *H*self is himself/herself. *R* is his/her. *P* is he/she. *H* is him/her. Use these as placeholders.',
      prompt,
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