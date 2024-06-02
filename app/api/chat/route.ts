import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const result = await generateText({
      model: openai('gpt-3.5-turbo-16k'),
      system: 'You are an Ontario, Canada grade 5 teacher refining a report card comment for a student. Be professional and encouraging. *N* is a students name. *H*self is himself/herself. *R* is his/her. *P* is he/she. *H* is him/her. Use these as placeholders.',
      prompt: `Improve this comment. Make the feedback concise using a professional tone. Make the new comment 1400 characters or less. Don't include anything other than then new comment in the response. Heres the comment: ${text}`,
    });
  
    // return result and send 200
    return new Response(result.text, { status: 200 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }

}