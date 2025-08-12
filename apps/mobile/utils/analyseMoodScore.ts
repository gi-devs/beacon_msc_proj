import { CreateMoodLogData } from '@beacon/validation';

export type MoodSeverity = 'high' | 'medium' | 'low';

export function analyseMoodScales(data: CreateMoodLogData): {
  score: number;
  severity: MoodSeverity;
  shouldPromptBroadcast: boolean;
} {
  const { stressScale, anxietyScale, sadnessScale } = data;

  const avgScore = (stressScale + anxietyScale + sadnessScale) / 3;

  let severity: MoodSeverity;
  if (avgScore >= 65) severity = 'high';
  else if (avgScore >= 40) severity = 'medium';
  else severity = 'low';

  const shouldPromptBroadcast = severity === 'high';

  return {
    score: avgScore,
    severity,
    shouldPromptBroadcast,
  };
}
