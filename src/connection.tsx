import React, { useState, useEffect, useRef } from 'react'
import { JlCtl, Bridge, Netlist, NotConnected, SupplySwitchPos, Status } from './jlctlapi'

export type ConnectionContextType = {
  // interface to the jlctl server
  jlctl: JlCtl | null

  // true if the jlctl server is reachable
  reachable: boolean

  // true if the board is connected & ready
  ready: boolean

  netlist: Netlist | null
  bridges: Array<Bridge>
  supplySwitchPos: SupplySwitchPos

  // Updates status of the backend. If `reload` is given, also polls the netlist, and other info from the board.
  poll: (reload?: boolean) => Promise<void>
}

export const ConnectionContext = React.createContext<ConnectionContextType | null>(null)

export const ConnectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contextRef = useRef<ConnectionContextType | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const ctx: ConnectionContextType = {
      jlctl: new JlCtl(),
      reachable: false,
      ready: false,
      netlist: null,
      bridges: [],
      supplySwitchPos: '3.3V',

      async poll(reload: boolean = false) {
        let status: Status
        try {
          status = await ctx.jlctl!.getStatus()
          if (status.connected && reload) {
            ctx.netlist = await ctx.jlctl!.getNetlist()
            ctx.supplySwitchPos = await ctx.jlctl!.getSupplySwitchPos()
          }
        } catch(e) {
          // if we received a 502 error (mapped to "NotConnected"),
          // the server is reachable, but no board was detected.
          ctx.reachable = (e instanceof NotConnected)

          ctx.ready = false
          return
        }
        ctx.reachable = true
        ctx.ready = status.connected
      }
    }

    contextRef.current = ctx

    ctx.poll(true).then(() => setInitialized(true))
  }, [])

  if (initialized) {
    return <ConnectionContext.Provider value={contextRef.current}>{children}</ConnectionContext.Provider>
  }
  return null
}
