import { Text, View } from 'react-native';
import { MoodLogWithBeaconCheck } from '@beacon/types';
import MoodFace from '@/components/MoodFace';
import { computeScaleToWords } from '@/utils/analyseMoodScore';
import { getMoodColor } from '@/utils/computeColour';

const MoodLogDetail = ({ moodLog }: { moodLog: MoodLogWithBeaconCheck }) => {
  return (
    <View className="gap-4">
      <MoodScaleDetails
        scale={moodLog.anxietyScale}
        scaleName="Anxiety"
        scaleNote={moodLog.anxietyNote}
      />
      <MoodScaleDetails
        scale={moodLog.sadnessScale}
        scaleName="Sadness"
        scaleNote={moodLog.sadnessNote}
      />
      <MoodScaleDetails
        scale={moodLog.stressScale}
        scaleName="Stress"
        scaleNote={moodLog.stressNote}
      />
    </View>
  );
};

const MoodScaleDetails = ({
  scaleName,
  scaleNote,
  scale,
}: {
  scaleName: string;
  scaleNote?: string | null;
  scale: number;
}) => {
  return (
    <View className="gap-2">
      <Text className="text-xl text-gray-600">{scaleName}</Text>
      <View
        className="flex-row items-center border rounded-lg p-4 gap-4 bg-white"
        style={{
          borderColor: getMoodColor(scale),
          borderWidth: 1,
        }}
      >
        <MoodFace mood={scale} />
        <View className="gap-1">
          <Text className="text-lg font-semibold">
            {computeScaleToWords(scale)}
          </Text>
          <Text>{scaleNote ? scaleNote : 'No notes.'}</Text>
        </View>
      </View>
    </View>
  );
};

export default MoodLogDetail;
