import type { SquareProps, ThemeName } from 'tamagui'
import { getTokens, Square, XStack, YStack } from 'tamagui'

const tokens = getTokens()
console.log('TTTTTTokens:', JSON.stringify(tokens, null, 1))
// <XStack maxH={200} y={-100} x={-50} rotate="-10deg">
export function ThemeBuilderDemo() {
  return (
    <YStack fullscreen overflow="hidden">
      <XStack maxH={200} y={0} x={0}>
        <Col y={35} bg="$color9" />
        <Col size="$8" y={30} bg="$color7" />
        <Col size="$6" y={-50} bg="$color5" />
        <Col size="$4" bg="$color3" />
        <Col size="$2" bg="$color1" />
        <Col size="$4" y={50} bg="$color3" />
        <Col size="$6" y={80} bg="$color5" />
        <Col size="$8" bg="$color7" />
        <Col bg="$color9" />
        <Col size="$8" bg="$color7" />
        <Col size="$6" y={80} bg="$color5" />
        <Col size="$4" y={50} bg="$color3" />
        <Col size="$2" bg="$color1" />
        <Col size="$4" bg="$color3" />
        <Col size="$6" y={-50} bg="$color5" />
        <Col size="$8" y={30} bg="$color7" />
        <Col y={35} bg="$color9" />
      </XStack>
    </YStack>
  )
}

function Col(
  props: SquareProps & {
    subTheme?: any
  }
) {
  const subTheme = props.subTheme ? `_${props.subTheme}` : ''
  
  return (
    <YStack p="$2.5" gap="$3.5">
      <Square
        rounded="$6"
        size="$10"
        theme={props.subTheme}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('orange') as ThemeName}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('yellow' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('green' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('blue' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('purple' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('pink' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('red' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={props.subTheme}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('orange' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('yellow' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
      <Square
        rounded="$6"
        size="$10"
        theme={('green' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
    </YStack>
  )
}