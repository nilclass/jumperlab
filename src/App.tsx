import React, { useState, useContext } from 'react';
import './App.scss';
import { BoardView } from './BoardView';
import { ConnectionContext, ConnectionWrapper } from './connection';
import { JumperlessNode, Bridge } from './jlctlapi';
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

const InteractionController: React.FC<InteractionControllerProps> = ({ children }) => {
  const { jlctl, poll } = useContext(ConnectionContext)!
  const [selectedNode, setSelectedNode] = useState<JumperlessNode | null>(null)
  const [mode, setMode] = useState<Mode>('select')

  function handleNodeClick(node: JumperlessNode | null) {
    if (mode === 'select') {
      setSelectedNode(node)
    } else if (mode === 'connect') {
      if (jlctl) {
        console.log('CONNECTING', selectedNode, node)
        jlctl.addBridges([[selectedNode, node] as Bridge]).then(poll)
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

  return children({
    selectedNode,
    mode,
    handleNodeClick,
    handleSetMode,
  })
}


function App() {
  return (
    <SettingsWrapper>
      <ConnectionWrapper baseUrl='http://localhost:8080'>
        <InteractionController>
          {({ selectedNode, handleNodeClick, mode, handleSetMode }) => (
            <>
              <NodeDetails node={selectedNode} mode={mode} onSetMode={handleSetMode} />
              <Toolbar />
              <BoardView selectedNode={selectedNode} onNodeClick={handleNodeClick} />
              <Sidebar />
            </>
          )}
        </InteractionController>
      </ConnectionWrapper>
    </SettingsWrapper>
  );
}
export default App;
