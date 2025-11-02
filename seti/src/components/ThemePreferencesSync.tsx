import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useUserPreferences } from '@/hooks/useUserPreferences'

export function ThemePreferencesSync() {
  const { theme, setTheme } = useTheme()
  const { preferences, updateTheme } = useUserPreferences()

  // Sync theme changes to user preferences
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      const newTheme = event.detail.theme
      if (preferences.theme_preference !== newTheme) {
        updateTheme(newTheme).catch(console.error)
      }
    }

    window.addEventListener('theme-changed', handleThemeChange as EventListener)
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange as EventListener)
    }
  }, [preferences.theme_preference, updateTheme])

  // Sync user preferences to theme (only if it's light or dark)
  useEffect(() => {
    if (!preferences.theme_preference) return

    if (preferences.theme_preference === 'light' || preferences.theme_preference === 'dark') {
      if (preferences.theme_preference !== theme) {
        setTheme(preferences.theme_preference)
      }
      return
    }

    // Handle 'system' preference: align with OS scheme and listen for changes
    if (preferences.theme_preference === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const apply = () => setTheme(media.matches ? 'dark' : 'light')
      apply()
      // Listen to OS theme changes
      try {
        media.addEventListener('change', apply)
        return () => media.removeEventListener('change', apply)
      } catch {
        // Safari fallback
        media.addListener(apply)
        return () => media.removeListener(apply)
      }
    }
  }, [preferences.theme_preference, setTheme, theme])

  return null // This component doesn't render anything
}
