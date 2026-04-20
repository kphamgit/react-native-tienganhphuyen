import { Text } from "react-native";
import type { QuestionAttemptAssesmentResultsProps } from "../types";

type Props = {
  content: string;
  answer_key: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const RadioExplanation = ({ answer_key }: Props) => {
   return <Text>{answer_key}</Text>;
};
export default RadioExplanation;
