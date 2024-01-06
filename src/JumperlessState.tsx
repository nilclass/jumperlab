import React, { useState, createContext, useCallback, useContext, useEffect } from 'react'
import { ConnectionContext } from './connection'
import { JumperlessNode, Netlist, NetlistEntry, SupplySwitchPos } from './jlctlapi'
import { netlistAddBridge } from './netlist'

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
    "nodes": ["5V"],
    color: '#ff4114',
    special: true,
    machine: false,
  },
  {
    "index": 3,
    "name": "+3.3V",
    "number": 3,
    "nodes": ["3V3"],
    color: '#ff1040',
    special: true,
    machine: false,
  },
  {
    "index": 4,
    "name": "DAC 0",
    "number": 4,
    "nodes": ["DAC_0"],
    color: '#ef787a',
    special: true,
    machine: false,
  },
  {
    "index": 5,
    "name": "DAC 1",
    "number": 5,
    "nodes": ["DAC_1"],
    color: '#ef407f',
    special: true,
    machine: false,
  },
  {
    "index": 6,
    "name": "I Sense +",
    "number": 6,
    "nodes": ["I_POS"],
    color: '#ffffff',
    special: true,
    machine: false,
  },
  {
    "index": 7,
    "name": "I Sense -",
    "number": 7,
    "nodes": ["I_NEG"],
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
  const [syncOnce, setSyncOnce] = useState(false)
  const [syncAuto, setSyncAuto] = useState(false)

  async function syncToDevice() {
    if (conn.jlctl === null) {
      throw new Error('Cannot sync, no device!')
    }
    await conn.jlctl.setSupplySwitchPos(supplySwitchPos)
    await syncFromDevice()
  }

  async function syncFromDevice() {
    if (conn.jlctl === null) {
      throw new Error('Cannot sync, no device!')
    }
    await conn.poll()
    setSyncOnce(true)
  }

  useEffect(() => {
    if (syncOnce) {
      //setNetlist(conn.netlist)
      setSupplySwitchPos(conn.supplySwitchPos)
      setSyncOnce(false)
    }
  }, [syncOnce])

  useEffect(() => {
    if (syncAuto) {
      syncToDevice()
    }
  }, [syncAuto, netlist, supplySwitchPos])

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
    setNetlist(netlist => netlistAddBridge(netlist, [a, b]))
  }, [setNetlist])
  
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
    }}>
      {children}
    </JumperlessStateContext.Provider>
  )
}
