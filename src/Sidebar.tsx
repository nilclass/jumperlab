import React from 'react'
import { ConnectionPanel } from './panels/ConnectionPanel'
import { NetlistPanel } from './panels/NetlistPanel'
import { SupplySwitchPanel } from './panels/SupplySwitchPanel'
import './Sidebar.scss'

export const Sidebar: React.FC = () => {
  return (
    <div className='Sidebar'>
      {/* <div className='panel'>
        <div className='header'>
          <div className='title'>Parts</div>
          <button>Add part</button>
        </div>
        <div className='content'>
        </div>
          </div> */}
      <ConnectionPanel />
      <SupplySwitchPanel />
      <NetlistPanel />
    </div>
  )
}
