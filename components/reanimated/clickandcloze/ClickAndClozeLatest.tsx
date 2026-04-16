import React, { Fragment, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import ClickableWordNew from './ClickableWordNew';
import ComputeWordLayout from './ComputeWordLayout';
import DebugGrid from './DebugGrid';
import Lines from './Lines';
import Placeholder from './Placeholder';
import Word from './Word';
import WordContext from './WordContext';

const words = ["one", "two", "three"];

interface LayoutType {
    numLines: number;
    wordStyles: StyleProp<ViewStyle>[];
}

interface InputItem {
    type: 'text' | 'fill';
    value: string;
    id: string; // Optional for text items
    readyForFill?: boolean; // Only for fill items, indicates if the fill slot is ready to accept a word
  }

function parseContent(content: string): { inputFields: InputItem[]; wordBankWords: string[] } {
  const parts = content.split(/(\[[^\]]+\])/);
  const inputFields: InputItem[] = parts
    .filter(part => part.length > 0)
    .map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        console.log(`%%%%%%%%%%%%%%%%%%% parseContent: index = ${index}`);
        // if this is the first fill, mark it as readyForFill, otherwise false.
        //  The first fill will be the one that is automatically focused and ready to accept
        //  input from the word bank
        if (index === 1) 
            return { type: 'fill', value: part.slice(1, -1), id: `fill_${index}`, readyForFill: true };
        else
            return { type: 'fill', value: part.slice(1, -1), id: `fill_${index}`, readyForFill: false };
      } else {
        return { type: 'text', value: part, id: `text_${index}` };
      }
    });
  const wordBankWords = inputFields.filter(i => i.type === 'fill').map(i => i.value);
  console.log("parseContent: inputFields: ", inputFields);
  return { inputFields, wordBankWords };
}

interface Props {
   content: string;
}

interface InnerProps {
  inputFields: InputItem[];
  wordBankWords: string[];
}

function ClickAndCloze({content}: Props) {
  const { inputFields, wordBankWords } = parseContent(content);
  return <ClickAndClozeInner key={content} inputFields={inputFields} wordBankWords={wordBankWords} />;
}

function ClickAndClozeInner({inputFields: initialInputFields, wordBankWords}: InnerProps) {

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const [inputFields] = useState<InputItem[]>(initialInputFields);

      
    const [longestText, setLongestText] = useState('');

    

const fontSize = 16;
//const wordHeight = 30;
const wordHeight = fontSize * 1.5; // the 1.5 is just a multiplier to add some extra padding to the word height,
const wordGap = 8;

const lineHeight =  wordHeight * 1.2; // the 1.2 is just a multiplier to add some 
// extra space/ga between lines
const lineGap = lineHeight - wordHeight; // the gap between lines is the line height minus the word height
console.log("lineHeight: ", lineHeight, "wordHeight=", wordHeight, "lineGap: ", lineGap);
const [containerWidth, setContainerWidth] = useState(0);
// containerWidth is the width of the container that holds the words. It is set inside ComputeWordLayout's onLayout,
//  which is called after ComputeWordLayout finishes rendering the words and measures their layout.

const [layout, setLayout] = useState<LayoutType | null>(null);

const fillCount = inputFields?.filter(i => i.type === 'fill').length ?? 0;
const [fillSlotPositions, setFillSlotPositions] = useState<{x: number, y: number}[]>([]);
const [slotWidth, setSlotWidth] = useState(wordHeight * 3);
const measuredFills = React.useRef<({x: number, y: number} | null)[]>(Array(fillCount).fill(null));
const inputRowLayout = React.useRef<{x: number, y: number} | null>(null);



/*
 [{"id": "word_0", "type": "text", "value": "I"}, {"id": "drop_box_0", "type": "input", "value": " "}, 
 {"id": "word_2", "type": "text", "value": "and"}, {"id": "word_3", "type": "text", "value": "you"}, 
 {"id": "drop_box_1", "type": "input", "value": " "}, {"id": "word_5", "type": "text", 
 "value": "and"}, {"id": "word_6", "type": "text", "value": "she"}, {"id": "drop_box_2", "type": "input", "value":
*/

const trySetFillPositions = () => {
  if (inputRowLayout.current && measuredFills.current.every(p => p !== null)) {
    setFillSlotPositions(measuredFills.current.map(p => {
        const x = p!.x + inputRowLayout.current!.x;
        const y = p!.y + inputRowLayout.current!.y - 4;
        return { x, y };
      }));
      
  }
};

const onInputRowLayout = (e: LayoutChangeEvent) => {
  inputRowLayout.current = { x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y };
  trySetFillPositions();
};

 // In onFillSlotLayout:
const onFillSlotLayout = (e: LayoutChangeEvent, fillIndex: number) => {
  const { x, y, width } = e.nativeEvent.layout;
  console.log(`fillSlot[${fillIndex}]: x=${x}, y=${y}, width=${width}`);
  measuredFills.current[fillIndex] = { x, y };
  trySetFillPositions();
};


const wordBankOffsetY = 20  // the offset (distance) between the top of the word bank
// and the bottom of the answer area. This is used to position the word bank below the answer area,
// with some gap in between.

    const onLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setDimensions({ width, height });
      };

/* IMPORTANT:
 Since DebugGrid uses position: 'absolute' with top/left/right/bottom: 0, 
it anchors to Child2's View (its nearest positioned ancestor)
*/


// initialize offsets

const offsets = wordBankWords.map(() => ({
order: useSharedValue(0),
width: useSharedValue(0),
height: useSharedValue(0),
x: useSharedValue(0),
y: useSharedValue(0),
originalX: useSharedValue(0),
originalY: useSharedValue(0),
}));

/*
 Once you call createContext (see file WordContext.tsx), you get a Provider 
 and a Consumer. The Provider is used to wrap the part of your component tree
  that needs access to the context value. The Consumer is used to access the 
  context value within the components that are wrapped by the Provider.
  Below, each Word component is wrapped by a WordContext.Provider, which provides the context value
  (wordHeight, wordGap, text) to each Word component. This allows each Word component 
  to access these values. See Word.tsx for how Word component uses useContext(WordContext) 
  to access the context values.
*/

const wordElements = useMemo(() => {
  // console.log("********** Rendering word elements with wwww words: ", words);
  //const shuffledWords = words.sort(() => Math.random() - 0.5);
  // note: sort mutates the original array, so if you want to use the original array
  // without sorting, you have to comment out the line above and use "words" directly in the map function below.
  // GOT CHA: kpham Apr 10, 2026
  //return shuffledWords.map((word, index) => (
  // use words directly without shuffling for now to make it easier to debug and verify that the correct words are rendered in the correct positions
  return wordBankWords.map((word, index) => (
    <WordContext.Provider key={`${word}-${index}`} value={{ wordHeight, wordGap, text: word }}>
       <Word />
    </WordContext.Provider>
  ));
  /*
   The map function above returns an array of WordContext.Provider components, 
   (which return JSX elements like any other React components)
   Each provider wraps a Word component and provides it with the context values (wordHeight, wordGap, text).
   Thererfore, wordElements is an array of JSX elements that can be conveniently passed in as children
   to ComputeWordLayout, which will render them and compute their layout.
   */

  // Note: "extraData" provided here is used to force a re-render when the words change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [wordBankWords, wordHeight, wordGap]);

    const initialized = layout && containerWidth > 0;
    // console.log("Child1: layout: ", layout, "containerWidth: ", containerWidth, "initialized: ", initialized);
    // offsets state, which contains shared values for Reanimated, is modified in ComputerWorkLayout,
    if (!initialized) {
        return (
            <View style={styles.container} onLayout={onLayout}>
                <DebugGrid width={dimensions.width} height={dimensions.height} />
                <ComputeWordLayout
                    offsets={offsets}
                    onLayout={setLayout}
                    wordHeight={wordHeight}
                    lineHeight={lineHeight}
                    wordGap={wordGap}
                    wordBankOffsetY={wordBankOffsetY}
                    onContainerWidth={setContainerWidth}
                    onSlotWidth={setSlotWidth}
                    onLongestText={setLongestText}
                >
                    {wordElements}
                </ComputeWordLayout>
            </View>
        )
    }

    const { numLines, wordStyles } = layout;
    const idealNumLines = numLines < 3 ? numLines + 1 : numLines;
  const linesContainerHeight = idealNumLines * lineHeight || lineHeight;
  /** Since word bank is absolutely positioned, estimate the total height of container with offsets */
  const wordBankHeight = numLines * (wordHeight + wordGap * 2) + wordBankOffsetY * 2;

  const PlaceholderComponent =  Placeholder;
  const LinesComponent = Lines;

  const enable_checkButton = () => {
     //console.log("enable_checkButton called from Child1");
  }

  // offsets state is passed into ClickableWordNew for animation, it is also used
  // to recalculate the layout whenever clicks on a word, either to move it 
  // from bank to answer area or vice versa, or to rearrange the order of words in the answer area.
/*
  <View
                key={item.id}
                style={[styles.fillSlot, { width: slotWidth, height: wordHeight }]}
                onLayout={(e) => onFillSlotLayout(e, fillIndex++)}
              />
*/

  return (
    <GestureHandlerRootView>
    <View style={styles.container}>
        <DebugGrid width={dimensions.width} height={dimensions.height} />
      <View style={styles.inputRow} onLayout={onInputRowLayout}>
        {(() => {
          let fillIndex = 0;
          return inputFields?.map((item) =>
            item.type === 'text' ? (
              <Text key={item.id} style={[styles.inputText, { lineHeight: wordHeight }]}>{item.value}</Text>
            ) : (
              <Text
                key={item.id}
                style={[item.readyForFill ? styles.fillLotReady : styles.fillLot, { lineHeight: wordHeight }]}
                onLayout={(e) => onFillSlotLayout(e, fillIndex++)}
              >
                {longestText}
              </Text>
            )
          );
        })()}
      </View>
      <View style={{ minHeight: wordBankHeight }} />
      <View style={[StyleSheet.absoluteFill, { zIndex: 1, backgroundColor: 'rgba(0,255,0,0.2)' }]}>
        {wordElements.map((child, index) => (
          <Fragment key={`${wordBankWords[index]}-f-${index}`}>
            <ClickableWordNew
              offsets={offsets}
              index={index}
              wordHeight={wordHeight}
              wordBankOffsetY={wordBankOffsetY}
              fillSlotPositions={fillSlotPositions}
              parentFunc={enable_checkButton}
            >
              {child}
            </ClickableWordNew>
          </Fragment>
        ))}
      </View>
    </View>

    </GestureHandlerRootView>
  );


}

const styles = StyleSheet.create({
  container: {
     flex: 0,
    backgroundColor: 'lightgray',
  },
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    //paddingHorizontal: 5,
    alignContent: 'center',
    paddingVertical: 10,
    paddingTop: 20,
    rowGap: 10,
  },
  inputText: {
    fontSize: 16,
  },
  fillLot: {
    fontSize: 16,
    paddingHorizontal: 4,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,255,0.3)',
    color: 'transparent',
  },

  fillLotReady: {
    fontSize: 16,
    paddingHorizontal: 4,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,255,0.3)',
    color: 'transparent',
  },
 
})

export default ClickAndCloze

/*
 fillSlot: {
    borderBottomWidth: 2,
    borderBottomColor: '#999',   
    backgroundColor: 'blue',
  },
*/

/*
   <View style={styles.container}>
        <DebugGrid width={dimensions.width} height={dimensions.height} />
      <LinesComponent numLines={idealNumLines} containerHeight={linesContainerHeight} lineHeight={lineHeight} />
      <View style={{ minHeight: wordBankHeight }} />
      {wordElements.map((child, index) => (
        
        <Fragment key={`${words[index]}-f-${index}`}>
          <ClickableWordNew
            offsets={offsets}
            index={index}
            wordHeight={wordHeight}
            wordBankOffsetY={wordBankOffsetY}
            parentFunc={enable_checkButton}
          >
            {child}
          </ClickableWordNew>
        </Fragment>
      ))}
    </View>
*/
