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

  handleDismiss: () => boolean

  highlightedNode: JumperlessNode | null
  setHighlightedNode: (node: JumperlessNode | null) => void

  highlightedNet: number | null
  setHighlightedNet: (index: number | null) => void
}

export const InteractionContext = React.createContext<InteractionContextType | null>(null)

type Keymap = {
  [key: string]: () => string | null
}

export const InteractionController: React.FC<InteractionControllerProps> = ({ children }) => {
  const [selectedNode, setSelectedNode] = useState<JumperlessNode | null>(null)
  const [highlightedNode, setHighlightedNode] = useState<JumperlessNode | null>(null)
  const [highlightedNet, setHighlightedNet] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>('select')
  const { addBridge } = useContext(JumperlessStateContext)

  function keySetMode(mode: Mode): string {
    setMode(mode)
    return `Mode: ${mode}`
  }

  const keymap = useMemo<Keymap>(() => {
    return {
      s: () => keySetMode('select'),
      c: () => keySetMode('connect'),
    }
  }, [])

  function handleNodeClick(node: JumperlessNode | null) {
    if (mode === 'select') {
      setSelectedNode(node)
    } else if (mode === 'connect') {
      if (node) {
        if (selectedNode) {
          addBridge(selectedNode, node)
          setSelectedNode(null)
        } else {
          setSelectedNode(node)
        }
      }
    }
  }

  function handleSetMode(mode: Mode) {
    setMode(mode)
  }

  function handleDismiss(): boolean {
    if (mode === 'connect') {
      setMode('select')
      return true
    } else if (selectedNode) {
      setSelectedNode(null)
      return true
    }
    return false
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
      handleDismiss,
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
