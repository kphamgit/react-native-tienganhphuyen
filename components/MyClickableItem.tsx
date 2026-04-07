import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Define the Rect type
type Rect = { x1: number; y1: number; x2: number; y2: number };

// Define the props for ClickableItem
interface ClickableItemProps {
  id: number;
  word: string;
  available_slots_array: boolean[];
  parent_funct: (droppedIndex: number, availability: boolean) => void;
  dropBoxRects: React.MutableRefObject<Rect[]>;
  dropBoxContainerRects: React.MutableRefObject<Rect[]>;
  dropViewRect: React.MutableRefObject<Rect>;
  dragViewRect: Rect;
  answer_arr: React.MutableRefObject<string[]>;
  draggableRects: React.MutableRefObject<Rect[]>;
  totalChoices: number;
  onAllMeasured: (maxWidth: number) => void;
}

const MyClickableItem: React.FC<ClickableItemProps> = ({
  id,
  word,
  available_slots_array,
  parent_funct,
  dropBoxRects,
  dropBoxContainerRects,
  dropViewRect,
  dragViewRect,
  answer_arr,
  draggableRects,
  totalChoices,
  onAllMeasured,
}) => {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const ghostOpacity = useSharedValue(0);

  const [droppedIndex, setDroppedIndex] = useState<number | undefined>(undefined);

  const draggableRect = useRef<Rect>({ x1: 0, y1: 0, x2: 0, y2: 0 });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
    borderWidth: ghostOpacity.value > 0 ? 0 : 1,
    borderColor: ghostOpacity.value > 0 ? 'transparent' : 'gray',
  }));

  const ghostStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    opacity: ghostOpacity.value,
    transform: [
      { translateX: -offsetX.value },
      { translateY: -offsetY.value },
    ],
  }));

  const handleDraggableOnLayout = (event: LayoutChangeEvent) => {
    const { width, x, y, height } = event.nativeEvent.layout;
    if (width === 0 || height === 0) {
      console.warn("Draggable width or height is 0, skipping layout update.");
      return;
    }
    const rect: Rect = { x1: x, y1: y, x2: x + width, y2: y + height };
    draggableRect.current = rect;
    draggableRects.current.push(rect);

    if (draggableRects.current.length === totalChoices) {
      let maxWidth = 0;
      draggableRects.current.forEach((r) => {
        const w = r.x2 - r.x1;
        if (w > maxWidth) maxWidth = w;
      });
      onAllMeasured(maxWidth);
    }
  };

  const handleTapGesture = (_e: any) => {
    console.log("handleTapGesture tapped! word =", word, " id =", id);

    if (droppedIndex !== undefined) {
      offsetX.value = withTiming(0);
      offsetY.value = withTiming(0);
      ghostOpacity.value = withTiming(0);
      setDroppedIndex(undefined);

      const wordIndex = answer_arr.current.findIndex((w) => w === word);
      if (wordIndex !== -1) {
        answer_arr.current.splice(wordIndex, 1);
        console.log("handleTapGesture: answer_arr after removal =", answer_arr.current);
      }
      parent_funct(droppedIndex, true);
      return;
    }

    const available_slot_index = available_slots_array.findIndex((a) => a === true);
    if (!available_slots_array || available_slot_index === -1) return;

    const dropbox_to_container_x1 =
      dropBoxRects.current[available_slot_index].x1 +
      dropBoxContainerRects.current[available_slot_index].x1 +
      dropViewRect.current.x1;

    const drop_box_width =
      dropBoxRects.current[available_slot_index].x2 -
      dropBoxRects.current[available_slot_index].x1;
    const draggable_rect_width = draggableRect.current.x2 - draggableRect.current.x1;
    const total_margin = (drop_box_width - draggable_rect_width) / 2;

    const tempX = dropbox_to_container_x1 - dragViewRect.x1 - draggableRect.current.x1;
    offsetX.value = withTiming(tempX + total_margin);

    const dropbox_to_container_y1 =
      dropBoxRects.current[available_slot_index].y1 +
      dropBoxContainerRects.current[available_slot_index].y1 +
      dropViewRect.current.y1;
    const tempY = dropbox_to_container_y1 - dragViewRect.y1 - draggableRect.current.y1;
    offsetY.value = withTiming(tempY);

    answer_arr.current.push(word);
    console.log("handleTapGesture: answer_arr =", answer_arr.current);

    available_slots_array[available_slot_index] = false;
    ghostOpacity.value = withTiming(0.3);
    setDroppedIndex(available_slot_index);
    parent_funct(available_slot_index, false);
  };

  return (
    <GestureDetector gesture={Gesture.Tap().onStart((e) => runOnJS(handleTapGesture)(e))}>
      <Animated.View
        onLayout={handleDraggableOnLayout}
        style={[styles.clickableItem, animatedStyles]}
      >
        <Animated.View style={ghostStyle} pointerEvents="none">
          <Text style={styles.clickableText}>{word}</Text>
        </Animated.View>
        <Text style={styles.clickableText}>{word}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

export default MyClickableItem;

const styles = StyleSheet.create({
  clickableItem: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: 'lightgray',
    marginVertical: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clickableText: {
    color: 'black',
    fontSize: 16,
  },
});