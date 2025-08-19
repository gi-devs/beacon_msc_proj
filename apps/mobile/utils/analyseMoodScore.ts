import { CreateMoodLogData } from '@beacon/validation';
import { MoodLogDTO } from '@beacon/types';

export type MoodSeverity = 'high' | 'medium' | 'low';

export function analyseMoodScales(data: MoodLogDTO | CreateMoodLogData): {
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

export const getHighestMoodScale = (data: {
  stressScale: number;
  anxietyScale: number;
  sadnessScale: number;
}): {
  scale: 'stressed' | 'anxious' | 'sad';
  value: number;
} => {
  const { stressScale, anxietyScale, sadnessScale } = data;

  if (stressScale >= anxietyScale && stressScale >= sadnessScale) {
    return { scale: 'stressed', value: stressScale };
  } else if (anxietyScale >= stressScale && anxietyScale >= sadnessScale) {
    return { scale: 'anxious', value: anxietyScale };
  } else {
    return { scale: 'sad', value: sadnessScale };
  }
};
