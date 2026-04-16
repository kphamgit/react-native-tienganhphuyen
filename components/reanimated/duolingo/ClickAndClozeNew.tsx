/* eslint-disable react-hooks/rules-of-hooks */
import { ChildQuestionRef } from "@/components/types";
import React, { Fragment, JSX, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import ClickableWordNew from "./ClickableWordNew";
import ComputeWordLayout from "./ComputeWordLayout";
import Lines from "./Lines";
import Placeholder from "./Placeholder";
import type { OnDropFunction } from "./types";
import Word from "./Word";
import WordContext from "./WordContext";

export interface Props {
  /** List of words */
  words: string[];
  /** Re-renders the words when this value changes. */
  extraData?: any;
  /** Height of an individual word. Default: 45 */
  wordHeight?: number;
  /** The gap between each word / line: Default: 4 */
  wordGap?: number;
  /** The height of a single line in the top "answered" pile. Default: wordHeight * 1.2  */
  lineHeight?: number;
  /** The margin between the "Bank" pile and the "Answer" pile. Default: 20 */
  wordBankOffsetY?: number;
  /** Whether to lay out words in the "Answer" pile from right-to-left (for languages such as Arabic) */
  rtl?: boolean;
  /** Whether tap & drag gestures are disabled. Default: false */
  gesturesDisabled?: boolean;
  /** The offset between the "Bank" pile and the "Answer" pile. Default: 20 */
  wordBankAlignment?: "center" | "left" | "right";
  /** Overrides the default Word renderer */
  renderWord?: (word: string, index: number) => JSX.Element;
  /** Overrides the default Lines renderer */
  renderLines?: (props: { numLines: number; containerHeight: number; lineHeight: number }) => JSX.Element;
  /** Overrides the default Placeholder renderer */
  renderPlaceholder?:
    | ((props: {
        style: {
          position: "absolute";
          height: number;
          top: number;
          left: number;
          width: number;
        };
      }) => JSX.Element)
    | null;
  /** Runs when the drag-and-drop has rendered */
  onReady?: (ready: boolean) => void;
  /** Called when a user taps or drags a word to its destination */
  onDrop?: OnDropFunction;
  enableCheckButton: (value: boolean) => void; //
}

const ClickAndClozeNew= React.forwardRef<ChildQuestionRef, Props>((props, ref) => {  
  const {
    words,
    extraData,
    renderWord,
    renderLines,
    renderPlaceholder,
    rtl,
    gesturesDisabled,
    wordBankAlignment = "center",
    wordGap = 4,
    wordBankOffsetY = 20,
    wordHeight = 40,
    onReady,
    onDrop,
    enableCheckButton, // This is the function that will be called when the user finishes the drag-and-drop
  } = props;
  const lineHeight = props.lineHeight || wordHeight * 1.2;
  const lineGap = lineHeight - wordHeight;
  const [layout, setLayout] = useState<{ numLines: number; wordStyles: StyleProp<ViewStyle>[] } | null>(null);
  // this layout state variable is very important. It will be set by the ComputeWordLayout child component 
  // after it measures the words and calculates their positions.
  const [containerWidth, setContainerWidth] = useState(0);

  const wordElements = useMemo(() => {
    console.log("**************** Rendering word elements with wwww words: ", words);
    const shuffledWords = words.sort(() => Math.random() - 0.5);
    return shuffledWords.map((word, index) => (
      <WordContext.Provider key={`${word}-${index}`} value={{ wordHeight, wordGap, text: word }}>
        {renderWord?.(word, index) || <Word />}
      </WordContext.Provider>
    ));
    // Note: "extraData" provided here is used to force a re-render when the words change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, wordHeight, wordGap, extraData, renderWord]);

  // initialize offsets

  const offsets = words.map(() => ({
    order: useSharedValue(0),
    width: useSharedValue(0),
    height: useSharedValue(0),
    x: useSharedValue(0),
    y: useSharedValue(0),
    originalX: useSharedValue(0),
    originalY: useSharedValue(0),
  }));

  useImperativeHandle(ref, () => ({
    getAnswer: () => {
      const answeredWords = [];
      for (let i = 0; i < offsets.length; i++) {
        const offset = offsets[i];
        if (offset.order.value !== -1) {
          const word = words[i];
          answeredWords.push({ word, order: offset.order.value });
        }
      }
      const answer_array = answeredWords.sort((a, b) => a.order - b.order).map((w) => w.word);
      return answer_array.join('/');
    }
  }));

  // containerWidth is set once ComputeWordLayout finishes measuring the words and calls onContainerWidth
  //  (which is setContainerWidth here) to save the container width into state.
  const initialized = layout && containerWidth > 0;

  // initialized is TRUE only after ComputeWordLayout has measured the words and called setLayout() 
  // to save the measurements into the "layout" state variable.

  // if layout is set to NULL, then initialized becomes false, which means the component goes back to the 
  // "measurement phase" where ComputeWordLayout is rendered again to measure the words.

  // Toggle right-to-left layout
  /**
    The call to calculateLayout() modifies offset.x.value and offset.y.value on each word in the answer area. 
    Since these are Reanimated SharedValues, writing to them immediately triggers animated repositioning of 
       the word chips on screen 
     — that's how words smoothly slide into their new positions when the layout is recalculated.

     The offsets array itself (its references) is not changed, only the .value properties inside each element.
  */

   /*
  useEffect(
    () => {
      if (initialized) {
        console.log("RTL changed, calling calculateLayout with rtl=", rtl);
        // after initialization, every time rtl changes, we need to recalculate the layout to update the x/y position of each word in the answer area
        calculateLayout(offsets, containerWidth, wordHeight, wordGap, lineGap, rtl);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rtl],
  );
  */
  useEffect(() => {
    // Notify parent the initialized status
    // onReady is a callback function passed in as a prop, which allows the parent component to know 
    // when the ClickAndClozeNew component has finished its initial layout and is ready for user interaction.
    onReady?.(!!initialized);
  }, [initialized, onReady]);

  useEffect(() => {
    // Reset layout when user-provided measurements change
    // If the parent component changes any of the measurements (wordBankOffsetY, wordBankAlignment, 
    // wordGap, wordHeight), we need to reset the layout so that ComputeWordLayout 
    // can re-measure and re-calculate the positions of the words.
    setLayout(null);
  }, [wordBankOffsetY, wordBankAlignment, wordGap, wordHeight]);

  // We first have to render the (opacity=0) child components in order to obtain x/y/width/height of every word segment
  // This will allow us to position the elements in the Lines
  if (!initialized) {
    return (
      <ComputeWordLayout
        offsets={offsets}
        onContainerWidth={setContainerWidth}
        onLayout={setLayout}
        wordHeight={wordHeight}
        lineHeight={lineHeight}
        wordBankAlignment={wordBankAlignment}
        wordBankOffsetY={wordBankOffsetY}
        wordGap={wordGap}
      >
        {wordElements}
      </ComputeWordLayout>
    );
  }

  // if we get here, which means initilized is true, it means ComputeWordLayout has already measured the words 
  // and called setLayout() to save the measurements into the "layout" state variable.
  // ComputeWordLayout is also unmounted at this point,
  // and the real UI with absolute positioned words is rendered instead ( see the next return statement)

  const { numLines, wordStyles } = layout;

  // Add an extra line to account for certain word combinations that can wrap over to a new line
  const idealNumLines = numLines < 3 ? numLines + 1 : numLines;
  const linesContainerHeight = idealNumLines * lineHeight || lineHeight;
  /** Since word bank is absolutely positioned, estimate the total height of container with offsets */
  const wordBankHeight = numLines * (wordHeight + wordGap * 2) + wordBankOffsetY * 2;

  const PlaceholderComponent = renderPlaceholder || Placeholder;
  const LinesComponent = renderLines || Lines;

  const enable_checkButton = () => {
    enableCheckButton(true); // Call the parent function to enable the Check button
  }
  return (
    <GestureHandlerRootView>
    <View style={styles.container}>
      <LinesComponent numLines={idealNumLines} containerHeight={linesContainerHeight} lineHeight={lineHeight} />
      <View style={{ minHeight: wordBankHeight }} />
      {wordElements.map((child, index) => (
        
        <Fragment key={`${words[index]}-f-${index}`}>
          {renderPlaceholder === null ? null : <PlaceholderComponent style={wordStyles[index] as any} />}
          <ClickableWordNew
            offsets={offsets}
            index={index}
            containerWidth={containerWidth}
            gesturesDisabled={Boolean(gesturesDisabled)}
            linesHeight={linesContainerHeight}
            lineGap={lineGap}
            wordHeight={wordHeight}
            wordGap={wordGap}
            wordBankOffsetY={wordBankOffsetY}
            onDrop={onDrop}
            parentFunc={enable_checkButton}
          >
            {child}
          </ClickableWordNew>
        </Fragment>
      ))}
    </View>
     {/* print layout for debugging */}
     {layout && (
        <View style={{ position: "absolute",   top: 0, left: 0, width: "100%", height: "100%" }} pointerEvents="none">
          <Text style={{color: "white"}}>{JSON.stringify(layout)}</Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
});


const styles = StyleSheet.create({
  container: {
    flex: 1,  // default position is "relative", for flex to work.
    //  This also allows absolute positioned children to be positioned relative to this container
  },
  computeWordLayoutContainer: {
    backgroundColor: "red",  // DEBUG
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 20,
    width: '100%',
  },
  center: {
    justifyContent: "center",
  },
  right: {
    justifyContent: "flex-end",
  },
  left: {
    justifyContent: "flex-start",
  },
});

const ClickAndClozeNewInstance = React.forwardRef<ChildQuestionRef, Props>((props, ref) => {
  const wordsKey = JSON.stringify(props.words) + JSON.stringify(props.extraData);
  // We need to re-mount the component if words are modified to avoid hook mismatches. "useSharedValue" is initialized on every word
  return <ClickAndClozeNew ref={ref} {...props} key={wordsKey} />;
});

export default React.memo(ClickAndClozeNewInstance);

/*
what does the call to function onLayout at line 301 does?
Looking at the call chain:

Line 301: onLayout({ numLines: numLines.size, wordStyles: offsetStyles.current })

onLayout here is the prop passed into ComputeWordLayout from the parent — trace it back:

Read ClickAndClozeNew.tsx (lines 153-172)
onLayout={setLayout} — so onLayout(...) is calling setLayout(...), which is the React state setter from:


const [layout, setLayout] = useState<{ numLines: number; wordStyles: ... } | null>(null);
So the call on line 301 does two things in one shot:

Stores the measurement results — { numLines: numLines.size, wordStyles: offsetStyles.current } is saved into the layout state variable

Triggers a re-render — because setLayout is a state setter, React schedules a re-render. 
On that re-render, initialized = layout && containerWidth > 0 becomes true,
 so the if (!initialized) gate no longer fires, ComputeWordLayout is unmounted, 
 and the real chip render runs instead

In short: it's the signal that measurement is complete and the component should switch from the invisible measurement phase to the real visible UI.


*/
