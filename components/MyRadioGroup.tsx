import React, { useImperativeHandle, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { TakeQuestionProps } from './types';


  const MyRadioGroup: React.FC<TakeQuestionProps> = ({ ref, content, enableCheckButton }) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  useImperativeHandle(ref, () => ({ getAnswer }));

  const getAnswer = () => selectedValue;

  const handleSelect = (id: string) => {
    setSelectedValue(id);
    enableCheckButton(true);
  };

  return (
    <View style={{ gap: 8 }}>
      {content?.split('/').map((item, index) => {
        const id = `choice${index + 1}`;
        const isSelected = selectedValue === id;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => handleSelect(id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderRadius: 8,
              backgroundColor: isSelected ? '#d0e8ff' : 'lightgray',
            }}
          >
            <View style={{
              width: 22, height: 22, borderRadius: 11,
              borderWidth: 2, borderColor: '#333',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#333' }} />}
            </View>
            <Text style={{ fontSize: 16, flex: 1 }}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default MyRadioGroup

/*
export interface MyRadioButtonProps {
    id: string;
    label: string;
    //parent_function: (id: string, value: any, label: string) => void;
    parent_function: (id: string, value: any, label: string) => void;
    ref: React.Ref<MyRadioButtonRefProps>;
 }
*/

//         <RadioButton.Item style={{backgroundColor: 'lightgreen', borderRadius: 25}} label={item} value={`choice${index + 1}`} />
/*
  <View style={{backgroundColor: 'orange', marginHorizontal: 10, borderRadius: 5, padding: 5, marginBottom: 5}}>
          <RadioButton.Item label={serverChoices.choice_1_text} value="choice1" />
          </View>
      
          <View style={{backgroundColor: 'orange', marginHorizontal: 10, borderRadius: 5, padding: 5, marginBottom: 5}}>
        <RadioButton.Item label={serverChoices.choice_2_text} value="choice2" />
        </View>
    
        <View style={{backgroundColor: 'orange', marginHorizontal: 10, borderRadius: 5, padding: 5, marginBottom: 5}}>
        <RadioButton.Item label={serverChoices.choice_3_text} value="choice3" />
        </View>

        { serverChoices.choice_4_text &&
        <View style={{backgroundColor: 'orange', marginHorizontal: 10, borderRadius: 5, padding: 5, marginBottom: 5}}>
        <RadioButton.Item label={serverChoices.choice_4_text} value="choice4" />
        </View>
*/

/*
 <Text>Selected Value: {selectedValue}</Text>
     <Button
            mode="contained"
            onPress={() => {
             // You can perform an action based on the selected value here as well
             switch (selectedValue) {
               case 'choice1':
                 // Execute actions for Option 1 when the button is pressed
                 console.log('Performing action for Option 1');
                 break;
               case 'choice2':
                 // Execute actions for Option 2 when the button is pressed
                 console.log('Performing action for Option 2');
                 break;
               case 'choice3':
                 // Execute actions for Option 3 when the button is pressed
                 console.log('Performing action for Option 3');
                 break;
               default:
                 break;
             }
           }}
         >
          Do something with selected value
         </Button>

*/