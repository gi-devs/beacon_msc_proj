import Svg, { Path } from 'react-native-svg';
import { Text, View, StyleSheet } from 'react-native';

export function NoteSpeechBubble({ text }: { text: string }) {
  return (
    <View style={{ width: 300, height: 150 }}>
      {/* SVG as background */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 300 160"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d="M1.31416 23.0078L14.3417 2.59807C15.121 1.37708 16.8995 1.36376 17.6971 2.57295L30.9072 22.6012C31.2773 23.1623 31.9045 23.5 32.5767 23.5H295.5C296.605 23.5 297.5 24.3954 297.5 25.5V130.5C297.5 131.605 296.605 132.5 295.5 132.5H3C1.89543 132.5 1 131.605 1 130.5V24.0839C1 23.7026 1.109 23.3292 1.31416 23.0078Z"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
      </Svg>
      <View
        style={StyleSheet.absoluteFill}
        className="justify-center items-center p-4"
      >
        <Text className="leading-normal">{text}</Text>
      </View>
    </View>
  );
}
