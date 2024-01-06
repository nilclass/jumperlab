import React, { useCallback, useContext, useState } from 'react'
import { InteractionContext } from '../interaction'
import { JumperlessNode, NetlistEntry } from '../jlctlapi'
import { JumperlessStateContext } from '../JumperlessState'
import './NetlistPanel.scss'

export const NetlistPanel: React.FC = () => {
  const { netlist, updateNet, addNet, removeNet } = useContext(JumperlessStateContext)
  const { handleNodeClick, highlightedNode, setHighlightedNode, highlightedNet, setHighlightedNet } = useContext(InteractionContext)!
  /* const { netlist } = useContext(ConnectionContext)! */
  /* const [netlist, setNetlist] = useState<Array<NetlistEntry>>(example) */
  const [editing, setEditing] = useState<number | null>(null)
  
  const handleEdit = (index: number) => {
    setEditing(index)
  }

  const handleAdd = () => {
    setEditing(addNet())
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newName = e.currentTarget.value.trim()
    if (newName.length > 0) {
      updateNet(editing!, net => ({ ...net, name: newName }))
    }
    setEditing(null)
  }

  const handleColorChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    updateNet(index, net => ({ ...net, color: e.currentTarget.value }))
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
              <div className='color'><input type="color" value={net.color} onChange={e => handleColorChange(net.index, e)} /></div>
            </div>
            <div className='nodes'>
              {net.nodes.map(node => <NodeRef key={node} node={node} highlighted={highlightedNode === node} onHover={setHighlightedNode} onClick={handleNodeClick} />)}
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

type NodeRefProps = {
  node: JumperlessNode
  highlighted?: boolean
  onHover: (node: JumperlessNode | null) => void
  onClick: (node: JumperlessNode) => void
}

const NodeRef: React.FC<NodeRefProps> = ({ node, highlighted, onHover, onClick }) => {
  const handleEnter = useCallback(() => onHover(node), [onHover, node])
  const handleLeave = useCallback(() => onHover(null), [onHover])
  const handleClick = useCallback(() => onClick(node), [onClick])
  return (
    <button className={`NodeRef ${highlighted ? 'highlight' : ''}`} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onClick={handleClick}>
      {node}
    </button>
  )
}
