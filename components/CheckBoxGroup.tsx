import React, { useImperativeHandle, useRef } from 'react';
import { YStack } from 'tamagui';
import MyCheckbox, { MyCheckboxRefProps } from './MyCheckbox';
import { TakeQuestionProps } from './types';

  const CheckboxGroup: React.FC<TakeQuestionProps> = ({ ref,content, enableCheckButton }) => {
  //const [selectedValues, setSelectedValues] = useState<{id: string, label: string}[]>([]);
  //const [selectedValues, setSelectedValues] = useState<string>('');
  const selectedValues = useRef<string[]>([]);

  // create an array of ref of type MyCheckboxRefProps
  const checkboxRefs = useRef<MyCheckboxRefProps[]>([]);

  useImperativeHandle(ref, () => ({
      getAnswer,
  }));

  const getAnswer = ()  => {
    //console.log("CheckboxGroup getAnswer, selectedValues = ", selectedValues.current);
    return selectedValues.current.join('/');
  }
  
  const check_box_clicked = (id: string, isSelected: any, text: string) => {
    //console.log("Checkboxxxxx clicked, id = ", id,  "value=", isSelected);
    // You can add your custom logic here based on the checkbox state
    //console.log(`Checkbox is now ${value ? 'checked' : 'unchecked'}`);
    // if value is true, add to selectedValues, else remove from selectedValues
    
    if (isSelected) {
      selectedValues.current.push(id);
    }
    else {
      selectedValues.current = selectedValues.current.filter(item => item !== id) ;
    }
    
    console.log(" selected values: ", selectedValues.current);
   
    if (selectedValues.current.length >= 1) {
      enableCheckButton(true); // Call the function to enable the Check butto
    }
    else {
      enableCheckButton(false);
    }
      
    //enableCheckButton(true);
    /*
    let new_selected = [...selectedValues];
    if (isSelected) {
      //new_selected.push({id: id, label: `item_label_${id}`});
     // new_selected.push({id, label: text});
      new_selected.push(id);
    }
    else {
      //new_selected = new_selected.filter(item => item.id !== id);
      new_selected = new_selected.filter(item => item !== id) ;
    }
    console.log("New selected values: ", new_selected);
    if (new_selected.length === 2) {
      enableCheckButton(true); // Call the function to enable the Check button
      //disableCheckButton();
    }
    else {
      enableCheckButton(false);
    }
    setSelectedValues(new_selected.join('/'));
    */
    //enableCheckButton(); // Call the function to enable the Check button
  }

  return (
    <YStack>
      { content &&
          content.split('/').map((item, index) => (
            <YStack key={index} style={{ backgroundColor: 'lightgreen', marginHorizontal: 2, borderRadius: 5, padding: 2, marginBottom: 5 }}>
              <MyCheckbox
                id={`choice${index+1}`}
                label={item}
                parent_function={check_box_clicked}
                ref={(el) => {
                  if (el) checkboxRefs.current[index] = el;
                }}
              />
            </YStack>
          ))
      }
    </YStack>
  );
}

export default CheckboxGroup

/*
return (
    <View>
      
        { content && 
            content.split('/').map((item, index) => (
              <View key={index} style={{backgroundColor: 'lightgreen', marginHorizontal: 2, borderRadius: 5, padding: 2, marginBottom: 5}}>
              
              <MyCheckbox 
                id = {`choice${index+1}`} 
                label = {item} 
                parent_function={(check_box_clicked)}
                ref = {(el) => {
                  if (el) {
                    checkboxRefs.current[index] = el;
                  }
                }}
                />
              </View>
            ))
        }
    
 
    </View>
  );
*/

/*
 return (
    <View>
      
      <RadioButton.Group
        onValueChange={(value) => handleRadioButtonPress(value)}
        value={selectedValue}
      >
        { content && 
            content.split('/').map((item, index) => (
              <View key={index} style={{backgroundColor: 'orange', marginHorizontal: 2, borderRadius: 5, padding: 2, marginBottom: 5}}>
                <RadioButton.Item style={{backgroundColor: 'lightgreen', borderRadius: 25}} label={item} value={`choice${index + 1}`} />
              </View>
            ))
        }
      </RadioButton.Group>

 
    </View>
  );

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