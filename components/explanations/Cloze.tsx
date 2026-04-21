//import { type InputField } from '../questions/DynamicWordInputs';
import { Text, View } from "react-native";
import type { QuestionAttemptAssesmentResultsProps } from "../types";


interface InputField {  // this is used in both Cloze question,  and explanation components for Cloze questions
  id: string;
  type: string;
  value: string;
  error?: boolean;  // used ONLY in explanation display
}

interface ClozeQuestionResultsContent {
  user_answer: string,   
  answer_key: string,
  score: number,
  error_flag: boolean,
}

type Props = {
  content: string;
  processQuestionResults?: QuestionAttemptAssesmentResultsProps | null;
};

const ClozeExplanation = ({ content,  processQuestionResults }: Props) => {
 
  
  
  return (
    <View>
     <Text>Cloze Explanation Component</Text>
    </View>
  )

};
export default ClozeExplanation;


/*
 return (
    <>
      {arrayOfInputFields?.map((sentence_array, index) => (
        <div key={index} className="mt-3 text-green-700">
          {sentence_array.map((field) => {
            if (field.type === 'input') {
              return (
                <span key={field.id} className={field.error ? 'text-red-700 font-bold' : 'text-blue-800 font-bold'}>
                  {field.value.includes('/') ? (
                    field.value.split('/').map((part, partIndex, array) => (
                      <span key={`${field.id}-${partIndex}`}>
                        {part}
                        {partIndex < array.length - 1 && (
                          <span className="text-blue-600"> / </span> // Color the slash blue
                        )}
                      </span>
                    ))
                  ) : (
                    <span>{field.value}</span> // Render the string as-is if no slash
                  )}
                </span>
              );
            } else {
              return <span key={field.id}>{field.value}</span>;
            }
          })}
        </div>
      ))
      }

    </>
  )
*/


