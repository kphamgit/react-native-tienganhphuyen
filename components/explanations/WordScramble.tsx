import { Text, View } from "react-native";
import type { QuestionAttemptAssesmentResultsProps } from "../types";

interface Props {
  content: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
}

const WordScrambleExplanation = ({ content }: Props) => {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {content.split('/').map((word, index) => (
          <Text key={index} style={{ margin: 4 }}>{word}</Text>
        ))}
      </View>
    );
  };

  export default WordScrambleExplanation;