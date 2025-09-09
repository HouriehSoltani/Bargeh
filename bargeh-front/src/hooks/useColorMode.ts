import { useTheme } from "next-themes"

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { setTheme } = useTheme()
  // Always return light theme
  const colorMode = "light" as ColorMode
  
  const toggleColorMode = () => {
    // Do nothing - always stay in light mode
    setTheme("light")
  }
  
  return {
    colorMode,
    setColorMode: () => setTheme("light"),
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}
