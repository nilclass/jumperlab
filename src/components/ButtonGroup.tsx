import React from 'react'
import './ButtonGroup.scss'

export const ButtonGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='ButtonGroup'>{children}</div>
)
