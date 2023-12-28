import React, { useContext } from 'react'
import { ConnectionContext } from './connection'
import './Sidebar.scss'
import invert from 'invert-color'

const example = [
  {
    "index": 1,
    "name": "GND",
    "number": 1,
    "nodes": ["GND"],
    "bridges": "{0-0}",
    color: '#00ff30'
  },
  {
    "index": 2,
    "name": "+5V",
    "number": 2,
    "nodes": ["5V"],
    "bridges": "{0-0}",
    color: '#ff4114'
  },
  {
    "index": 3,
    "name": "+3.3V",
    "number": 3,
    "nodes": ["3V3"],
    "bridges": "{0-0}",
    color: '#ff1040'
  },
  {
    "index": 4,
    "name": "DAC 0",
    "number": 4,
    "nodes": ["DAC_0"],
    "bridges": "{0-0}",
    color: '#ef787a'
  },
  {
    "index": 5,
    "name": "DAC 1",
    "number": 5,
    "nodes": ["DAC_1"],
    "bridges": "{0-0}",
    color: '#ef407f'
  },
  {
    "index": 6,
    "name": "I Sense +",
    "number": 6,
    "nodes": ["I_POS"],
    "bridges": "{0-0}",
    color: '#ffffff'
  },
  {
    "index": 7,
    "name": "I Sense -",
    "number": 7,
    "nodes": ["I_NEG"],
    "bridges": "{0-0}",
    color: '#ffffff'
  }
]

export const Sidebar: React.FC = () => {
  /* const { netlist } = useContext(ConnectionContext)! */
  const netlist = example
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    alert('TODO: make net editable (set name, color)')
  }
  return (
    <div className='Sidebar'>
      <div className='panel'>
        <div className='header'>
          <div className='title'>Netlist</div>
        </div>
        <div className='content'>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Nodes</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {netlist ? netlist.map(net => (
                <tr key={net.index}>
                  <td className='index'>{net.index}</td>
                  <td className='name'>
                    {net.name}
                    <button className='pencil' title='Edit'>🖉</button>
                  </td>
                  <td className='nodes'>{net.nodes.join(', ')}</td>
                  <td className='color'><input type="color" value={net.color} /></td>
                </tr>
              )) : <tr><td colSpan={2}><em>Loading...</em></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
