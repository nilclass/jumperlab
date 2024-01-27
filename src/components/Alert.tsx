import React from 'react'
import './Alert.scss'

type AlertProps = {
  kind: 'warning' | 'error'
  children: React.ReactNode,
}

export const Alert: React.FC<AlertProps> = ({ kind, children }) => {
  return (
    <div className={`Alert ${kind}`}>{children}</div>
  )
}
