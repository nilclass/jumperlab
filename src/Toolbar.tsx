import React, { useContext } from 'react'
import { BoardViewModeSelect } from './BoardView'
import { useOpenDialog } from './dialogs'
import { SettingsDialog } from './Settings'
import './Toolbar.css'
import { InteractionContext } from './interaction'
import { RadioGroup } from './components/RadioGroup'
import { imagePath } from './utils'
import { ChipStatusDialog } from './ChipStatus'

const buildInfo = process.env.REACT_APP_BUILD_INFO

export const Toolbar: React.FC = () => {
  const { mode, handleSetMode } = useContext(InteractionContext)!
  const openDialog = useOpenDialog()

  return (
    <div className='Toolbar'>
      <div className='logo'>
        <img src={imagePath('logo.svg')} alt='Jumperlab logo' />
        <h1>Jumperlab</h1>
      </div>
      <div>
        <RadioGroup options={[
          { value: 'select', label: 'Select [s]' },
          { value: 'connect', label: 'Connect [c]' },
          { value: 'disconnect', label: 'Disconnect [d]' },
        ]} name='interactionMode' value={mode} onChange={handleSetMode} />
      </div>
      <BoardViewModeSelect />
      {buildInfo && <div className='build-info'><strong>Build: </strong><code>{buildInfo}</code></div>}
      <button onClick={(e) => openDialog(<ChipStatusDialog />, e)}>
        Chip Status
      </button>
      <button className='with-icon' onClick={(e) => openDialog(<SettingsDialog />, e)}>
        <div className='icon'>⚙</div>
        Settings
      </button>
    </div>
  )
}
