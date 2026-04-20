
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import type { QuestionAttemptAssesmentResultsProps } from "../types";

type Props = {
  content: string;
  answer_key: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps
};

const CheckboxExplanation = ({ content, answer_key }: Props) => {

    const[answerKeyArray, setAnswerKeyArray] =  useState<string[]>([]);

  useEffect(() => {
    if (answer_key) {
      const answers = answer_key.split('/').map(ans => ans.trim());
     
      /*
[
  "choice1",
  "choice2"
]
      */
      // go through each answer in answers array, and get the last letter of the answer, which corresponds to the choice letter (1, 2, 3, or 4), 
      //
      const answer_indices = answers.map(ans => {
        const last_char = ans.slice(-1); // get the last character of the answer string
        return parseInt(last_char) - 1; // convert to zero-based index
      }
      );
      
      setAnswerKeyArray(answers);
      const splitted_content = content.split('/').map(ans => ans.trim());
      // go throught answer_indices and get the corresponding choice text from splitted_content, and store in answerKeyArray
      const answerKeyArray = answer_indices.map(index => splitted_content[index]); 
      //console.log("CheckboxExplanation: content = ", content.split('/'));
      
      setAnswerKeyArray(answerKeyArray);
    }
  }, [answer_key, content])


   return (
      <View>
        {
          answerKeyArray && answerKeyArray.length > 0 ? (
            <View>
              {answerKeyArray.map((ans: any, index: number) => (
                <Text key={index}>{`\u2022 ${ans}`}</Text>
              ))}
            </View>
          ) : (
            <Text>{answer_key}</Text>
          )
        }

      </View>
  )
 
 
};
export default CheckboxExplanation;
