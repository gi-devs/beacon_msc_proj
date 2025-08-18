import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import UIButton from '@/components/ui/UIButton';

function useConfirmModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );

  const confirm = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setIsVisible(true);
    });
  };

  const handleClose = (answer: boolean) => {
    if (resolver) {
      resolver(answer);
    }
    setIsVisible(false);
    setResolver(null);
  };

  const ConfirmModal = () => (
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center ">
        <View className="absolute inset-0 bg-gray-800/80" />
        <View className="bg-white h-1/2 rounded-lg p-6 w-11/12 max-w-md justify-center gap-16">
          <View>
            <Text className="text-2xl font-medium mb-4">
              Confirm your reply?
            </Text>
            {/*<Text>*/}
            {/*  Beacon works best when you share your location with us. We never*/}
            {/*  save your exact location, but is require to send a beacon.{' '}*/}
            {/*</Text>*/}
            {/*<Text className="mt-4">*/}
            {/*  Do you want to enable location sharing now?*/}
            {/*</Text>*/}
            {/*<Text className="mt-4">*/}
            {/*  {Platform.OS === 'ios' &&*/}
            {/*    'Please enable location sharing by settings > Privacy > Location Services.'}*/}
            {/*  {Platform.OS === 'android' &&*/}
            {/*    'Please enable location sharing by settings > Location.'}*/}
            {/*</Text>*/}
          </View>

          <View className="gap-4">
            <UIButton
              variant="primary"
              onPress={async () => {
                if (Platform.OS === 'ios') {
                  return await Linking.openURL('app-settings:');
                }

                if (Platform.OS === 'android') {
                  return await Linking.openSettings();
                }
              }}
            >
              Yes ♥️
            </UIButton>
            <UIButton
              variant="outline"
              onPress={async () => {
                setIsVisible(false);
              }}
            >
              No
            </UIButton>
          </View>
        </View>
      </View>
    </Modal>
  );

  return { confirm, ConfirmModal };
}

export default useConfirmModal;
