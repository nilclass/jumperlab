import React, { useState, useEffect, useRef, useContext } from 'react'
import { JlCtl, Bridge, Netlist } from './jlctlapi'

export type ConnectionContextType = {
  // interface to the jlctl server
  jlctl: JlCtl | null

  // true if the board is connected & ready
  ready: boolean

  netlist: Netlist | null
  bridges: Array<Bridge> | null

  // updates the context, by re-loading all info from the backend
  poll: () => Promise<void>
}

export const ConnectionContext = React.createContext<ConnectionContextType | null>(null)

export const ConnectionWidget: React.FC<{ pollIntervalMs: number }> = ({ pollIntervalMs }) => {
  const { ready, poll } = useContext(ConnectionContext)!
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!busy) {
      const timer = setTimeout(() => {
        setBusy(true)
        poll().then(() => setBusy(false))
      }, pollIntervalMs)
      return () => clearTimeout(timer)
    }
  }, [busy, poll, pollIntervalMs])

  return (
    <div className='ConnectionWidget'>
      {ready ? 'Ready!' : 'Not ready'}
    </div>
  )
}

export const ConnectionWrapper: React.FC<{ baseUrl: string, children: React.ReactNode }> = ({ baseUrl, children }) => {
  const contextRef = useRef<ConnectionContextType | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const ctx: ConnectionContextType = {
      jlctl: new JlCtl(baseUrl),
      ready: false,
      netlist: null,
      bridges: null,

      async poll() {
        try {
          ctx.netlist = await ctx.jlctl!.getNetlist()
          ctx.bridges = await ctx.jlctl!.getBridges()
        } catch(e) {
          console.error('Caught', e)
          ctx.ready = false
          return
        }
        ctx.ready = true
      }
    }

    contextRef.current = ctx

    ctx.poll().then(() => setInitialized(true))
  }, [baseUrl])

  if (initialized) {
    return <ConnectionContext.Provider value={contextRef.current}>{children}</ConnectionContext.Provider>
  }
  return null
}
