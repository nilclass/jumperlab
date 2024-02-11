import React, { useContext, useRef } from 'react'
import { BoardViewModeSelect } from './BoardView'
import { useOpenDialog } from './dialogs'
import { SettingsDialog } from './Settings'
import './Toolbar.css'
import { InteractionContext } from './interaction'
import { RadioGroup } from './components/RadioGroup'
import { imagePath } from './utils'
import { ChipStatusDialog } from './ChipStatus'
import { HistoryDialog } from './history'
import { JumperlessStateContext } from './JumperlessState'
import { ButtonGroup } from './components/ButtonGroup'
import { Netlist } from './jlctlapi'
import stableStringify from 'json-stable-stringify'

const buildInfo = process.env.REACT_APP_BUILD_INFO

export const Toolbar: React.FC = () => {
  const { mode, handleSetMode } = useContext(InteractionContext)!
  const { netlist, replaceNetlist, history, undo, redo } = useContext(JumperlessStateContext)
  const openDialog = useOpenDialog()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files![0]
    if (file) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        let parsed: Netlist
        try {
          parsed = JSON.parse(reader.result as string)
        } catch (e) {
          alert(`Failed to parse data: ${e}`)
          return
        }

        replaceNetlist(parsed)
      })

      reader.readAsText(file)
    }
  }

  return (
    <div className='Toolbar'>
      <div className='logo'>
        <img src={imagePath('logo.svg')} alt='Jumperlab logo' />
        <h1>Jumperlab</h1>
      </div>
      <ButtonGroup>
        <button onClick={() => saveToFile(netlist)}>Save to file</button>
        <input type='file' onChange={handleLoadFile} style={{ display: 'none' }} ref={fileInputRef} accept='.json,application/json' />
        <button onClick={() => fileInputRef.current!.click()}>Load from file</button>
      </ButtonGroup>
      <ButtonGroup>
        <button disabled={!history.canUndo} onClick={undo}>Undo [u]</button>
        <button disabled={!history.canRedo} onClick={redo}>Redo</button>
        <button onClick={(e) => openDialog(<HistoryDialog />, e)}>History</button>
      </ButtonGroup>
      <div>
        <RadioGroup options={[
          { value: 'select', label: 'Select [s]' },
          { value: 'connect', label: 'Connect [c]' },
          { value: 'disconnect', label: 'Disconnect [d]' },
        ]} name='interactionMode' value={mode} onChange={handleSetMode} />
      </div>
      <BoardViewModeSelect />
      {buildInfo && <div className='build-info'><strong>Build: </strong><code>{buildInfo}</code></div>}
      <button onClick={(e) => openDialog(<ChipStatusDialog />, e)}>
        Chip Status
      </button>
      <button className='with-icon' onClick={(e) => openDialog(<SettingsDialog />, e)}>
        <div className='icon'>⚙</div>
        Settings
      </button>
    </div>
  )
}

function saveToFile(netlist: Netlist) {
  const source = stableStringify(netlist)
  const filename = `jumperlab-sketch-${new Date().getTime()}.json`
  const url = URL.createObjectURL(new File([source], filename, { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}
