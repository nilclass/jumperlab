import React, { useContext } from 'react'
import { BoardViewModeSelect } from './BoardView'
import { useOpenDialog } from './dialogs'
import { SettingsDialog } from './Settings'
import './Toolbar.css'
import { InteractionContext } from './interaction'

export const Toolbar: React.FC = () => {
  const { mode } = useContext(InteractionContext)!
  const openDialog = useOpenDialog()

  return (
    <div className='Toolbar'>
      <div className='logo'>
        <img src='/images/logo.svg' />
        <h1>Jumperlab</h1>
      </div>
      <div>
        <strong>Mode: </strong>
        <code>{mode}</code>
      </div>
      <BoardViewModeSelect />
      <button className='with-icon' onClick={(e) => openDialog(<SettingsDialog />, e)}>
        <div className='icon'>⚙</div>
        Settings
      </button>
    </div>
  )
}
