import { createMoodLog } from '@/models/model.moodLog';
import { CustomError } from '@/utils/custom-error';
import { CreateMoodLogData } from '@beacon/validation';
import { MoodLogDTO } from '@beacon/types';

async function create(
  data: CreateMoodLogData,
  userId: string,
): Promise<MoodLogDTO> {
  let {
    stressScale,
    anxietyScale,
    sadnessScale,
    stressNote,
    anxietyNote,
    sadnessNote,
  } = data;

  stressScale = Math.round(stressScale);
  anxietyScale = Math.round(anxietyScale);
  sadnessScale = Math.round(sadnessScale);

  const scales = [stressScale, anxietyScale, sadnessScale];
  const isValid = scales.every(
    (scale) => Number.isInteger(scale) && scale >= 1 && scale <= 100,
  );

  if (!isValid) {
    throw new CustomError(
      'Mood scale values must be integers between 1 and 100.',
      400,
    );
  }

  const createdMoodLog = await createMoodLog({
    stressScale,
    anxietyScale,
    sadnessScale,
    stressNote: stressNote || null,
    anxietyNote: anxietyNote || null,
    sadnessNote: sadnessNote || null,
    user: {
      connect: { id: userId },
    },
  });

  const { userId: strippedUserId, ...sanitisedMoodLog } = createdMoodLog;

  return sanitisedMoodLog;
}

export const moodLogService = {
  create,
};
