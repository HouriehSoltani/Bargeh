"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ThemeProvider } from "next-themes"

interface ProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  forcedTheme?: string
  [key: string]: any
}

export function Provider({ children, defaultTheme, forcedTheme, ...props }: ProviderProps) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <ChakraProvider value={defaultSystem}>
        {children}
      </ChakraProvider>
    </ThemeProvider>
  )
}
