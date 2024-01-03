import React from 'react'
import { BoardViewModeSelect } from './BoardView'
import { ConnectionWidget } from './connection'
import { useOpenDialog } from './dialogs'
import { SettingsDialog } from './Settings'
import { Mode } from './App'
import './Toolbar.css'

export const Toolbar: React.FC<{ mode: Mode }> = ({ mode }) => {
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
      <ConnectionWidget pollIntervalMs={2000} />
      <button className='with-icon' onClick={(e) => openDialog(<SettingsDialog />, e)}>
        <div className='icon'>⚙</div>
        Settings
      </button>
    </div>
  )
}
