import { Text, View } from 'react-native';
import { useLogCreator } from '@/context/logCreatorContext';
import { Controller, useForm } from 'react-hook-form';
import {
  CreateJournalEntryData,
  createJournalEntrySchema,
  createJournalEntrySchemaWithOptionalTags,
} from '@beacon/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJournalEntryRequest } from '@/api/moodLoggerApi';
import { Toast } from 'toastify-react-native';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { AppStyles } from '@/constants/AppStyles';
import { format } from 'date-fns';
import MoodFace from '@/components/MoodFace';
import UIButton from '@/components/ui/UIButton';
import Slider from '@react-native-community/slider';
import { FormTextInput } from '@/components/form/FormTextInput';

const JournalEntryForm = ({
  shouldPost,
  callback,
  saveLabel = 'Save',
}: {
  shouldPost: boolean;
  callback?: (
    journalEntryDataFromForm: CreateJournalEntryData,
  ) => void | Promise<void>;
  saveLabel?: string;
}) => {
  const {
    setCreateJournalEntryData,
    resetCreateJournalEntryData,
    createJournalEntryData,
    createMoodLogData: { stressScale, sadnessScale, anxietyScale },
  } = useLogCreator();
  const moodAverage = (stressScale + sadnessScale + anxietyScale) / 3;
  const schema = shouldPost
    ? createJournalEntrySchema
    : createJournalEntrySchemaWithOptionalTags;

  const { control, handleSubmit, reset } = useForm<CreateJournalEntryData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: createJournalEntryData.title || '',
      content: createJournalEntryData.content || '',
      moodFace:
        createJournalEntryData.moodFace === 0
          ? 50
          : createJournalEntryData.moodFace,
      tags: createJournalEntryData.tags || [],
    },
  });

  const onSubmit = async (data: CreateJournalEntryData) => {
    try {
      if (shouldPost) {
        await createJournalEntryRequest(data);
        reset();
        resetCreateJournalEntryData();
        Toast.success('Journal entry created successfully!');
      } else {
        // If not posting, just set the data in context
        data.moodFace = moodAverage;
        setCreateJournalEntryData(data);
      }

      if (callback) {
        await callback(data);
      }
    } catch (e) {
      console.error('Error submitting journal entry:', e);
      const message = parseToSeverError(e).message;
      Toast.error(message);
    }
  };

  return (
    <>
      <View
        className="bg-white p-6 rounded-3xl w-full max-w-md z-10"
        style={AppStyles.containerShadow}
      >
        <Text
          className="text-lg font-medium mb-4"
          style={!shouldPost && { textAlign: 'center' }}
        >
          {format(new Date(), 'EEEE do MMMM')}
        </Text>

        {!shouldPost ? (
          <View className="mb-4 flex-row items-center gap-4 justify-center">
            <MoodFace mood={moodAverage} size={36} />
          </View>
        ) : (
          <View className="mb-6 flex-row items-center gap-4 justify-center">
            <Controller
              control={control}
              name="moodFace"
              render={({ field: { onChange, value } }) => {
                return (
                  <>
                    <MoodFace mood={value} size={36} />
                    <View className="flex-1">
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
                    </View>
                  </>
                );
              }}
            />
          </View>
        )}

        <View>
          <FormTextInput
            name="title"
            label="Title"
            control={control}
            placeholder="Today was a good day"
            placeholderTextColor="#999"
            className="text-black pl-1"
            wrapperClassName="mb-4"
          />
        </View>
        <View>
          <FormTextInput
            name="content"
            label="Content"
            control={control}
            placeholder="Write about your day..."
            placeholderTextColor="#999"
            className="text-black"
            wrapperClassName="mb-4"
            variant="textarea"
            multiline
          />
        </View>
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

export default JournalEntryForm;
