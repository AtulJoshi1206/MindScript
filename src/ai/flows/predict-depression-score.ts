'use server';

/**
 * @fileOverview Predicts a depression score based on journal entries and MCQ responses.
 *
 * - predictDepressionScore - A function that predicts the depression score.
 * - PredictDepressionScoreInput - The input type for the predictDepressionScore function.
 * - PredictDepressionScoreOutput - The return type for the predictDepressionScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDepressionScoreInputSchema = z.object({
  journalEntry: z.string().describe('The user journal entry for the day.'),
  mcqResponses: z
    .string()
    .describe('The user multiple choice question responses for the day.'),
});
export type PredictDepressionScoreInput = z.infer<
  typeof PredictDepressionScoreInputSchema
>;

const PredictDepressionScoreOutputSchema = z.object({
  score: z.number().describe('The predicted depression score.'),
  level: z.string().describe('The predicted depression level (e.g., mild, moderate, severe).'),
  reasoning: z.string().describe('Explanation of why the score was assigned.'),
});
export type PredictDepressionScoreOutput = z.infer<
  typeof PredictDepressionScoreOutputSchema
>;

export async function predictDepressionScore(
  input: PredictDepressionScoreInput
): Promise<PredictDepressionScoreOutput> {
  return predictDepressionScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDepressionScorePrompt',
  input: {schema: PredictDepressionScoreInputSchema},
  output: {schema: PredictDepressionScoreOutputSchema},
  prompt: `Given the following journal entry and multiple-choice question responses, predict the user's depression score and level.

Journal Entry: {{{journalEntry}}}
MCQ Responses: {{{mcqResponses}}}

Provide a numerical score, a depression level (e.g., mild, moderate, severe) and the reasoning behind the assigned score.

Score:
Level:
Reasoning:`,
});

const predictDepressionScoreFlow = ai.defineFlow(
  {
    name: 'predictDepressionScoreFlow',
    inputSchema: PredictDepressionScoreInputSchema,
    outputSchema: PredictDepressionScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
