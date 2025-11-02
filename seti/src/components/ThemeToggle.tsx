import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

export function ThemeToggle() {
  const { actualTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex items-center">
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[hsl(208,65%,75%)] focus:ring-offset-2 bg-[hsl(208,65%,75%)]"
        role="switch"
        aria-checked={actualTheme === 'dark'}
        aria-label="Toggle theme"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
            actualTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        >
          {actualTheme === 'dark' ? (
            <Moon className="h-3 w-3 text-gray-600 m-0.5" />
          ) : (
            <Sun className="h-3 w-3 text-yellow-500 m-0.5" />
          )}
        </span>
      </button>
    </div>
  )
}