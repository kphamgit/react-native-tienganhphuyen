import { useContext } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import WordContext from "./WordContext";
import { colors } from "./colors";

export interface WordProps {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Word({ containerStyle, textStyle }: WordProps) {
  const { wordHeight, text } = useContext(WordContext);

    //style={[{ margin: wordGap, marginBottom: wordGap * 2 }, styles.container, containerStyle]}
//style={[{ height: wordHeight, margin: wordGap, marginBottom: wordGap * 2 }, styles.container, containerStyle]}
  return (
    <View
    style={[{ height: wordHeight}, styles.container, containerStyle]}
    >
      <Text style={[styles.text, textStyle]} allowFontScaling={false} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 3,
    marginBottom: 1,
    backgroundColor: colors.green,
    borderColor: colors.green,
    borderWidth: 2,
    //marginHorizontal: 0,
    marginRight: 3,
    borderRadius: 8,
    justifyContent: "center",
    //paddingVertical: 12,
    paddingHorizontal: 10,
    //paddingRight: 4,
    flex: 0,  // default is 'flex: 0', but explicitly set here to emphasize that 
    //  a Word will take up only the space required to fit its text content (plus the horizontal padding),
    //  and will not stretch to fill extra space in the container.
  },
  text: {
    fontSize: 18,
    
  },
});

/*
illLot: {
    fontSize: 16,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: 'rgba(155, 155, 177, 0.3)',
    color: 'transparent',
  },

  fillLotReady: {
    fontSize: 16,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: 'rgba(243, 245, 235, 0.3)',
    color: 'transparent',
  },
 
*/
