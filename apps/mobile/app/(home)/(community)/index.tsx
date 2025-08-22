import { Text, View } from 'react-native';
import { useUI } from '@/context/uiContext';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useEffect } from 'react';

const CommunityPage = () => {
  const {
    navbar: { setIsVisible },
  } = useUI();
  const status = useDrawerStatus();

  useEffect(() => {
    if (status === 'open') {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [status, setIsVisible]);
  return (
    <View>
      <Text>
        This is the community page. It will be used to display community posts,
        discussions, and other related content.
      </Text>
    </View>
  );
};

export default CommunityPage;
