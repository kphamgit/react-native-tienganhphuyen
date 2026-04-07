import { tamaguiConfig } from './tamagui.config'

export type AppTamaguiConfig = typeof tamaguiConfig

declare module '@tamagui/web' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}
