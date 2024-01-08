import React, { useState, useContext, useEffect, useCallback, useRef, useLayoutEffect, useMemo } from 'react'
import { ModalDialog } from './dialogs'

type SettingsMap = { [key: string]: any }

type SettingsContextType = {
  settings: SettingsMap
  setValue: (key: string, value: any) => void
  replace: (settings: SettingsMap) => void
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
    <SettingsContext.Provider value={{ settings, setValue, replace: setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

type ValueParam<T> = T | ((old: T) => T)

export function useSetting<T>(key: string, defaultValue: T): [T, (value: ValueParam<T>) => void] {
  const { settings, setValue } = useContext(SettingsContext)!
  const settingsRef = useRef<SettingsMap>(settings)

  useEffect(() => {
    settingsRef.current = settings
  })

  const setter = useCallback(
    (value: ValueParam<T>) => {
      if (typeof value === 'function') {
        const currentValue = key in settingsRef.current ? settingsRef.current[key] : defaultValue
        setValue(key, (value as (old: T) => T)(currentValue))
      } else {
        setValue(key, value)
      }
    }, [setValue, key],
  )

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

export const SettingsDialog: React.FC = () => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const { settings, replace } = useContext(SettingsContext)!
  const formattedSettings = useMemo(() => JSON.stringify(settings, null, 2), [settings])

  function handleSave() {
    const source = ref.current!.value
    let value
    try {
      value = JSON.parse(source)
    } catch(e) {
      alert(`Error parsing source: ${(e as any).message}`)
      return
    }

    if (typeof value !== 'object' || value === null) {
      alert('Settings must be an object')
      return
    }

    replace(value as SettingsMap)
  }

  function handleReset() {
    ref.current!.value = formattedSettings
  }

  function handleClear() {
    if (confirm('Are you sure you want to reset the app to factory defaults?')) { // eslint-disable-line no-restricted-globals
      replace({})
      ref.current!.value = '{}'
    }
  }

  return (
    <ModalDialog>
      <h3>Settings</h3>
      <p>
        Settings contain the state of various UI elements. They are persisted in <code>localStorage</code> to survive a reload.
        <br/>
        Here you can edit them directly:
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <textarea defaultValue={formattedSettings} rows={30} cols={80} ref={ref} style={{ flexGrow: 1 }} />
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <button onClick={handleSave} className='with-icon'>
            Save changes
            <div className='icon'>🖫</div>
          </button>
          <button onClick={handleReset} className='with-icon'>
            Reset to saved version
            <div className='icon'>⮪</div>
          </button>
          <button onClick={handleClear} className='with-icon'>
            Clear (reset to defaults)
            <div className='icon'>⎚</div>
          </button>
        </div>
      </div>
      <p><strong>TIP: </strong><em>if you break something and the app no longer works, run <code>localStorage.clear()</code> in the browser console and reload the page.</em></p>
    </ModalDialog>
  )
}
