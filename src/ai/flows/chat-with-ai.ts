'use server';

/**
 * @fileOverview A conversational AI flow for chatting with the user.
 *
 * - chatWithAIFlow - A function that handles the conversation.
 * - ChatWithAIInput - The input type for the chatWithAIFlow function.
 * - ChatWithAIOutput - The return type for the chatWithAIFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
    userInput: z.string(),
    response: z.string(),
});

const ChatWithAIInputSchema = z.object({
  userInput: z.string().describe('The latest message from the user.'),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
});
export type ChatWithAIInput = z.infer<typeof ChatWithAIInputSchema>;

export type ChatWithAIOutput = string;

export async function chatWithAIFlow(
  input: ChatWithAIInput
): Promise<ChatWithAIOutput> {
  const llmResponse = await ai.generate({
    prompt: `You are MindScript, a friendly and empathetic AI mental wellness companion. Your role is to support the user, answer their questions, and provide helpful, safe, and encouraging conversation.

    Conversation History:
    {{#each history}}
    User: {{{userInput}}}
    AI: {{{response}}}
    {{/each}}

    New User Message: {{{userInput}}}
    
    Your turn to respond as the AI:`,
    model: 'googleai/gemini-2.5-flash',
    context: {
        userInput: input.userInput,
        history: input.history,
    },
    output: {
        format: 'text'
    }
  });

  return llmResponse.text;
}
