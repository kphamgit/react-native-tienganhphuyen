import { AudioPlayer, AudioSource, createAudioPlayer } from 'expo-audio';
import React, { memo, type ReactElement, useCallback, useEffect, useState } from 'react';
import { StyleSheet, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { calculateLayout, lastOrder, type Offset, remove, useVector } from "./Layout";
import type { DuoAnimatedStyleWorklet, DuoWordAnimatedStyle, OnDropFunction } from "./types";

export interface ClickableWordProps {
  animatedStyleWorklet?: DuoAnimatedStyleWorklet;
  onDrop?: OnDropFunction;
  offsets: Offset[];
  children: ReactElement<{ id: number }>;
  index: number;
  containerWidth: number;
  gesturesDisabled: boolean;
  rtl: boolean;
  linesHeight: number;
  wordHeight: number;
  wordGap: number;
  wordBankOffsetY: number;
  lineGap: number;
  parentFunc: () => void;
}

const ClickableWord = ({
  animatedStyleWorklet,
  offsets,
  index,
  children,
  containerWidth,
  gesturesDisabled,
  rtl,
  linesHeight,
  wordHeight,
  wordGap,
  wordBankOffsetY,
  lineGap,
  onDrop,
  parentFunc,
}: ClickableWordProps) => {
  const offset = offsets[index];
  const isAnimating = useSharedValue(false);
  const translation = useVector();
  const isInBank = useDerivedValue(() => offset.order.value === -1);

  const [mp3, setMp3] = useState<string>('');
  const [player, setPlayer] = useState<AudioPlayer>();

  const emitOnDrop = useCallback(() => {
    onDrop?.({
      index,
      destination: offset.order.value === -1 ? "bank" : "answered",
      position: offset.order.value,
    });
  }, [index, offset, onDrop]);

  const translateX = useDerivedValue(() =>
    withTiming(
      isInBank.value ? offset.originalX.value : offset.x.value,
      { duration: 250 },
      () => (isAnimating.value = false),
    )
  );

  const translateY = useDerivedValue(() =>
    withTiming(
      isInBank.value ? offset.originalY.value + wordBankOffsetY : offset.y.value,
      { duration: 250 },
      () => (isAnimating.value = false),
    )
  );

  const style = useAnimatedStyle(() => {
    const style: DuoWordAnimatedStyle & ViewStyle = {
      position: "absolute",
      top: 0,
      left: -1,
      zIndex: isAnimating.value ? 100 : Math.max(1, offset.order.value),
      width: offset.width.value + 2,
      height: wordHeight,
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    };
    return (animatedStyleWorklet?.(style, false) || style) as ViewStyle;
  });

  const ghostStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    left: -1,
    width: offset.width.value + 2,
    height: wordHeight,
    opacity: isInBank.value ? 0 : 0.3,
    transform: [
      { translateX: offset.originalX.value },
      { translateY: offset.originalY.value + wordBankOffsetY },
    ],
  }));

  useEffect(() => {
    const word = children.key?.split('-')[0];
    const my_mp3 = `https://kphamazureblobstore.blob.core.windows.net/tts-audio/${word}.mp3`;
    setMp3(my_mp3);
    setPlayer(createAudioPlayer(my_mp3));
  }, [children]);

  const playAudio = () => {
    const mySrc: AudioSource = { uri: mp3 };
    player?.replace(mySrc);
    player?.play();
    player?.remove();
  };

  const tapGesture = Gesture.Tap().onStart(() => {
    runOnJS(playAudio)();
    runOnJS(parentFunc)();

    if (isInBank.value) {
      offset.order.value = lastOrder(offsets);
    } else {
      offset.order.value = -1;
      remove(offsets, index);
    }

    isAnimating.value = true;
    calculateLayout(offsets, containerWidth, wordHeight, wordGap, lineGap, rtl);
    translation.x.value = offset.x.value;
    translation.y.value = offset.y.value;

    runOnJS(emitOnDrop)();
  });

  return (
    <>
      {/* Ghost: stays at bank position, dimmed when word has moved to answer area */}
      <Animated.View style={ghostStyle} pointerEvents="none">
        <Animated.View style={StyleSheet.absoluteFill}>{children}</Animated.View>
      </Animated.View>

      {/* Animated chip: moves between bank and answer area */}
      <Animated.View style={style}>
        {gesturesDisabled ? (
          <Animated.View style={StyleSheet.absoluteFill}>{children}</Animated.View>
        ) : (
          <GestureDetector gesture={tapGesture}>
            <Animated.View style={StyleSheet.absoluteFill}>{children}</Animated.View>
          </GestureDetector>
        )}
      </Animated.View>
    </>
  );
};

export default memo(ClickableWord);
