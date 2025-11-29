"use server";

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { predictDepressionScore } from '@/ai/flows/predict-depression-score';
import { generateEmpatheticFeedback } from '@/ai/flows/generate-empathetic-feedback';
import type { CheckInResult } from '@/lib/types';

const checkInSchema = z.object({
  journalEntry: z.string().min(10, 'Please write a bit more for a better analysis.'),
  pleasure: z.string(),
  mood: z.string(),
  sleep: z.string(),
  energy: z.string(),
});

export async function handleCheckIn(prevState: any, formData: FormData): Promise<CheckInResult | { error: string }> {
  const validatedFields = checkInSchema.safeParse({
    journalEntry: formData.get('journalEntry'),
    pleasure: formData.get('pleasure'),
    mood: formData.get('mood'),
    sleep: formData.get('sleep'),
    energy: formData.get('energy'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.journalEntry?.[0] ?? "Invalid input." };
  }

  const { journalEntry, ...mcqResponses } = validatedFields.data;

  const mcqString = Object.entries(mcqResponses)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join(', ');

  try {
    const prediction = await predictDepressionScore({
      journalEntry,
      mcqResponses: mcqString,
    });

    const feedback = await generateEmpatheticFeedback({
      journalEntry,
      mcqResponses: mcqString,
      depressionScore: prediction.score,
      depressionLevel: prediction.level,
    });

    return {
      id: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      journalEntry,
      mcqResponses,
      prediction,
      feedback,
    };
  } catch (error) {
    console.error('AI Flow Error:', error);
    return { error: 'Failed to get analysis. Please try again later.' };
  }
}

export async function logout() {
  cookies().delete('user_name');
  redirect('/');
}
