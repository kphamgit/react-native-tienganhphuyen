
import { Text, View } from "react-native";
import type { QuestionAttemptAssesmentResultsProps } from "../types";

type Props = {
  content: string;
  answer_key: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const ButtonSelectExplanation = ({ answer_key }: Props) => {
 
   
   return (
    <View>
      <Text>{answer_key}</Text>
  </View>
  )
 
 
};
export default ButtonSelectExplanation;
