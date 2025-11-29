import type { PredictDepressionScoreOutput } from "@/ai/flows/predict-depression-score";
import type { EmpatheticFeedbackOutput } from "@/ai/flows/generate-empathetic-feedback";

export type McqResponses = {
  pleasure: string;
  mood: string;
  sleep: string;
  energy: string;
};

export type CheckInResult = {
  id: string;
  date: string;
  journalEntry: string;
  mcqResponses: McqResponses;
  prediction: PredictDepressionScoreOutput;
  feedback: EmpatheticFeedbackOutput;
};
