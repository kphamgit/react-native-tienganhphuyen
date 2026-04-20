/* eslint-disable react-hooks/rules-of-hooks */
import { ChildQuestionRef } from "@/components/types";
import React, { Fragment, JSX, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { StyleSheet, View, type LayoutRectangle, type StyleProp, type ViewStyle } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { runOnJS, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import ClickableWord, { ClickableWordProps } from "./ClickableWord";
import Lines from "./Lines";
import Placeholder from "./Placeholder";
import { calculateLayout, type Offset } from "./SentenceLayout";
import SortableWord from "./SortableWord";
import type { DuoAnimatedStyleWorklet, OnDropFunction } from "./types";
import Word from "./Word";
import WordContext from "./WordContext";

export interface DuoDragDropProps {
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
  /** Allows user to modify animation of the word while it's animating. NOTE: this must be a worklet */
  animatedStyleWorklet?: DuoAnimatedStyleWorklet;
  /** Runs when the drag-and-drop has rendered */
  onReady?: (ready: boolean) => void;
  /** Called when a user taps or drags a word to its destination */
  onDrop?: OnDropFunction;
  enableCheckButton: (value: boolean) => void; //
}

const DuoDragDrop= React.forwardRef<ChildQuestionRef, DuoDragDropProps>((props, ref) => {
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
    animatedStyleWorklet,
    onReady,
    onDrop,
    enableCheckButton, // This is the function that will be called when the user finishes the drag-and-drop
  } = props;
  const lineHeight = props.lineHeight || wordHeight * 1.2;
  const lineGap = lineHeight - wordHeight;
  const [layout, setLayout] = useState<{ numLines: number; wordStyles: StyleProp<ViewStyle>[] } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const wordElements = useMemo(() => {
    //console.log("********** Rendering word elements with wwww words: ", words);
    const shuffledWords = words.sort(() => Math.random() - 0.5);
    return shuffledWords.map((word, index) => (
      <WordContext.Provider key={`${word}-${index}`} value={{ wordHeight, wordGap, text: word }}>
        {renderWord?.(word, index) || <Word />}
      </WordContext.Provider>
    ));
    // Note: "extraData" provided here is used to force a re-render when the words change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, wordHeight, wordGap, extraData, renderWord]);

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

  const initialized = layout && containerWidth > 0;

  // Toggle right-to-left layout
  /**å
The call to calculateLayout() modifies offset.x.value and offset.y.value on each word in the answer area. 
Since these are Reanimated SharedValues, writing to them immediately triggers animated repositioning of 
the word chips on screen 
— that's how words smoothly slide into their new positions when the layout is recalculated.

The offsets array itself (its references) is not changed, only the .value properties inside each element.
  */

  useEffect(
    () => {
      if (initialized) {
        calculateLayout(offsets, containerWidth, wordHeight, wordGap, lineGap, rtl);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rtl],
  );

  useEffect(() => {
    // Notify parent the initialized status
    onReady?.(!!initialized);
  }, [initialized, onReady]);

  useEffect(() => {
    // Reset layout when user-provided measurements change
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
   // enableCheckButton(); // Call the parent function (question_attempt) to enable the Check button  
  }
  return (
    <GestureHandlerRootView>
    <View style={styles.container}>
      <LinesComponent numLines={idealNumLines} containerHeight={linesContainerHeight} lineHeight={lineHeight} />
      <View style={{ minHeight: wordBankHeight }} />
      {wordElements.map((child, index) => (
        <Fragment key={`${words[index]}-f-${index}`}>
          {renderPlaceholder === null ? null : <PlaceholderComponent style={wordStyles[index] as any} />}
          <WordProxy
            offsets={offsets}
            index={index}
            rtl={Boolean(rtl)}
            containerWidth={containerWidth}
            gesturesDisabled={Boolean(gesturesDisabled)}
            linesHeight={linesContainerHeight}
            lineGap={lineGap}
            wordHeight={wordHeight}
            wordGap={wordGap}
            wordBankOffsetY={wordBankOffsetY}
            animatedStyleWorklet={animatedStyleWorklet}
            onDrop={onDrop}
            parentFunc={enable_checkButton}
          >
            {child}
          </WordProxy>
        </Fragment>
      ))}
    </View>
    </GestureHandlerRootView>
  );
});

type WordProxyProps = Omit<ClickableWordProps, 'children'> & {
  children: JSX.Element;
};

function WordProxy({ offsets, index, children, ...rest }: WordProxyProps) {
  const offset = offsets[index];
  const [isInBank, setIsInBank] = React.useState(offset.order.value === -1);

  useAnimatedReaction(
    () => offset.order.value === -1,
    (curr, prev) => {
      if (curr !== prev) runOnJS(setIsInBank)(curr);
    }
  );

  if (isInBank) {
    return <ClickableWord offsets={offsets} index={index} {...rest}>{children}</ClickableWord>;
  }
  return <SortableWord offsets={offsets} index={index} {...rest}>{children}</SortableWord>;
}

interface ComputeWordLayoutProps {
  children: JSX.Element[];
  offsets: Offset[];
  onLayout(params: { numLines: number; wordStyles: StyleProp<ViewStyle>[] }): void;
  onContainerWidth(width: number): void;
  wordBankAlignment: "center" | "left" | "right";
  wordBankOffsetY: number;
  wordHeight: number;
  lineHeight: number;
  wordGap: number;
}

/**
 * This component renders with 0 opacity in order to
 * compute word positioning & container width
 
ComputeWordLayout

The drag-and-drop system positions words using absolute positioning with Reanimated shared values. To do that, it needs to know each word's width, x, and y upfront. 
There's no way to know these before rendering, so this component renders the words first using normal flexWrap layout (which React Native handles natively), 
then captures the measurements.

ComputeWordLayout (invisible)
    ↓ measures all words via onLayout (width, x, and y)
    ↓ writes widths/positions into shared values
    ↓ calls onLayout() → setLayout() in parent DuoDragDrop (real UI, absolute positioned)

 */
function ComputeWordLayout({
  wordGap,
  children,
  offsets,
  onLayout,
  onContainerWidth,
  wordHeight,
  lineHeight,
  wordBankAlignment,
  wordBankOffsetY,
}: ComputeWordLayoutProps) {
  const calculatedOffsets = useRef<LayoutRectangle[]>([]);
  const offsetStyles = useRef<StyleProp<ViewStyle>[]>([]);

  return (
    <View
      style={[styles.computeWordLayoutContainer, styles[wordBankAlignment]]}
      onLayout={(e) => {
        onContainerWidth(e.nativeEvent.layout.width);
      }}
    >
      {children.map((child, index) => {
        return (
          <View
            key={`compute.${index}`}
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              calculatedOffsets.current[index] = { width, height, x, y };

              if (Object.keys(calculatedOffsets.current).length === children.length) {
                const numLines = new Set();
                for (const index in calculatedOffsets.current) {
                  const { y } = calculatedOffsets.current[index];
                  numLines.add(y);
                }
                const numLinesSize = numLines.size < 3 ? numLines.size + 1 : numLines.size;
                const linesHeight = numLinesSize * lineHeight;
                for (const index in calculatedOffsets.current) {
                  const { x, y, width } = calculatedOffsets.current[index];
                  const offset = offsets[index];
                  offset.order.value = -1;
                  offset.width.value = width;
                  offset.originalX.value = x;
                  offset.originalY.value = y + linesHeight + wordBankOffsetY;

                  offsetStyles.current[index] = {
                    position: "absolute",
                    height: wordHeight,
                    top: y + linesHeight + wordBankOffsetY * 2,
                    left: x + wordGap,
                    width: width - wordGap * 2,
                  };
                }
                setTimeout(() => {
                  // DEBUG: commented out to keep ComputeWordLayout visible
                   onLayout({ numLines: numLines.size, wordStyles: offsetStyles.current });
                }, 16);
              }
            }}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  computeWordLayoutContainer: {
    //backgroundColor: "red",  // DEBUG
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0,
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

const DuoDragDropInstance = React.forwardRef<ChildQuestionRef, DuoDragDropProps>((props, ref) => {
  const wordsKey = JSON.stringify(props.words) + JSON.stringify(props.extraData);
  // We need to re-mount the component if words are modified to avoid hook mismatches. "useSharedValue" is initialized on every word
  return <DuoDragDrop ref={ref} {...props} key={wordsKey} />;
});

export default React.memo(DuoDragDropInstance);