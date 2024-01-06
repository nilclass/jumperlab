import React, { useEffect, useState, useContext, useMemo } from 'react'
import { JumperlessStateContext } from './JumperlessState';
import { JumperlessNode } from './jlctlapi';

export type Mode = 'select' | 'connect'

type InteractionControllerProps = {
  children: React.ReactNode
}

type InteractionContextType = {
  selectedNode: JumperlessNode | null
  mode: Mode
  handleNodeClick: (node: JumperlessNode | null) => void
  handleSetMode: (mode: Mode) => void

  highlightedNode: JumperlessNode | null
  setHighlightedNode: (node: JumperlessNode | null) => void

  highlightedNet: number | null
  setHighlightedNet: (index: number | null) => void
}

export const InteractionContext = React.createContext<InteractionContextType | null>(null)

type Keymap = {
  [key: string]: () => void
}

export const InteractionController: React.FC<InteractionControllerProps> = ({ children }) => {
  const [selectedNode, setSelectedNode] = useState<JumperlessNode | null>(null)
  const [highlightedNode, setHighlightedNode] = useState<JumperlessNode | null>(null)
  const [highlightedNet, setHighlightedNet] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>('select')
  const { addBridge } = useContext(JumperlessStateContext)

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
    } else if (mode === 'connect' && node && selectedNode) {
      addBridge(selectedNode, node)
      setMode('select')
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

  return (
    <InteractionContext.Provider value={{
      selectedNode,
      mode,
      handleNodeClick,
      handleSetMode,
      highlightedNode,
      setHighlightedNode,
      highlightedNet,
      setHighlightedNet,
    }}>
      {children}
    </InteractionContext.Provider>
  )
}

function eventTargetsInput(e: KeyboardEvent): boolean {
  if (e.target instanceof HTMLElement) {
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
  }
  return false
}
