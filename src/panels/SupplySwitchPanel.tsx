import React, { useContext } from 'react'
import { RadioGroup, RadioOptions } from '../components/RadioGroup'
import { SupplySwitchPos } from '../jlctlapi'
import { JumperlessStateContext } from '../JumperlessState'

const OPTIONS: RadioOptions<SupplySwitchPos> = [
  {
    value: '3.3V',
    label: '+3.3V',
  },
  {
    value: '5V',
    label: '+5V',
  },
  {
    value: '8V',
    label: '±8V',
  },
]

export const SupplySwitchPanel: React.FC = () => {
  const { supplySwitchPos, setSupplySwitchPos } = useContext(JumperlessStateContext)
  return (
    <div className='SupplySwitchPanel panel'>
      <div className='header'>
        <div className='title'>Supply Switch</div>
      </div>
      <div className='content'>
        <RadioGroup
          name='supplySwitchPos'
          value={supplySwitchPos}
          options={OPTIONS}
          onChange={setSupplySwitchPos}
        />
      </div>
    </div>
  )
}
