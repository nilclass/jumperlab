import React, { useState, createContext, useCallback, useContext, useEffect } from 'react'
import { ConnectionContext } from './connection'
import { Netlist, NetlistEntry, SupplySwitchPos } from './jlctlapi'

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
}

export const JumperlessStateContext = createContext<JumperlessStateContextType>(emptyState)

const example: Netlist = [
  {
    "index": 1,
    "name": "GND",
    "number": 1,
    "nodes": ["GND"],
    "bridges": "{0-0}",
    color: '#00ff30'
  },
  {
    "index": 2,
    "name": "+5V",
    "number": 2,
    "nodes": ["5V"],
    "bridges": "{0-0}",
    color: '#ff4114'
  },
  {
    "index": 3,
    "name": "+3.3V",
    "number": 3,
    "nodes": ["3V3"],
    "bridges": "{0-0}",
    color: '#ff1040'
  },
  {
    "index": 4,
    "name": "DAC 0",
    "number": 4,
    "nodes": ["DAC_0"],
    "bridges": "{0-0}",
    color: '#ef787a'
  },
  {
    "index": 5,
    "name": "DAC 1",
    "number": 5,
    "nodes": ["DAC_1"],
    "bridges": "{0-0}",
    color: '#ef407f'
  },
  {
    "index": 6,
    "name": "I Sense +",
    "number": 6,
    "nodes": ["I_POS"],
    "bridges": "{0-0}",
    color: '#ffffff'
  },
  {
    "index": 7,
    "name": "I Sense -",
    "number": 7,
    "nodes": ["I_NEG"],
    "bridges": "{0-0}",
    color: '#ffffff'
  }
]

function makeNet(index: number): NetlistEntry {
  return {
    index,
    name: `Net ${index}`,
    number: index,
    nodes: [],
    bridges: '',
    color: '#000000'
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
    }}>
      {children}
    </JumperlessStateContext.Provider>
  )
}
