import React, { useEffect, useState, useContext, useMemo } from 'react'
import { JumperlessStateContext } from './JumperlessState';
import { JumperlessNode, NetlistEntry } from './jlctlapi';
import { netlistNetForNode } from './netlist';

export type Mode = 'select' | 'connect' | 'disconnect'

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

  selectedNet: NetlistEntry | null

  cursorHint: string | null
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
  const { netlist, addBridge, disconnectNode } = useContext(JumperlessStateContext)
  const [cursorHint, setCursorHint] = useState(computeHint(mode, selectedNode))
  const selectedNet = useMemo(() => selectedNode ? netlistNetForNode(netlist, selectedNode) : null, [netlist, selectedNode])

  function keySetMode(mode: Mode): string {
    setMode(mode)
    return `Mode: ${mode}`
  }

  const keymap = useMemo<Keymap>(() => {
    return {
      s: () => keySetMode('select'),
      c: () => keySetMode('connect'),
      d: selectedNode ? () => {
        disconnectNode(selectedNode)
        setSelectedNode(null)
        return '...'
      } : () => keySetMode('disconnect')
    }
  }, [selectedNode, disconnectNode])

  function handleNodeClick(node: JumperlessNode | null) {
    switch (mode) {
      case 'select': {
        setSelectedNode(node)
        break
      }

      case 'connect': {
        if (node && node !== selectedNode) {
          if (selectedNode) {
            addBridge(selectedNode, node)
            setSelectedNode(null)
          } else {
            setSelectedNode(node)
          }
        }
        break
      }

      case 'disconnect': {
        if (node) {
          disconnectNode(node)
        }
        break
      }
    }
  }

  function handleSetMode(mode: Mode) {
    setMode(mode)
  }

  function handleDismiss(): boolean {
    if (mode === 'connect' || mode === 'disconnect') {
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

  useEffect(() => {
    setCursorHint(computeHint(mode, selectedNode))
  }, [mode, selectedNode])

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
      cursorHint,
      selectedNet,
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


function computeHint(mode: Mode, selectedNode: JumperlessNode | null): string | null {
  if (mode === 'connect') {
    if (selectedNode !== null) {
      return `connect with ${selectedNode}`
    } else {
      return `connect: choose a node`
    }
  }
  if (mode === 'disconnect') {
    return 'disconnect'
  }
  return null
}
