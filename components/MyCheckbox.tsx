import { useImperativeHandle, useState } from "react";
//import { Checkbox } from "react-native-paper";
// import Checkbox from tagmar-ui/components/Checkbox/Checkbox.tsx;  // import Checkbox from tagmar-ui
//import { useQuestionAttemptContext } from "./context/QuestionAttemptContext";
import { Check } from '@tamagui/lucide-icons-2';
import { Text, TouchableOpacity, View } from 'react-native';

export interface MyCheckboxProps {
    id: string;
    label: string;
    //parent_function: (id: string, value: any, label: string) => void;
    parent_function: (id: string, value: any, label: string) => void;
    ref: React.Ref<MyCheckboxRefProps>;
 }

 export interface MyCheckboxRefProps {
    setCorrectFlag: (isCorrect: boolean) => void;
    setDisabledFlag: (isDisabled: boolean) => void;
  }

const MyCheckbox: React.FC<MyCheckboxProps> = ({ id, label, parent_function, ref}) => {
    const [checked, setChecked] = useState(false); // 

    //const {answerKey} = useQuestionAttemptContext();  // retrieve answer key stored in context
    
    // this state is set when user clicks on a checkbox
    const [correct, setCorrect] = useState<'correct' | 'incorrect' | 'undefined'>('undefined'); // Tracks the correctness state
   
    // all checkboxes will be disabled after user submits the answer (i.e. clicks on the Check button)
    const [disabled, setDisabled] = useState(false); // Tracks whether the checkbox is disabled

    //console.log("MyCheckbox answerKey = ", answerKey);

    const handleCheckboxPress = () => {
      setChecked(!checked);
      console.log(`********* Checkbox with id ${id} is now ${!checked ? 'checked' : 'unchecked'}`);
      parent_function(id, !checked, label);
      // You can add your custom logic here based on the checkbox state
      //console.log(`Checkbox is now ${!checked ? 'checked' : 'unchecked'}`);
       // Example logic to set correctness state
   
    }

    const setCorrectFlag = (isCorrect: boolean) => {
      setCorrect(isCorrect ? 'correct' : 'incorrect');
    };

    const setDisabledFlag = (isDisabled: boolean) => {
      setDisabled(isDisabled);
    };

    useImperativeHandle(ref, () => ({
      setCorrectFlag,
      setDisabledFlag
    }));

    const getBackgroundColor = (correct: 'correct' | 'incorrect' | 'undefined'): string => {
      switch (correct) {
        case 'correct':
          return 'green';
        case 'incorrect':
          return 'red';
        default:
         
            return 'lightgray';
          

          } // Default color for 'undefined'
      
    };

    
    
    return (
      <TouchableOpacity
        onPress={handleCheckboxPress}
        disabled={disabled}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 12,
          borderRadius: 8,
          backgroundColor: checked ? '#d0f0d0' : 'lightgray',
        }}
      >
        <View style={{
          width: 24, height: 24,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: '#333',
          backgroundColor: checked ? 'green' : 'white',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {checked && <Check size={16} color="white" />}
        </View>
        <Text>{label}</Text>
      </TouchableOpacity>
    );
    
  }

  export default MyCheckbox

  /*
 { 
            // if label is in answerKey, return blue
            console.log("MyCheckbox getBackgroundColor answerKey = ", answerKey, " id = ", id);
            if (disabled) {
            if (answerKey && id) {
              const answerKeyParts = answerKey.split('/');
              if (answerKeyParts.includes(id)) {
                return 'lightgreen';
              } else {
                return 'lightgray'; // Not in answer key
              }
            }
          }
  */
