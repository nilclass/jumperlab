import React, { useState, useContext, useEffect, useMemo } from 'react';
import './App.scss';
import { BoardView } from './BoardView';
import { ConnectionContext, ConnectionWrapper } from './connection';
import { DialogWrapper } from './dialogs';
import { JumperlessNode, Bridge } from './jlctlapi';
import { JumperlessState } from './JumperlessState';
import { NodeDetails } from './NodeDetails';
import { SettingsWrapper } from './Settings';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';

export type Mode = 'select' | 'connect'

type InteractionControllerProps = {
  children: (props: InteractionProps) => React.ReactElement
}

type InteractionProps = {
  selectedNode: JumperlessNode | null
  mode: Mode
  handleNodeClick: (node: JumperlessNode | null) => void
  handleSetMode: (mode: Mode) => void
}

type Keymap = {
  [key: string]: () => void
}

const InteractionController: React.FC<InteractionControllerProps> = ({ children }) => {
  const { jlctl, poll } = useContext(ConnectionContext)!
  const [selectedNode, setSelectedNode] = useState<JumperlessNode | null>(null)
  const [mode, setMode] = useState<Mode>('select')

  const keymap = useMemo<Keymap>(() => {
    if (selectedNode) {
      return {
        c: () => setMode('connect'),
      }
    }
    return {} as Keymap
  }, [selectedNode, mode])

  function handleNodeClick(node: JumperlessNode | null) {
    if (mode === 'select') {
      setSelectedNode(node)
    } else if (mode === 'connect') {
      if (jlctl) {
        console.log('CONNECTING', selectedNode, node)
        //jlctl.addBridges([[selectedNode, node] as Bridge]).then(poll)
        setMode('select')
      } else {
        throw new Error('jlctl not ready, cannot add bridge!')
      }
    }
  }

  function handleSetMode(mode: Mode) {
    if (mode === 'connect' && !selectedNode) {
      throw new Error(`BUG: can't enter "connect" mode without a selected node!`)
    }
    setMode(mode)
  }

  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (eventTargetsInput(e)) {
        return
      }

      if (keymap[e.key]) {
        keymap[e.key]()
      }
    }

    window.addEventListener('keypress', handleKeyPress)

    return () => {
      window.removeEventListener('keypress', handleKeyPress)
    }
  }, [keymap])

  return children({
    selectedNode,
    mode,
    handleNodeClick,
    handleSetMode,
  })
}

function eventTargetsInput(e: KeyboardEvent): boolean {
  if (e.target instanceof HTMLElement) {
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
  }
  return false
}

function App() {
  return (
    <SettingsWrapper>
      <ConnectionWrapper baseUrl='http://localhost:8080'>
        <JumperlessState>
          <DialogWrapper>
            <InteractionController>
              {({ selectedNode, handleNodeClick, mode, handleSetMode }) => (
                <div className='App'>
                  {/* <NodeDetails node={selectedNode} mode={mode} onSetMode={handleSetMode} /> */}
                  <Toolbar mode={mode} />
                  <div className='main'>
                    <BoardView selectedNode={selectedNode} onNodeClick={handleNodeClick} />
                    <Sidebar />
                  </div>
                </div>
              )}
            </InteractionController>
          </DialogWrapper>
        </JumperlessState>
      </ConnectionWrapper>
    </SettingsWrapper>
  );
}
export default App;
