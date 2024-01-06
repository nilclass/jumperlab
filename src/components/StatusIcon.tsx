import React from 'react'
import './StatusIcon.scss'

type StatusIconProps = {
  ok: boolean
  src: string
  title: string
}

export const StatusIcon: React.FC<StatusIconProps> = ({ ok, src, title }) => {
  return (
    <img className={`StatusIcon ${ok ? 'ok' : ''}`} src={src} title={`${title}: ${ok ? 'Yes' : 'No'}`} />
  )
}
