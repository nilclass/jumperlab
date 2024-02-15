import React from 'react'
import { JumperlessNode } from './jlctlapi'
import { Mode } from './interaction'
import './NodeDetails.css'

type NodeDetailsProps = {
  node: JumperlessNode | null
  mode: Mode
  onSetMode: (mode: Mode) => void
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, mode, onSetMode }) => {
  return (
    <div className={`NodeDetails ${node === null ? 'hidden' : ''}`}>
      {node && (
        <>
          Node: {node}
          <br />
          {mode === 'select' ?
          <button onClick={() => onSetMode('connect')}>Connect</button>
          : <button onClick={() => onSetMode('select')}>Cancel</button>}
        </>
      )}
    </div>
  )
}
