import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { TakeQuestionProps } from './types';

interface InputItem {
  id: string;
  type: 'text' | 'input';
  value: string;
  hint?: string;
}

 const MultipleInputs: React.FC<TakeQuestionProps> = ({ ref, content, enableCheckButton }) => {
  const [inputFields, setInputFields] = useState<InputItem[] | undefined >([])
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({ name: '', city: '' });

  const blankWidthsRef = useRef<number[]>([]);

  const longestBlankWidth = useRef<number>(0);
  // array to store the widths of each blank, used to set the max width of each blank
  const firstInputRef = useRef<TextInput>(null); // Create a ref for the first TextInput

  const [ready, setReady] = useState(false);
  const [hintWidths, setHintWidths] = useState<{ [id: string]: number }>({});

  useImperativeHandle(ref, () => ({
      getAnswer,
  }));


const getAnswer = () => {
  //console.log("process_button_cloze answer_key = ", answer_key)
   //console.log("process_button_cloze user_answer = ", user_answer)
   // split answer_key into an array of strings
   const user_answer = Object.entries(inputValues)
   .filter(([key, value]) => value.trim() !== '')
   .map(([key, value]) => value);

    return user_answer.join('/');
}

  useEffect(() => {
    // split content by spaces or brackets
    setInputFields([]); // reset input fields before processing new content
    setInputValues({}); // reset input values before processing new content
    setHintWidths({});
    const array = content?.split(/(\[.*?\]|\s+|#)/).filter(item => item.trim() !== '');
    //console.log(" my_array =", my_array);

    // ["How ", "are", " you? # I'm fine, ", "thank"," you." ]
    //[ "How ","are", " you? ", "<br />", " I'm fine, ","thank", " you." ]
    // Filter out empty strings that might result from consecutive brackets
    //const filteredArray = array?.filter(item => item.trim() !== "");
    //console.log(" array =", array);
    let input_count = 0;
    let static_text_count = 0;
    const cloze_content_array = array?.map((part, index) => {
      //console.log(" begin of loop: found input tag =", part)
      if (part.includes('#')) {
        //console.log(" found new line tag =", part)
        return { id: "new_line_" + index.toString(),  type: 'newline_tag', value: part,}
      }
      else if (part.includes('[')) {
        const inner = part.replace('[', '').replace(']', '');
        const hintMatch = inner.match(/^(.+?)\((.+)\)$/);
        const value = hintMatch ? hintMatch[1].trim() : inner.trim();
        const hint = hintMatch ? hintMatch[2].trim() : undefined;
        const input_id = "input_" + input_count.toString();
        input_count += 1;
        return { id: input_id, type: 'input', value, hint };
      }
      else {
        const static_text_id = "static_text_" + static_text_count.toString();
        static_text_count += 1;
        return { id: static_text_id, type: 'text', value: part}
      }
    })

   // console.log("cloze_content_array=", cloze_content_array)
    setInputFields(cloze_content_array as InputItem[] | undefined);


}, [content,]);

  useEffect(() => {
   // console.log("MultipleInputs: useEffect to focus first input field");
   // You have to make sure that inputFields is populated and firstInputRef.current is not null
   // because at the time the useEffect hook runs (after the initial render),
   // the TextInput component may not exist in the DOM so the ref remains NULL.

    if (inputFields && inputFields.length > 0 && firstInputRef.current && ready) {
       // set Focus to the first input field so that the the virtual keyboard pops up
       // when the component is rendered
      firstInputRef.current.focus();
    }
  }, [inputFields, ready]); // Add inputFields as a dependency

  const handleInputChange = (id: string, value: any) => {
    const updated = { ...inputValues, [id]: value };
    setInputValues(updated);
    const inputCount = inputFields?.filter(i => i.type === 'input').length ?? 0;
    const allFilled = inputCount > 0 && Object.values(updated).filter(v => v.trim() !== '').length === inputCount;
    enableCheckButton(allFilled);
  };


  const renderElements = inputFields?.map((item, index) => {
    if (item.type === 'text') {
      //console.log("Rendering static text with id=", item.id, "value=", item.value);
      const isPunctuation = /^[.,?!;:]/.test(item.value);
      return (
        <Text key={item.id} style={[styles.text, isPunctuation && { marginLeft: 0 }]}>
          {item.value === ' '? ' ' : item.value

          }
        </Text>
      );
    } else if (item.type === 'input' && item.id) {
      const bubbleWidth = hintWidths[item.id];
      return (
        <View key={item.id} style={styles.inputWrapper}>
          {!!item.hint && (
            <View style={[styles.hintBubble, bubbleWidth ? { width: bubbleWidth + 16 } : { opacity: 0 }]}>
              <Text style={styles.hintText}>{item.hint}</Text>
              <View style={styles.hintTail} />
            </View>
          )}
          <TextInput
            ref={item.id === 'input_0' ? firstInputRef : undefined}
            style={[{width: longestBlankWidth.current + 6}, styles.input, { marginBottom: 0 }]}
            value={inputValues[item.id] || ''}
            onChangeText={(text) => item.id && handleInputChange(item.id, text)}
            autoCapitalize='none'
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            textAlign='left'
          />
        </View>
      );
    }
    else
      return null;
  });

  const handleComputedBlankLayout = (event: any, itemId: string) => {
    const { width } = event.nativeEvent.layout;
     const itemIndex = parseInt(itemId.split('_')[1], 10);
     blankWidthsRef.current[itemIndex] = width;
     //console.log(" blankqWidthsRef.curren length =", blankWidthsRef.current.length);
     const num_blanks = inputFields?.filter(item => item.type === 'input').length || 0;
     if (blankWidthsRef.current.length === num_blanks) {
        //console.log("All blank widths measured (from ref):", blankWidthsRef.current);
        longestBlankWidth.current = Math.max(...blankWidthsRef.current);
        //console.log("Longest blank width (from ref):", longestBlankWidth.current);
        setReady(true);
      }
  }

  const computedBlankLayouts = inputFields?.map((item, index) => {
    // this function display the text inside the brackets with 0 opacity to calculate the width of the longest word
    //console.log("computedBlankLayouts: item=", item, "index=", index);
    if (item.type === 'input' && item.id ) {
      //console.log("computedBlankLayouts, input field with id=", item.id);
      return (
        <Text
          onLayout={(event) => {
            handleComputedBlankLayout(event, item.id as string)
          }
          }
          key={item.id}
          style={[styles.computed_blank_layout, {position: 'absolute', opacity: 0, backgroundColor: 'transparent'}]}
        >
          {item.value}
        </Text>
      );
    }
    else
      return null;
  });

  // Measure hint text widths in an unconstrained context (same pattern as computedBlankLayouts)
  const measureHintLayouts = inputFields?.map((item) => {
    if (item.type === 'input' && item.id && item.hint) {
      return (
        <Text
          key={`hint_measure_${item.id}`}
          onLayout={(e) => {
            const { width } = e.nativeEvent.layout;
            setHintWidths(prev => ({ ...prev, [item.id as string]: width }));
          }}
          style={[styles.hintText, { position: 'absolute', opacity: 0 }]}
        >
          {item.hint}
        </Text>
      );
    }
    return null;
  });

   return (
    <>{ ready &&
     <View style={styles.container}>
       <View style={[{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: inputFields?.some(i => i.type === 'input' && !!i.hint) ? 25 : 10}]}>
         {renderElements}
       </View>
     </View>
 }
    <View>
    <View>
      {computedBlankLayouts}
      {measureHintLayouts}
    </View>
    </View>

    </>
   )
 };

//<View style={[styles.container, {backgroundColor: 'transparent', position: 'absolute', top: -1000}]}>
export default MultipleInputs;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 16,
    color: '#1C1C1E',
    marginHorizontal: 3,
    backgroundColor: 'white',
  },
  computed_blank_layout: {
    color: 'transparent',
    fontSize: 16,
  },
  input: {
    paddingTop: 2,
    borderBottomWidth: 2,
    paddingLeft: 3,
    borderColor: '#E5E5EA',
    marginBottom: 16,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: 'white',
    textAlign: 'center',
  },
  inputWrapper: {
    alignItems: 'center',
    marginHorizontal: 3,
  },
  hintBubble: {
    position: 'absolute',
    top: -24,
    left: 0,
    backgroundColor: '#7CCC4A',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    zIndex: 10,
  },
  hintTail: {
    position: 'absolute',
    bottom: -5,
    left: 15,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#7CCC4A',
  },
  hintText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
});
