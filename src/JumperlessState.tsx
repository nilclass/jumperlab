import React, { useState, createContext, useCallback, useContext, useEffect } from 'react'
import { ConnectionContext } from './connection'
import { JumperlessNode, Netlist, NetlistEntry, SupplySwitchPos } from './jlctlapi'
import { netlistAddBridge, netlistDisconnectNode } from './netlist'
import { isEqual } from 'lodash'
import { errorToString } from './utils'
import { makeNetlistHistory, historyAddVersion, NetlistHistory, netlistUndo, netlistRedo } from './history'

type JumperlessStateContextType = {
  supplySwitchPos: SupplySwitchPos
  netlist: Netlist
  updateNet: (index: number, update: UpdateFn) => void
  addNet: () => number
  removeNet: (index: number) => void
  setSupplySwitchPos: (pos: SupplySwitchPos) => void,
  syncToDevice: () => Promise<void>
  syncFromDevice: () => Promise<void>
  syncAuto: boolean
  setSyncAuto: (value: boolean) => void
  addBridge: (a: JumperlessNode, b: JumperlessNode) => void
  disconnectNode: (node: JumperlessNode) => void
  busy: boolean
  syncError: string | null
  history: NetlistHistory

  undo: () => void
  redo: () => void
}

type UpdateFn = (net: NetlistEntry) => NetlistEntry

const emptyState: JumperlessStateContextType = {
  supplySwitchPos: '3.3V',
  netlist: [],
  updateNet() {},
  addNet() { return -1 },
  removeNet() {},
  setSupplySwitchPos() {},
  async syncToDevice() {},
  async syncFromDevice() {},
  syncAuto: false,
  setSyncAuto: () => {},
  addBridge() {},
  disconnectNode() {},
  busy: false,
  syncError: null,
  history: null as any as NetlistHistory,
  undo() {},
  redo() {},
}

export const JumperlessStateContext = createContext<JumperlessStateContextType>(emptyState)

const example: Netlist = [
  {
    "index": 1,
    "name": "GND",
    "number": 1,
    "nodes": ["GND"],
    color: '#00ff30',
    special: true,
    machine: false,
  },
  {
    "index": 2,
    "name": "+5V",
    "number": 2,
    "nodes": ["SUPPLY_5V"],
    color: '#ff4114',
    special: true,
    machine: false,
  },
  {
    "index": 3,
    "name": "+3.3V",
    "number": 3,
    "nodes": ["SUPPLY_3V3"],
    color: '#ff1040',
    special: true,
    machine: false,
  },
  {
    "index": 4,
    "name": "DAC 0",
    "number": 4,
    "nodes": ["DAC0"],
    color: '#ef787a',
    special: true,
    machine: false,
  },
  {
    "index": 5,
    "name": "DAC 1",
    "number": 5,
    "nodes": ["DAC1"],
    color: '#ef407f',
    special: true,
    machine: false,
  },
  {
    "index": 6,
    "name": "I Sense +",
    "number": 6,
    "nodes": ["ISENSE_PLUS"],
    color: '#ffffff',
    special: true,
    machine: false,
  },
  {
    "index": 7,
    "name": "I Sense -",
    "number": 7,
    "nodes": ["ISENSE_MINUS"],
    color: '#ffffff',
    special: true,
    machine: false,
  }
]

function makeNet(index: number): NetlistEntry {
  return {
    index,
    name: `Net ${index}`,
    number: index,
    nodes: [],
    color: '#000000',
    special: false,
    machine: true,
  }
}

export const JumperlessState: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [netlist, setNetlist] = useState(example)
  const [supplySwitchPos, setSupplySwitchPos] = useState<SupplySwitchPos>('3.3V')
  const conn = useContext(ConnectionContext)!;
  const [busy, setBusy] = useState(false)
  const [syncOnce, setSyncOnce] = useState(false)
  const [syncAuto, setSyncAuto] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [history, setHistory] = useState<NetlistHistory>(() => makeNetlistHistory(netlist))

  useEffect(() => {
    const newHistory = historyAddVersion(history, netlist)
    if (newHistory) {
      setHistory(newHistory)
    }
  }, [netlist])

  async function syncToDevice(auto?: boolean) {
    if (conn.jlctl === null) {
      throw new Error('Cannot sync, no device!')
    }
    setBusy(true)
    try {
      if (!auto || (conn.supplySwitchPos !== supplySwitchPos)) {
        await conn.jlctl.setSupplySwitchPos(supplySwitchPos)
      }
      if (!auto || !isEqual(conn.netlist, netlist)) {
        await conn.jlctl.putNetlist(netlist)
      }
    } catch (e) {
      setSyncError(errorToString(e))
    }
    //await syncFromDevice()
    setBusy(false)
  }

  async function syncFromDevice() {
    if (conn.jlctl === null) {
      throw new Error('Cannot sync, no device!')
    }
    setBusy(true)
    try {
      await conn.poll(true)
      setSyncOnce(true)
    } catch (e) {
      setSyncError(errorToString(e))
    }
  }

  useEffect(() => {
    if (syncOnce) {
      setNetlist(conn.netlist!)
      setSupplySwitchPos(conn.supplySwitchPos)
      setSyncOnce(false)
      setBusy(false)
    }
  }, [syncOnce]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (syncAuto && conn.ready) {
      syncToDevice(true)
    }
  }, [syncAuto, netlist, supplySwitchPos]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateNet = useCallback((index: number, update: UpdateFn) => {
    setNetlist(netlist => netlist.map(net => net.index === index ? update(net) : net))
  }, [setNetlist])
  const addNet = useCallback(() => {
    let index: number
    setNetlist(netlist => {
      index = Math.max(...netlist.map(net => net.index)) + 1
      return [...netlist, makeNet(index)]
    })
    return index!
  }, [setNetlist])
  const removeNet = useCallback((index: number) => {
    if (index <= 7) {
      throw new Error(`Cannot remove special net ${index}`)
    }
    setNetlist(netlist => netlist.filter(net => net.index !== index))
  }, [setNetlist])

  const addBridge = useCallback((a: JumperlessNode, b: JumperlessNode) => {
    setNetlist(netlist => {
      const result = netlistAddBridge(netlist, [a, b])
      if (result.value) {
        return result.value
      } else {
        alert(result.error)
        return netlist
      }
    })
  }, [setNetlist])

  const disconnectNode = useCallback((node: JumperlessNode) => {
    setNetlist(netlist => {
      const result = netlistDisconnectNode(netlist, node)
      if (result.value) {
        return result.value
      } else {
        alert(result.error)
        return netlist
      }
    })
  }, [setNetlist])

  function handleUndo() {
    const [newHistory, newNetlist] = netlistUndo(history)
    setHistory(newHistory)
    setNetlist(newNetlist)
  }

  function handleRedo() {
    const [newHistory, newNetlist] = netlistRedo(history)
    setHistory(newHistory)
    setNetlist(newNetlist)
  }

  return (
    <JumperlessStateContext.Provider value={{
      supplySwitchPos,
      netlist,
      updateNet,
      addNet,
      removeNet,
      setSupplySwitchPos,
      syncToDevice,
      syncFromDevice,
      syncAuto,
      setSyncAuto,
      addBridge,
      disconnectNode,
      busy,
      syncError,
      history,
      undo: handleUndo,
      redo: handleRedo,
    }}>
      {children}
    </JumperlessStateContext.Provider>
  )
}
