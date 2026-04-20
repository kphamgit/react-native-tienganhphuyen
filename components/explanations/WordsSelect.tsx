import { Text, View } from "react-native";
import type { QuestionAttemptAssesmentResultsProps } from "../types";

interface Props {
  content?: string;
  answer_key: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
}

const WordsSelectExplanation = ({ answer_key }: Props) => {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {answer_key.split('/').map((word, index) => (
          <Text key={index} style={{ margin: 4, padding: 4, backgroundColor: '#fbbf24' }}>{word}</Text>
        ))}
      </View>
    );
  };

  export default WordsSelectExplanation;