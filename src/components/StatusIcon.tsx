import React from 'react'
import './StatusIcon.scss'

type StatusIconProps = {
  ok: boolean
  src: string
  title: string
}

export const StatusIcon: React.FC<StatusIconProps> = ({ ok, src, title }) => {
  const alt = `Status Icon for ${title}: ${ok ? 'Yes' : 'No'}`
  return (
    <img className={`StatusIcon ${ok ? 'ok' : ''}`} src={src} title={`${title}: ${ok ? 'Yes' : 'No'}`} alt={alt} />
  )
}
