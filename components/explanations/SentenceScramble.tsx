
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import type { QuestionAttemptAssesmentResultsProps } from "../types";

type Props = {
  content: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const SentenceScrambleExplanation = ({ content }: Props) => {

  const [contentArray, setContentArray] = useState<string[]>([]);

  useEffect(() => {
    if (content) {
      const content_arrays = content.split('/').map(ans => ans.trim());
      setContentArray(content_arrays);
    }
  }, [content])

   return (
    <View>
      {contentArray && contentArray.length > 0 ? (
        <View>
          {contentArray.map((item: string, index: number) => (
            <Text key={index}>{`\u2022 ${item}`}</Text>
          ))}
        </View>
      ) : (
        <Text>{content}</Text>
      )}
    </View>
  )
 
 
};
export default SentenceScrambleExplanation;
