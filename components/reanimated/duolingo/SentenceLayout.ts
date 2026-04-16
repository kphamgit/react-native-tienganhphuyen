import { SharedValue, useSharedValue } from "react-native-reanimated";

// These util functions were extracted from: wcadillon/react-native-redash

/**
 * @worklet
 */

/** 
Moves an element from "from" index to "to" index in an array, 
shifting everything else to fill the gap.
Example:

const arr = ['a', 'b', 'c', 'd']
move(arr, 0, 2)
// removes 'a' from index 0 → ['b', 'c', 'd']
// inserts 'a' at index 2   → ['b', 'c', 'a', 'd']
*/

export const move = <T>(input: T[], from: number, to: number) => {
  "worklet";
  const offsets = input.slice();
  while (from < 0) {
    from += offsets.length;
  }
  while (to < 0) {
    to += offsets.length;
  }
  if (to >= offsets.length) {
    let k = to - offsets.length;
    while (k-- + 1) {
      offsets.push();
    }
  }
  offsets.splice(to, 0, offsets.splice(from, 1)[0]);
  return offsets;
};

/**
 * @summary Returns true if node is within lowerBound and upperBound.
 * @worklet
 */
export const between = (value: number, lowerBound: number, upperBound: number, inclusive = true) => {
  "worklet";
  if (inclusive) {
    return value >= lowerBound && value <= upperBound;
  }
  return value > lowerBound && value < upperBound;
};

/**
 * @summary Type representing a vector
 * @example
   export interface Vector<T = number> {
    x: T;
    y: T;
  }
 */
export interface Vector<T = number> {
  x: T;
  y: T;
}

/**
 * @summary Returns a vector of shared values
 */
/*
export const useVector = (x1 = 0, y1?: number): Vector<Animated.SharedValue<number>> => {
  const x = useSharedValue(x1);
  const y = useSharedValue(y1 ?? x1);
  return { x, y };
};
*/
export const useVector = (x1 = 0, y1?: number): Vector<SharedValue<number>> => {
  const x = useSharedValue(x1);
  const y = useSharedValue(y1 ?? x1);
  return { x, y };
};

type SharedValues<T extends Record<string, string | number | boolean>> = {
  [K in keyof T]: SharedValue<T[K]>;
};

export type Offset = SharedValues<{
  order: number;
  height: number;
  width: number;
  x: number;
  y: number;
  originalX: number;
  originalY: number;
}>;

const isNotInBank = (offset: Offset) => {
  "worklet";
  return offset.order.value !== -1;
};

const byOrder = (a: Offset, b: Offset) => {
  "worklet";
  return a.order.value - b.order.value;
};

export const lastOrder = (input: Offset[]) => {
  "worklet";
  return input.filter(isNotInBank).length;
};



export const remove = (input: Offset[], index: number) => {
  "worklet";
  const offsets = input
    .filter((_, i) => i !== index)
    .filter(isNotInBank)
    .sort(byOrder);

  for (let i = 0; i < offsets.length; i++) {
    offsets[i].order.value = i;
  }
};

export const reorder = (input: Offset[], from: number, to: number) => {
  /*
When a user drags word4 over word1, reorder() calls move() to shift the word array so the visual order updates:
  */
  "worklet";
  const offsets = input.filter(isNotInBank).sort(byOrder);
  const newOffset = move(offsets, from, to);
  for (let i = 0; i < newOffset.length; i++) {
    newOffset[i].order.value = i;
  }
};

/**
calculateLayout computes the x and y position for each word in the answer area
 (not the word bank). It lays words out in a wrapping row, like a flex-wrap layout.
 Visually:

 [ word1 ][ word2 ][ word3 ]   ← lineNumber=0
 [ word4 ][ word5 ]            ← lineNumber=1 (word4 didn't fit on line 0)

 It's essentially a manual flexWrap="wrap" implementation that runs on the Reanimated worklet thread, 
 so it can be called during gestures without touching the JS thread.
 */

export const calculateLayout = (
  input: Offset[],
  containerWidth: number,
  wordHeight: number,
  wordGap: number,
  lineGap: number,
  rtl = false,
) => {
  "worklet";
  const offsets = input.filter(isNotInBank).sort(byOrder);

  if (offsets.length === 0) {
    return;
  }
  let lineNumber = 0;
  let lineBreak = 0;
  for (let i = 0; i < offsets.length; i++) {
    const offset = offsets[i];
    const total = offsets.slice(lineBreak, i).reduce((acc, o) => acc + o.width.value + wordGap / 2, 0);
    if (total + offset.width.value > containerWidth) {
      lineNumber += 1;
      lineBreak = i;
      offset.x.value = rtl ? containerWidth - offset.width.value : 0;
    } else {
      offset.x.value = rtl ? containerWidth - total - offset.width.value : total;
    }
    offset.y.value = (wordHeight + lineGap) * lineNumber + lineGap / 2;
  }
};