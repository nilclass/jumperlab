import React from 'react'
import { ConnectionWidget } from './connection'
import './Toolbar.css'

export const Toolbar: React.FC = () => {
  return (
    <div className='Toolbar'>
      <img src='/images/logo.svg' />
      <ConnectionWidget pollIntervalMs={2000} />      
    </div>
  )
}
