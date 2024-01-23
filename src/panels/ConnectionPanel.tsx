import React, { useContext, useState, useEffect } from 'react'
import { StatusIcon } from '../components/StatusIcon'
import { ConnectionContext } from '../connection'
import { JumperlessStateContext } from '../JumperlessState'
import { imagePath } from '../utils'

const pollIntervalMs = 2000

export const ConnectionPanel: React.FC = () => {
  const { reachable, ready, poll } = useContext(ConnectionContext)!
  const { syncAuto, setSyncAuto, syncToDevice, syncFromDevice } = useContext(JumperlessStateContext)
  const [busy, setBusy] = useState(false)
  
  useEffect(() => {
    if (!busy) {
      const timer = setTimeout(() => {
        setBusy(true)
        poll().then(() => setBusy(false))
      }, pollIntervalMs)
      return () => clearTimeout(timer)
    }
  }, [busy, poll])

  return (
    <div className='ConnectionPanel panel'>
      <div className='header'>
        <div className='title'>Connection</div>
        <StatusIcon ok={reachable} src={imagePath('http-icon.svg')} title='jlctl server reachable' />
        <StatusIcon ok={ready} src={imagePath('board-icon.svg')} title='connected to board' />
      </div>
      <div className='content'>
        <button disabled={!ready || syncAuto} onClick={syncToDevice}>Sync to device ⇒</button>
        <label>
          <input type='checkbox' name='syncToDeviceAuto' checked={syncAuto} onChange={e => setSyncAuto(e.currentTarget.checked)} disabled={!ready} />
          Sync automatically
        </label>
        <br />
        <button disabled={!ready} onClick={syncFromDevice}>Sync from device ⇐</button>
      </div>
    </div>
  )
}
