import { Text, View } from 'react-native';
import { Control, Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMoodLogSchema, CreateMoodLogData } from '@beacon/validation';
import { FormTextInput } from '@/components/form/FormTextInput';
import Slider from '@react-native-community/slider';
import MoodFace from '@/components/MoodFace';
import { format } from 'date-fns';
import UIButton from '@/components/ui/UIButton';
import { useLogCreator } from '@/context/logCreatorContext';
import { Toast } from 'toastify-react-native';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { createMoodLogRequest } from '@/api/moodLogApi';

const MoodLogForm = ({
  shouldPost,
  callback,
  saveLabel = 'Save',
}: {
  shouldPost: boolean;
  callback?: () => void;
  saveLabel?: string;
}) => {
  const { setCreateMoodLogData, resetCreateMoodLogData, createMoodLogData } =
    useLogCreator();
  const { control, handleSubmit, reset } = useForm<CreateMoodLogData>({
    resolver: zodResolver(createMoodLogSchema),
    defaultValues: {
      stressScale:
        createMoodLogData.stressScale == 0 ? 50 : createMoodLogData.stressScale,
      anxietyScale:
        createMoodLogData.anxietyScale == 0
          ? 50
          : createMoodLogData.anxietyScale,
      sadnessScale:
        createMoodLogData.sadnessScale == 0
          ? 50
          : createMoodLogData.sadnessScale,
      stressNote: '',
      anxietyNote: '',
      sadnessNote: '',
    },
  });
  const moodValues = useWatch({
    control,
    name: ['stressScale', 'anxietyScale', 'sadnessScale'],
  });
  const [stress, anxiety, sadness] = moodValues;
  const moodAverage = (stress + anxiety + sadness) / 3;

  const onSubmit = async (data: CreateMoodLogData) => {
    try {
      if (shouldPost) {
        await createMoodLogRequest(data);
        reset();
        resetCreateMoodLogData();
        Toast.success('Mood log created successfully!');
      } else {
        setCreateMoodLogData(data);
      }

      if (callback) {
        callback();
      }
    } catch (e) {
      console.error('Error submitting mood log:', e);
      const message = parseToSeverError(e).message;
      Toast.error(message);
    }
  };

  return (
    <>
      <View className="bg-white p-6 rounded-3xl w-full max-w-md">
        <Text className="text-center text-lg font-medium mb-4">
          {format(new Date(), 'EEEE do MMMM')}
        </Text>

        <View className="items-center mb-6">
          <MoodFace mood={moodAverage} size={70} />
        </View>

        {moodQuestions(control, 'stress')}
        {moodQuestions(control, 'anxiety')}
        {moodQuestions(control, 'sadness')}
      </View>
      <View className="flex-row justify-end w-full py-6">
        <UIButton
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="sm"
          buttonClassName="w-32"
        >
          {saveLabel}
        </UIButton>
      </View>
    </>
  );
};

const moodQuestions = (
  control: Control<CreateMoodLogData>,
  feeling: 'stress' | 'anxiety' | 'sadness',
) => {
  const scaleField = `${feeling}Scale` as keyof CreateMoodLogData;
  const noteField = `${feeling}Note` as keyof CreateMoodLogData;

  const feelingLabel = {
    stress: 'stressed',
    anxiety: 'anxious',
    sadness: 'sad',
  }[feeling];

  return (
    <View className="mb-8 text-black">
      <Text className="text-base font-medium mb-1">
        How {feelingLabel} do you feel?
      </Text>

      <View className="flex-row justify-between mb-1 mt-4">
        <Text className="text-xs text-gray-500">Not at all</Text>
        <Text className="text-xs text-gray-500">Very</Text>
      </View>

      <Controller
        control={control}
        name={scaleField}
        render={({ field: { onChange, value } }) => (
          <Slider
            value={typeof value === 'number' ? value : 50}
            onValueChange={onChange}
            minimumValue={1}
            maximumValue={100}
            step={1}
            thumbTintColor="#C8A69B"
            minimumTrackTintColor="#C8A69B"
            maximumTrackTintColor="#e5e5e5"
            className="w-full"
          />
        )}
      />

      <FormTextInput
        name={noteField}
        control={control}
        placeholder="Few words to describe why?"
        placeholderTextColor="#A0A0A0"
        className="pl-1"
        label={`Note (optional):`}
        labelClassName="-mb-1"
        wrapperClassName="mt-4"
      />
    </View>
  );
};

export default MoodLogForm;
