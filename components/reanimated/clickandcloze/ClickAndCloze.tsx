import { ChildQuestionRef } from '@/components/types';
import React, { Fragment, useImperativeHandle, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import ClickableWordNew from './ClickableWordNew';
import ComputeWordLayout from './ComputeWordLayout';
import DebugGrid from './DebugGrid';
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
   enableCheckButton: (value: boolean) => void;
   distractors?: string[];
   extraData?: any;
}

interface InnerProps {
  inputFields: InputItem[];
  wordBankWords: string[];
  enableCheckButton: (value: boolean) => void;
  setDroppedWords: (words: (string | null)[]) => void;
}

/*
 export interface TakeQuestionProps  {
    ref?: React.Ref<ChildQuestionRef>;
    content: string | undefined; // Content of the question, if needed
    enableCheckButton: (value: boolean) => void; // Function to enable the Check button
  };
*/

//const DuoDragDrop= React.forwardRef<ChildQuestionRef, DuoDragDropProps>((props, ref) => {
//function ClickAndCloze({content, distractors = [], enableCheckButton}: Props) {
  const ClickAndCloze = React.forwardRef<ChildQuestionRef, Props>(
    ({ content, distractors = [], enableCheckButton, extraData }, ref) => {
      const { inputFields, wordBankWords } = parseContent(content);
      const allWords = [...wordBankWords, ...distractors];
      const fillCount = inputFields.filter(i => i.type === 'fill').length;
      const [droppedWords, setDroppedWords] = useState<(string | null)[]>(
        Array(fillCount).fill(null)
      );

      React.useEffect(() => {
        setDroppedWords(Array(fillCount).fill(null));
      }, [content, extraData]);

      useImperativeHandle(ref, () => ({
        getAnswer: () => {
          //console.log('getAnswer droppedWords:', droppedWords);
          return droppedWords.filter(Boolean).join('/');
        }
      }));

      const innerKey = `${content}-${JSON.stringify(extraData)}`;
      return <ClickAndClozeInner key={innerKey} inputFields={inputFields} wordBankWords={allWords} enableCheckButton={enableCheckButton} setDroppedWords={setDroppedWords} />;
    }
  );
  

function ClickAndClozeInner({inputFields: initialInputFields, wordBankWords, enableCheckButton, setDroppedWords}: InnerProps) {

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const [inputFields, setInputFields] = useState<InputItem[]>(initialInputFields);

    const [longestText, setLongestText] = useState('');

    

const fontSize = 16;
const [wordHeight, setWordHeight] = useState(fontSize * 2);
const slotHeightMeasured = React.useRef(false);
const wordGap = 10;

const lineHeight = wordHeight * 1.2;
const lineGap = lineHeight - wordHeight;
const [containerWidth, setContainerWidth] = useState(0);

const [layout, setLayout] = useState<LayoutType | null>(null);

React.useEffect(() => {
  setLayout(null);
  setContainerWidth(0);
}, [wordHeight]);

const fillCount = inputFields?.filter(i => i.type === 'fill').length ?? 0;
const [fillSlotPositions, setFillSlotPositions] = useState<{x: number, y: number}[]>([]);
const [slotWidth, setSlotWidth] = useState(wordHeight * 3);
const measuredFills = React.useRef<({x: number, y: number} | null)[]>(Array(fillCount).fill(null));
const inputRowLayout = React.useRef<{x: number, y: number} | null>(null);

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
  const { x, y, height } = e.nativeEvent.layout;
  console.log(`onFillSlotLayout for fill index ${fillIndex}:  height=${height}`);
  measuredFills.current[fillIndex] = { x, y };
  if (fillIndex === 0 && !slotHeightMeasured.current) {
    slotHeightMeasured.current = true;
    setWordHeight(height);
  }
  trySetFillPositions();
};


const wordBankOffsetY = 30  // the offset (distance) between the top of the word bank
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
  const wordBankRows = 2; // word bank wraps to at most 2 rows
  const wordBankHeight = wordBankRows * (wordHeight + wordGap) + wordBankOffsetY * 2;

  //const PlaceholderComponent =  Placeholder;
  //const LinesComponent = Lines;

  const onSlotChange = (slotIndex: number | null) => {
    const newDroppedWords: (string | null)[] = Array(fillCount).fill(null);
    offsets.forEach((o, wordIndex) => {
      if (o.order.value !== -1) {
        newDroppedWords[o.order.value] = wordBankWords[wordIndex];
      }
    });
    setDroppedWords(newDroppedWords);
    console.log('droppedWords:', newDroppedWords);

    setTimeout(() => setInputFields(prev => {
      const fills = prev.filter(i => i.type === 'fill');
      return prev.map(item => {
        if (item.type !== 'fill') return item;
        if (slotIndex === null) {
          // word returned to bank — mark the first unoccupied slot as ready
          const occupiedSlots = offsets
            .map((o, i) => o.order.value !== -1 ? o.order.value : -1)
            .filter(v => v !== -1);
          const fillIndex = fills.indexOf(item);
          const isOccupied = occupiedSlots.includes(fillIndex);
          const firstFreeIndex = fills.findIndex((_, fi) => !occupiedSlots.includes(fi));
          return { ...item, readyForFill: fillIndex === firstFreeIndex && !isOccupied };
        } else {
          // word placed — mark that slot as not ready, next free slot as ready
          const fillIndex = fills.indexOf(item);
          const occupiedSlots = offsets
            .map(o => o.order.value !== -1 ? o.order.value : -1)
            .filter(v => v !== -1);
          occupiedSlots.push(slotIndex);
          const firstFreeIndex = fills.findIndex((_, fi) => !occupiedSlots.includes(fi));
          return { ...item, readyForFill: fillIndex === firstFreeIndex };
        }
      });
    }), 700);
  };


  return (
    <GestureHandlerRootView>
    <View style={styles.container}>
       
      <View style={styles.inputRow} onLayout={onInputRowLayout}>
        {(() => {
          let fillIndex = 0;
          return inputFields?.map((item) =>
            item.type === 'text' ? (
              <Text key={item.id} style={[styles.inputText, { lineHeight: wordHeight }]}>{item.value}</Text>
            ) : (
              <Text
                key={item.id}
                style={[item.readyForFill ? styles.fillLotReady : styles.fillLot, 
                  { lineHeight: wordHeight, height: wordHeight }]}
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
              parentFunc={enableCheckButton}
              onSlotChange={onSlotChange}
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
    backgroundColor: 'yellow',
    margin: 10,
  },
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    //paddingHorizontal: 5,
    alignContent: 'center',
    //paddingVertical: 10,
    //paddingTop: 20,
    rowGap: 10,
  },
  inputText: {
    fontSize: 16,
    paddingHorizontal: 8,
  },
  fillLot: {
    fontSize: 16,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: 'rgba(155, 155, 177, 0.3)',
    color: 'transparent',
  },

  fillLotReady: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor:  'white',
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
