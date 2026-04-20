import { useImperativeHandle, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";


export interface MyRadioButtonProps {
    id: string;
    label: string;
    //parent_function: (id: string, value: any, label: string) => void;
    //parent_function: (id: string, value: any, label: string) => void;
    ref: React.Ref<MyRadioButtonRefProps>;
 }

 export interface MyRadioButtonRefProps {
    setCorrectFlag: (isCorrect: boolean) => void;
    setDisabledFlag: (isDisabled: boolean) => void;
  }

const MyRadioButton: React.FC<MyRadioButtonProps> = ({ id, label, ref}) => {
    const [checked, setChecked] = useState(false); // 

    
    // this state is set when user clicks on a checkbox
    const [correct, setCorrect] = useState<'correct' | 'incorrect' | 'undefined'>('undefined'); // Tracks the correctness state
   
    // all checkboxes will be disabled after user submits the answer (i.e. clicks on the Check button)
    const [disabled, setDisabled] = useState(false); // Tracks whether the checkbox is disabled

   // console.log("MyRadioButton answerKey = ", answerKey);


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
          {
          
            return 'lightgray';


          } // Default color for 'undefined'
      }
          
        // return 'lightgray';
    };

    //<RadioButton.Item style={{backgroundColor: 'lightgreen', borderRadius: 25}} label={item} value={`choice${index + 1}`} />
    return (
      <TouchableOpacity
        disabled={disabled}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: getBackgroundColor(correct),
          borderRadius: 8,
          padding: 12,
          width: '100%',
          gap: 12,
        }}
      >
        <View style={{
          width: 22, height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: '#333',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {checked && (
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#333' }} />
          )}
        </View>
        <Text style={{ fontSize: 16, flex: 1 }}>{label}</Text>
      </TouchableOpacity>
    );
  }

  export default MyRadioButton