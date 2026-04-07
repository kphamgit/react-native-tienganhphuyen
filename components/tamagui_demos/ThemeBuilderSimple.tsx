import type { SquareProps, ThemeName } from 'tamagui'
import { getTokens, Square, XStack, YStack } from 'tamagui'

/*
export const Square = styled(
  ThemeableStack,
  {
    name: 'Square',
    alignItems: 'center',
    justifyContent: 'center',

    variants: {
      size: {
        '...size': getShapeSize,
        ':number': getShapeSize,
      },
    } as const,
  },
  {
    memo: true,
  }
)
*/

/*
import { ThemeableStack } from '@tamagui/stacks'
import type { GetProps } from '@tamagui/web'
import { styled } from '@tamagui/web'

import { getShapeSize } from './getShapeSize'

export const Square = styled(
  ThemeableStack,
  {
    name: 'Square',
    alignItems: 'center',
    justifyContent: 'center',

    variants: {
      size: {
        '...size': getShapeSize,
        ':number': getShapeSize,
      },
    } as const,
  },
  {
    memo: true,
  }
)

export type SquareProps = GetProps<typeof Square>
*/

const tokens = getTokens()
console.log('TTTTTTokens:', JSON.stringify(tokens, null, 1))
// <XStack maxH={200} y={-100} x={-50} rotate="-10deg">
export function ThemeBuilderDemoSimple() {
  return (
    <YStack fullscreen overflow="hidden">
      <XStack maxH={200} y={0} x={0}>
        <Col y={35} bg="$color6" subTheme="accent" />
        <Col y={35} bg="$color7"  />
        <Col y={35} bg="$color8"  />
        <Col y={35} bg="$color10"  />
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
        size="$7"
        theme={('green' + subTheme) as ThemeName}
        bg="$background"
        {...props}
      />
     
   
    </YStack>
  )
}