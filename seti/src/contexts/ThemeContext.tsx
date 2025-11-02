import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: Theme // Same as theme since we only have light/dark
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to 'dark'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('seti-theme')
      return (saved as Theme) || 'dark'
    }
    return 'dark'
  })

  const actualTheme = theme // No need for separate actualTheme since we only have light/dark

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    
    // Save to localStorage immediately
    localStorage.setItem('seti-theme', newTheme)
    
    // Try to update user preferences if available (but don't fail if not)
    try {
      // This will be handled by components that use both theme and user preferences
      const event = new CustomEvent('theme-changed', { detail: { theme: newTheme } })
      window.dispatchEvent(event)
    } catch (error) {
      // Ignore errors - theme still works locally
    }
  }

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark')
    
    // Apply the theme directly
    root.classList.add(theme)
    
    // Save to localStorage
    localStorage.setItem('seti-theme', theme)
  }, [theme])

  const value = {
    theme,
    setTheme: handleSetTheme,
    actualTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
