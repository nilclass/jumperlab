import React, { useContext, useState, useEffect } from 'react'
import { ConnectionContext } from './connection'
import { ModalDialog } from './dialogs'
import { ChipStatus } from './jlctlapi'
import './ChipStatus.scss'

type ChipStatusProps = {
  chips: Array<ChipStatus>
}

const ChipStatusTable: React.FC<ChipStatusProps> = ({ chips }) => {
  return (
    <table className='ChipStatusTable'>
      <thead>
        <tr>
          <th>Chip</th>
          <th colSpan={16}>X Status</th>
          <th colSpan={8}>Y Status</th>
        </tr>
      </thead>
      <tbody>
        {chips.map(({ char, xStatus, yStatus }) => (
          <tr key={char}>
            <th>{char}</th>
            {xStatus.map((x, i) => <td key={i}>{x}</td>)}
            {yStatus.map((y, i) => <td key={i}>{y}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export const ChipStatusDialog: React.FC = () => {
  const [chips, setChips] = useState<Array<ChipStatus> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { reachable, jlctl } = useContext(ConnectionContext)!

  useEffect(() => {
    if (!reachable) {
      setError("Not connected")
      return
    }

    jlctl!.getChipStatus().then(setChips).catch(setError)
  }, [])

  return (
    <ModalDialog>
      <h3>Chip Status</h3>

      {error ? <div style={{ color: 'red' }}>{error.toString()}</div> : chips ? <ChipStatusTable chips={chips} /> : '...'}
    </ModalDialog>
  )
}
