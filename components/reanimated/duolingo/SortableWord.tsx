import { AudioPlayer, AudioSource, createAudioPlayer } from 'expo-audio';
import { memo, type ReactElement, useCallback, useEffect, useState } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { between, calculateLayout, lastOrder, type Offset, remove, reorder, useVector } from "./Layout";
import type { DuoAnimatedStyleWorklet, DuoWordAnimatedStyle, OnDropFunction } from "./types";

export interface SortableWordProps {
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
  parentFunc: () => void; // Function to enable the Check button
}

const SortableWord = ({
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
  parentFunc, // Function to enable the Check button
}: SortableWordProps) => {
  const offset = offsets[index];
  const isGestureActive = useSharedValue(false);
  const isAnimating = useSharedValue(false);
  const translation = useVector();
  const isInBank = useDerivedValue(() => offset.order.value === -1);
  const ctxX = useSharedValue(0);
  const ctxY = useSharedValue(0);
  const panOrderHasChanged = useSharedValue(false);

  //const mp3 = "https://kphamazureblobstore.blob.core.windows.net/tts-audio/two.mp3"
  const [mp3, setMp3] = useState<string>('');
  const [player, setPlayer] = useState<AudioPlayer>();

  const emitOnDrop = useCallback(() => {
    onDrop?.({
      index,
      destination: offset.order.value === -1 ? "bank" : "answered",
      position: offset.order.value,
    });
  }, [index, offset, onDrop]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      
      //console.log(" .......... SortableWord: panGesture.onStart");
      if (isAnimating.value) {
        return;
      }
      panOrderHasChanged.value = false;

      if (isInBank.value) {
        translation.x.value = offset.originalX.value;
        translation.y.value = offset.originalY.value + wordBankOffsetY;
      } else {
        translation.x.value = offset.x.value;
        translation.y.value = offset.y.value;
      }

      ctxX.value = translation.x.value;
      ctxY.value = translation.y.value;
    })
    .onChange(({ translationX, translationY }) => {
      isGestureActive.value = true;
      translation.x.value = ctxX.value + translationX;
      translation.y.value = ctxY.value + translationY;

      if (isInBank.value && translation.y.value < linesHeight) {
        offset.order.value = lastOrder(offsets);
        calculateLayout(offsets, containerWidth, wordHeight, wordGap, lineGap, rtl);
        panOrderHasChanged.value = true;
      } else if (!isInBank.value && translation.y.value > linesHeight - wordHeight / 2) {
        offset.order.value = -1;
        remove(offsets, index);
        calculateLayout(offsets, containerWidth, wordHeight, wordGap, lineGap, rtl);
        panOrderHasChanged.value = true;
      }

      for (let i = 0; i < offsets.length; i++) {
        const o = offsets[i];
        if (i === index && o.order.value !== -1) {
          continue;
        }
        const isItemInBank = o.order.value === -1;
        const x = isItemInBank ? o.originalX.value : o.x.value;
        const y = isItemInBank ? o.originalY.value + wordBankOffsetY : o.y.value;
        if (
          between(translation.x.value, x, x + o.width.value, false) &&
          between(translation.y.value, y, y + wordHeight) && // NOTE: check y value when interacting with bottom
          offset.order.value !== o.order.value
        ) {
          reorder(offsets, offset.order.value, o.order.value);
          calculateLayout(offsets, containerWidth, wordHeight, wordGap, lineGap, rtl);
          panOrderHasChanged.value = true;
          break;
        }
      }
    })
    .onEnd(() => {
      //console.log(" ......... SortableWord: panGesture.onEnd");
      isAnimating.value = true;
      translation.x.value = offset.x.value;
      translation.y.value = offset.y.value;
      isGestureActive.value = false;
      if (panOrderHasChanged.value) {
        runOnJS(emitOnDrop)();
      }
      panOrderHasChanged.value = false;
    });

  const translateX = useDerivedValue(() => {
    if (isGestureActive.value) {
      return translation.x.value;
    }
    return withTiming(
      isInBank.value ? offset.originalX.value : offset.x.value,
      { duration: 250 },
      () => (isAnimating.value = false),
    );
  });

  const translateY = useDerivedValue(() => {
    if (isGestureActive.value) {
      return translation.y.value;
    }

    return withTiming(
      isInBank.value ? offset.originalY.value + wordBankOffsetY : offset.y.value,
      { duration: 250 },
      () => (isAnimating.value = false),
    );
  });

  const style = useAnimatedStyle(() => {
    const style: DuoWordAnimatedStyle & ViewStyle = {
      position: "absolute",
      top: 0,
      left: -1,
      zIndex: isGestureActive.value || isAnimating.value ? 100 : Math.max(1, offset.order.value),
      width: offset.width.value + 2,
      height: wordHeight,
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    };
    return (animatedStyleWorklet?.(style, isGestureActive.value) || style) as ViewStyle;
  });

  useEffect(() => {
    //console.log('SortableWord mounted children =', children.key);
    const word = children.key?.split('-')[0]; // extract the word from children.key
    //console.log('SortableWord mounted index =', index);
    const my_mp3 = `https://kphamazureblobstore.blob.core.windows.net/tts-audio/${word}.mp3`
    //console.log('SortableWord mounted my_mp3 =', my_mp3);
    setMp3(my_mp3);
    setPlayer(createAudioPlayer(my_mp3));
  }
    , [children]);
  /*
  useEffect(() => {
      async function sendRequest() {
        
        try {
          //const domain = 'https://kphamenglish-f26e8b4d6e4b.herokuapp.com';
          const domain = 'http://localhost:5001'
          const url = `${domain}/api/tts/text_to_speech_azure`;//text_to_speech_azure
          console.log('MyAudioPlayer: Sending request to URL:', url);
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: "testing"
            }),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
    
          // Reuse a single temporary file
          const fileUri = `${FileSystem.cacheDirectory}audio-temp.mp3`;
          await FileSystem.writeAsStringAsync(fileUri, data.audioContent, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setAudioSrc(fileUri);
        } catch (error: any) {
          console.error('Error:', error.message);
        }
      }
    
      sendRequest();
    }, []);
*/
    //'http://localhost:5001';
    //const player = createAudioPlayer();
    const playAudio = () => {
       //const mySrc: AudioSource = { uri: audioSrc };
       //console.log('SortableWord: playAudio called, mp3=', mp3);
     // console.log('SortableWord: playAudio called, children key=', children.key);
      //four-0, five-2....
      // extract the word from children.key

       const mySrc: AudioSource = { uri: mp3 };
          //console.log('XXXXXXX Audio Source:', mySrc);
          player?.replace(mySrc);
           /* END do this to make player play the audio on every click */
          player?.play();
          player?.remove()
    }

    //async function playFromBlob(blobUrl: string) {
    //  const { sound } = await Audio.Sound.createAsync({ uri: blobUrl });
    //  await sound.playAsync();
   // }
  //domain = 'https://kphamenglish-f26e8b4d6e4b.herokuapp.com';
  //const mp3 = 'https://commondatastorage.googleapis.com/codeskulptor-assets/week7-bounce.m4a'
  //const mp3 = https://<account>.blob.core.windows.net/tts-audio/tts_test.mp3

  const tapGesture = Gesture.Tap().onStart(() => {
    //console.log(" tapGesture start....index ", index);
   // console.log(" tapGesture start....children ", children.key);
    // play audio
    
    //console.log("SortableWord: tapGesture: calling playAudio");
    runOnJS(playAudio)();
    //runOnJS(playAudio)('https://kphamenglish-f26e8b4d6e4b.herokuapp.com');
    // call parent function to enable the Check button
    runOnJS(parentFunc)();
    // right here, you can enable the check button in ButtonSection
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
    <Animated.View style={style}>
      {gesturesDisabled ? (
        <Animated.View style={StyleSheet.absoluteFill}>{children}</Animated.View>
      ) : (
        <GestureDetector gesture={Gesture.Race(tapGesture, panGesture)}>
          <Animated.View style={StyleSheet.absoluteFill}>{children}</Animated.View>
        </GestureDetector>
      )}
    </Animated.View>
  );
};

export default memo(SortableWord);