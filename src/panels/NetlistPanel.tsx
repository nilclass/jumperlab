import React, { useContext, useState } from 'react'
import { InteractionContext } from '../interaction'
import { NetlistEntry } from '../jlctlapi'
import { JumperlessStateContext } from '../JumperlessState'
import { randomColor } from '../netlist'
import { NodeRef } from '../NodeRef'
import './NetlistPanel.scss'

export const NetlistPanel: React.FC = () => {
  const { netlist, updateNet, removeNet } = useContext(JumperlessStateContext)
  const { handleNodeClick, highlightedNode, setHighlightedNode, selectedNode, highlightedNet, setHighlightedNet } = useContext(InteractionContext)!
  /* const { netlist } = useContext(ConnectionContext)! */
  /* const [netlist, setNetlist] = useState<Array<NetlistEntry>>(example) */
  const [editing, setEditing] = useState<number | null>(null)
  
  const handleEdit = (index: number) => {
    setEditing(index)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newName = e.currentTarget.value.trim()
    if (newName.length > 0) {
      updateNet(editing!, net => ({ ...net, name: newName }))
    }
    setEditing(null)
  }

  const handleColorChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const color = fixColor(e.currentTarget.value)
    updateNet(index, net => ({ ...net, color }))
  }

  const handleRandomizeColor = (index: number) => {
    const color = randomColor()
    updateNet(index, net => ({ ...net, color }))
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  return (
    <div className='NetlistPanel panel'>
      <div className='header'>
        <div className='title'>Netlist</div>
      </div>
      <div className='content'>
        {netlist && netlist.map(net => (
          <div className={`net ${highlightedNet === net.index ? 'highlight' : ''}`} key={net.index} onMouseEnter={() => setHighlightedNet(net.index)} onMouseLeave={() => setHighlightedNet(null)}>
            <div className='attributes'>
              <div className='index'>#{net.index}</div>
              <div className='name'>
                {editing === net.index ? <input type='text' defaultValue={net.name} onBlur={handleBlur} onKeyPress={handleKeyPress} autoFocus size={net.name.length + 1} />: net.name}
                {!isSpecial(net) && editing !== net.index && <button className='icon' title='Edit' onClick={() => handleEdit(net.index)}>🖉</button>}
              </div>
              <div className='color'>
                <button onClick={() => handleRandomizeColor(net.index)} title="Choose new (random) color for this net">🎲</button>
                <input type="color" value={net.color} onChange={e => handleColorChange(net.index, e)} title="Set color for this net" />
              </div>
            </div>
            <div className='nodes'>
              {net.nodes.map(node => <NodeRef key={node} node={node} selected={selectedNode === node} highlighted={highlightedNode === node} onHover={setHighlightedNode} onClick={handleNodeClick} />)}
            </div>
            {!isSpecial(net) && <button onClick={() => removeNet(net.index)}>Remove</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

function isSpecial(net: NetlistEntry) {
  return net.index <= 7
}

function fixColor(color: string): string {
  const match = color.match(/^rgba\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/)
  if (match) {
    const r = Math.round(parseFloat(match[1]))
    const g = Math.round(parseFloat(match[2]))
    const b = Math.round(parseFloat(match[3]))
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0')
  }
  return color
}

