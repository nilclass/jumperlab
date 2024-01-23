import React, { useState, useEffect, useRef, useContext } from 'react'
import { JlCtl, Bridge, Netlist, NotConnected, SupplySwitchPos, Status } from './jlctlapi'
import './connection.css'
import { StatusIcon } from './components/StatusIcon'
import { imagePath } from './utils'

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

  // updates the context, by re-loading all info from the backend
  poll: () => Promise<void>
}

export const ConnectionContext = React.createContext<ConnectionContextType | null>(null)

export const ConnectionWidget: React.FC<{ pollIntervalMs: number }> = ({ pollIntervalMs }) => {
  const { reachable, ready } = useContext(ConnectionContext)!

  return (
    <div className='ConnectionWidget'>
      <strong>Connection status:</strong>
      <StatusIcon ok={reachable} src={imagePath('http-icon.svg')} title='jlctl server reachable' />
      <StatusIcon ok={ready} src={imagePath('board-icon.svg')} title='connected to board' />
    </div>
  )
}

export const ConnectionWrapper: React.FC<{ baseUrl: string, children: React.ReactNode }> = ({ baseUrl, children }) => {
  const contextRef = useRef<ConnectionContextType | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const ctx: ConnectionContextType = {
      jlctl: new JlCtl(baseUrl),
      reachable: false,
      ready: false,
      netlist: null,
      bridges: [],
      supplySwitchPos: '3.3V',

      async poll() {
        let status: Status
        try {
          status = await ctx.jlctl!.getStatus()
          if (status.connected) {
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

    ctx.poll().then(() => setInitialized(true))
  }, [baseUrl])

  if (initialized) {
    return <ConnectionContext.Provider value={contextRef.current}>{children}</ConnectionContext.Provider>
  }
  return null
}
