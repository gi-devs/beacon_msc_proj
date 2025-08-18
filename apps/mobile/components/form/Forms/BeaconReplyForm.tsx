import { View, Text, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import {
  CreateBeaconFormData,
  createBeaconFormSchema,
} from '@beacon/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import Colors from '@/constants/Colors';
import { useEffect } from 'react';

type ReplyOption = {
  id: number;
  text: string;
  key: BeaconReplyTextKey;
};

interface BeaconReplyFormProps {
  beaconId: number;
  beaconNotificationId: number;
  replyOptions: ReplyOption[];
  onSubmit: (data: CreateBeaconFormData) => void;
  onSelectedReply?: (submit: () => void, hasSelection: () => boolean) => void;
}

const BeaconReplyForm = ({
  beaconId,
  beaconNotificationId,
  replyOptions,
  onSubmit,
  onSelectedReply,
}: BeaconReplyFormProps) => {
  const { handleSubmit, setValue, watch } = useForm<CreateBeaconFormData>({
    resolver: zodResolver(createBeaconFormSchema),
    defaultValues: {
      replyTextId: null,
      replyTextKey: null,
      beaconId,
      beaconNotificationId,
    },
  });

  const replyTextId = watch('replyTextId');
  const replyTextKey = watch('replyTextKey');

  useEffect(() => {
    if (onSelectedReply) {
      onSelectedReply(
        handleSubmit(onSubmit),
        () => !!(replyTextId && replyTextKey),
      );
    }
  }, [replyTextId, replyTextKey]);

  return (
    <View className="flex-1 flex-col gap-4 mt-8">
      {replyOptions.map((reply, index) => {
        const colourIndex = (6 - index) as 1 | 2 | 3 | 4 | 5 | 6;

        return (
          <ReplyButton
            key={reply.key + reply.id}
            onPress={() => {
              // if currently selected, deselect
              if (replyTextId === reply.id && replyTextKey === reply.key) {
                setValue('replyTextId', null);
                setValue('replyTextKey', null);
                return;
              }

              setValue('replyTextId', reply.id);
              setValue('replyTextKey', reply.key);
            }}
            colourIndex={colourIndex}
            selected={replyTextId === reply.id && replyTextKey === reply.key}
          >
            {reply.text}
          </ReplyButton>
        );
      })}
    </View>
  );
};

const ReplyButton = ({
  onPress,
  children,
  colourIndex,
  selected,
}: {
  onPress: () => void;
  children: React.ReactNode;
  colourIndex: 1 | 2 | 3 | 4 | 5 | 6;
  selected: boolean;
}) => {
  return (
    <TouchableOpacity
      className="rounded-md px-6 py-4 justify-center"
      onPress={onPress}
      style={{
        backgroundColor: Colors.app.ripple[`${colourIndex}00`],
        borderRadius: 8,
        height: 70,
      }}
    >
      {selected && (
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.7)', // white tint
            inset: 0,
            position: 'absolute',
          }}
        />
      )}
      <View className="justify-center items-start relative z-10">
        <Text
          className="font-semibold leading-normal"
          style={{
            flexWrap: 'wrap',
            flexShrink: 1,
            color: selected ? '#1a1a1a' : '#ffffff',
          }}
          numberOfLines={0}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BeaconReplyForm;
