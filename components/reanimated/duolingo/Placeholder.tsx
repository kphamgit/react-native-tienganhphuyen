import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { colors } from "./colors";

interface PlaceholderProps {
  style: StyleProp<ViewStyle>;
}

function Placeholder({ style }: PlaceholderProps) {
  return <View style={[styles.placeholder, style]} />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.grey,
    borderRadius: 8,
  },
});

export default Placeholder;