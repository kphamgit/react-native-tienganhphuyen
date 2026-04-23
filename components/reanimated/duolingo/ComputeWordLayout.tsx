import React, { JSX, useRef, useState } from "react";
import { StyleSheet, View, type LayoutRectangle, type StyleProp, type ViewStyle } from "react-native";
//import DebugGrid from "./DebugGrid";
import { type Offset } from "./Layout";

export interface ComputeWordLayoutProps {
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
 *
 * ComputeWordLayout
 *
 * The drag-and-drop system positions words using absolute positioning with Reanimated shared values.
 * To do that, it needs to know each word's width, x, and y upfront.
 * There's no way to know these before rendering, so this component renders the words first using
 * normal flexWrap layout (which React Native handles natively), then captures the measurements.
 *
 * ComputeWordLayout (invisible)
 *     ↓ measures all words via onLayout (width, x, and y)
 *     ↓ writes widths/positions into shared values
 *     ↓ calls onLayout() → setLayout() in parent (real UI, absolute positioned)
 */
export default function ComputeWordLayout({
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <>
      
      <View
        style={[styles.computeWordLayoutContainer, styles[wordBankAlignment]]}
        onLayout={(e) => {
          setDimensions({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
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
                console.log("calculatedOffsets for index ", index, ": ", calculatedOffsets.current[index]);
/*
 calculatedOffsets for index  0 :  {"height": 48, "width": 55.33332824707031, "x": 141, "y": 0}
*/

                if (Object.keys(calculatedOffsets.current).length === children.length) {
                  console.log("All words measured, calculating layout...");
                  const numLines = new Set();
                  for (const index in calculatedOffsets.current) {
                    const { y } = calculatedOffsets.current[index];
                    numLines.add(y);
                  }
                  const numLinesSize = numLines.size < 3 ? numLines.size + 1 : numLines.size;
                  const linesHeight = numLinesSize * lineHeight;
                  for (const index in calculatedOffsets.current) {
                    const { x, y, width } = calculatedOffsets.current[index];
                    // offsets is an array of shared value objects — one per word
                    // — used by Reanimated to drive the drag-and-drop animations on the UI thread. 
                    // Each entry looks like:
                    // {
                    //   order: useSharedValue(0),
                    //   width: useSharedValue(0),
                    //   originalX: useSharedValue(0),
                    //   originalY: useSharedValue(0),

                    // Now, initialize each word's offset with its measured position (from calculatedOffsets):
                    // to set up the shared values that ClickableWordNew will use to position words during gestures.
                    const offset = offsets[index];
                    // offset.order.value = -1 — marks the word as not yet placed in the answer area (unordered/in word bank)
                    offset.order.value = -1;
                    offset.width.value = width;
                    offset.originalX.value = x;
                    // wordBankOffsetY is added to the originalY so that the word bank (where words start) appears below the answer lines
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
                    console.log("Time is up.  Calling onLayout with numLines: ", numLines.size, " and offsetStyles: ", offsetStyles.current);
                    onLayout({ numLines: numLines.size, wordStyles: offsetStyles.current });
                  }, 160000);
                }
              }}
            >
              {child}
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
