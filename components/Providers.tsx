"use client"

import * as React from "react"
import { TooltipProvider } from "#/components/ui/tooltip"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
    </NextThemesProvider>
  )
}
