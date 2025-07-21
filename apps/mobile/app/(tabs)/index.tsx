import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import Example from '@/components/Example';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Example />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
