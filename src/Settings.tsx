import React, { useState, useContext, useEffect, useCallback } from 'react'

type SettingsMap = { [key: string]: any }

type SettingsContextType = {
  settings: SettingsMap
  setValue: (key: string, value: any) => void
}

export const SettingsContext = React.createContext<SettingsContextType | null>(null)

export const SettingsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsMap>({})
  const setValue = useCallback((key: string, value: any) => {
    setSettings((current: SettingsMap) => {
      const updated = { ...current, [key]: value }
      saveSettings(updated)
      return updated
    })
  }, [setSettings])

  useEffect(() => {
    const loaded = loadSettings()
    if (loaded) {
      setSettings(loaded)
    }
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, setValue }}>
      {children}
    </SettingsContext.Provider>
  )
}


export function useSetting<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const { settings, setValue } = useContext(SettingsContext)!
  const setter = useCallback((value: T) => setValue(key, value), [setValue, key])

  return [
    key in settings ? settings[key] : defaultValue,
    setter
  ]
}

function loadSettings(): SettingsMap | null {
  try {
    return JSON.parse(localStorage.jumperlabSettings)
  } catch(e) {
    return null
  }
}

function saveSettings(settings: SettingsMap) {
  localStorage.jumperlabSettings = JSON.stringify(settings)
}
