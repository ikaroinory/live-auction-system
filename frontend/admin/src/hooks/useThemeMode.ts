import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

export const useThemeMode = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // 优先检查本地存储
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode
    if (savedMode) {
      return savedMode
    }
    // 否则与系统主题同步
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    const body = document.body
    if (mode === 'dark') {
      body.setAttribute('theme-mode', 'dark')
    } else {
      body.removeAttribute('theme-mode')
    }
    localStorage.setItem('theme-mode', mode)
  }, [mode])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode
      if (!savedMode) {
        setMode(e.matches ? 'dark' : 'light')
      }
    }

    mql.addEventListener('change', handleSystemThemeChange)
    return () => mql.removeEventListener('change', handleSystemThemeChange)
  }, [])

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { mode, toggleMode }
}
