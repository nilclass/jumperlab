import React from 'react'
import { BoardViewModeSelect } from './BoardView'
import { ConnectionWidget } from './connection'
import './Toolbar.css'

export const Toolbar: React.FC = () => {
  return (
    <div className='Toolbar'>
      <div className='logo'>
        <img src='/images/logo.svg' />
        <h1>Jumperlab</h1>
      </div>
      <BoardViewModeSelect />
      <ConnectionWidget pollIntervalMs={2000} />      
    </div>
  )
}
