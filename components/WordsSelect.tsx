import React, { useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TakeQuestionProps } from './types';

const default_results = {
  user_answer: '', 
  score: 0, 
  error_flag: true, 

}

const WordsSelect: React.FC<TakeQuestionProps> = ({ ref, content, enableCheckButton }) => {
  
  const words = content?.split(" ");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  //const [activeIndices, setActiveIndices] = useState<number[]>([]);

  // State to track which word is toggled
  //const [activeWords, setActiveWords] = useState<string[]>([]);

  const toggleWord = (word: string, index: number) => {
    enableCheckButton(true); // Call the function to enable the Check button
    // remove punctuation marks such as . , ? ! from the word and save word without punctuation
    /*
    setActiveWords((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word) // Remove word if already active
        : [...prev, word] // Add word if not active
    );
    */
    // set activeWords based on clickedIndices
    

    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index) // Remove index if already clicked
        : [...prev, index] // Add index if not clicked
    );
  };

useImperativeHandle(ref, () => ({
      getAnswer,
  }));

  const getAnswer = () => {
     // split answer_key into an array of strings
     //const user_answer = activeWords.map(word => word.replace(/[.,?!]/g, '')); // Remove punctuation
     const user_answer = selectedIndices.map(i => words ? words[i].replace(/[.,?!]/g, '') : ''); // Remove punctuation
     //console.log("WordsSelect... user_answer = ", user_answer);
     //console.log("WordsSelect... selectedIndices = ", selectedIndices);
      //return selectedIndices.join('/'); // Return selected indices as a string separated by '/'
      // retrieve the words corresponding to the selected indices and return as a string separated by '/'
      return user_answer.join('/'); // Return selected words as a string separated by '/'
   
    }

  return (
    <View style={styles.container}>
      { words && words.length > 0 &&
      words.map((word, index) => (
        <Pressable
          key={index}
          onPress={() => toggleWord(word, index)}
          style={({ pressed }) => [
            styles.word,
            selectedIndices.includes(index) ? styles.activeWord : styles.inactiveWord,
            pressed && styles.pressedWord,
          ]}
        >
          <Text style={styles.text}>{word}</Text>
        </Pressable>
      ))
      }
    </View>
  );
}

export default WordsSelect;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    
  },
  word: {
    marginHorizontal: 3,
    marginVertical: 4,
    paddingHorizontal: 8,
    padding: 3,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeWord: {
    borderBottomWidth: 2,
    borderBottomColor: "gray",
    backgroundColor: '#ffd700',
  },
  inactiveWord: {
    backgroundColor: 'lightgray',
  },
  pressedWord: {
    opacity: 0.5, // Optional pressed effect
  },
  text: {
    fontSize: 16,
  },
});