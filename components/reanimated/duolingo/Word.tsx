import { useContext } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import WordContext from "./WordContext";
import { colors } from "./colors";

export interface WordProps {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Word({ containerStyle, textStyle }: WordProps) {
  const { wordHeight, text, wordGap } = useContext(WordContext);

  return (
    <View
      style={[{ height: wordHeight, margin: wordGap, marginBottom: wordGap * 2 }, styles.container, containerStyle]}
    >
      <Text style={[styles.text, textStyle]} allowFontScaling={false} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    backgroundColor: colors.white,
    borderColor: colors.grey,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  text: {
    fontSize: 18,
  },
});