import React, { useContext } from 'react'
import { BoardViewModeSelect } from './BoardView'
import { useOpenDialog } from './dialogs'
import { SettingsDialog } from './Settings'
import './Toolbar.css'
import { InteractionContext } from './interaction'
import { RadioGroup } from './components/RadioGroup'
import { imagePath } from './utils'
import { ChipStatusDialog } from './ChipStatus'
import { HistoryDialog } from './history'
import { JumperlessStateContext } from './JumperlessState'
import { ButtonGroup } from './components/ButtonGroup'

const buildInfo = process.env.REACT_APP_BUILD_INFO

export const Toolbar: React.FC = () => {
  const { mode, handleSetMode } = useContext(InteractionContext)!
  const { history, undo, redo } = useContext(JumperlessStateContext)
  const openDialog = useOpenDialog()

  return (
    <div className='Toolbar'>
      <div className='logo'>
        <img src={imagePath('logo.svg')} alt='Jumperlab logo' />
        <h1>Jumperlab</h1>
      </div>
      <div>
        <ButtonGroup>
          <button disabled={!history.canUndo} onClick={undo}>Undo [u]</button>
          <button disabled={!history.canRedo} onClick={redo}>Redo</button>
          <button onClick={(e) => openDialog(<HistoryDialog />, e)}>History</button>
        </ButtonGroup>
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
