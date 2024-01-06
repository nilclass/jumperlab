import React, { useContext, useState } from 'react'
import { JumperlessNode, NetlistEntry } from '../jlctlapi'
import { JumperlessStateContext } from '../JumperlessState'
import './NetlistPanel.scss'

export const NetlistPanel: React.FC = () => {
  const { netlist, updateNet, addNet, removeNet } = useContext(JumperlessStateContext)
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
          <button onClick={handleAdd}>Add net</button>
        </div>
        <div className='content'>

          {netlist && netlist.map(net => (
            <div className='net' key={net.index}>
              <div className='attributes'>
                <div className='index'>#{net.index}</div>
                <div className='name'>
                  {editing === net.index ? <input type='text' defaultValue={net.name} onBlur={handleBlur} onKeyPress={handleKeyPress} autoFocus size={net.name.length + 1} />: net.name}
                  {!isSpecial(net) && editing !== net.index && <button className='icon' title='Edit' onClick={() => handleEdit(net.index)}>🖉</button>}
                </div>
                <div className='color'><input type="color" value={net.color} onChange={e => handleColorChange(net.index, e)} /></div>
              </div>
              <div className='nodes'>
                {net.nodes.map(node => <NodeRef key={node} node={node} />)}
                <button>Add node</button>
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

const NodeRef: React.FC<{ node: JumperlessNode }> = ({ node }) => {
  return (
    <button className='NodeRef' onClick={() => {/* TODO: set selected node */}}>
      {node}
    </button>
  )
}
