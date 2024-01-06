import React, { useCallback } from 'react'
import './RadioGroup.scss'

type RadioGroupProps<T> = {
  name: string
  value: T
  options: RadioOptions<T>
  onChange: (value: T) => void
}

export type RadioOption<T> = {
  value: T
  label: React.ReactNode
  title?: string
}

export type RadioOptions<T> = Array<RadioOption<T>>

export function RadioGroup<T extends string>({ name, value, options, onChange }: RadioGroupProps<T>) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value as T)
  }, [onChange])
  return (
    <div className='RadioGroup'>
      {options.map(opt => (
        <label className='option' data-checked={opt.value === value} key={opt.value} title={opt.title || ''}>
          {opt.label}
          <input type='radio' name={name} value={opt.value} checked={opt.value === value} onChange={handleChange} />
        </label>
      ))}
    </div>
  )
}
