
export type JumperlessNode = string | number
export type Bridge = [JumperlessNode, JumperlessNode]
export type NetlistEntry = {
  index: number
  name: string
  number: number
  nodes: Array<JumperlessNode>
  color: string
  special: boolean
  machine: boolean
}
export type Netlist = Array<NetlistEntry>

export type SupplySwitchPos = '8V' | '3.3V' | '5V'

export function makeBridge(a: string, b: string): Bridge {
  return [makeNode(a), makeNode(b)]
}

export function makeNode(id: string): JumperlessNode {
  if (id.match(/^\d+$/)) {
    return parseInt(id, 10) as JumperlessNode
  } else {
    return id as JumperlessNode
  }
}

function handle502(response: Response) {
  if (response.status === 502) {
    throw new NotConnected()
  }
}

export class NotConnected extends Error {}

export class JlCtl {
  baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getNetlist(): Promise<Array<NetlistEntry>> {
    const response = await fetch(`${this.baseUrl}/nets`)
    handle502(response)
    return await response.json() as Array<NetlistEntry>
  }

  async putNetlist(netlist: Array<NetlistEntry>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/nets`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(netlist),
    })
  }

  async getSupplySwitchPos(): Promise<SupplySwitchPos> {
    const response = await fetch(`${this.baseUrl}/supply_switch_pos`)
    handle502(response)
    return await response.json() as SupplySwitchPos
  }

  async setSupplySwitchPos(pos: SupplySwitchPos): Promise<void> {
    const response = await fetch(`${this.baseUrl}/supply_switch_pos/${pos}`, { method: 'PUT' })
    handle502(response)
  }

  // async getBridges(): Promise<Array<Bridge>> {
  //   const response = await fetch(`${this.baseUrl}/bridges`)
  //   handle502(response)
  //   return await response.json() as Array<Bridge>
  // }

  // async addBridges(bridges: Array<Bridge>): Promise<Array<Bridge>> {
  //   const response = await fetch(`${this.baseUrl}/bridges`, {
  //     method: 'PUT',
  //     headers: {
  //       'content-type': 'application/json',
  //     },
  //     body: JSON.stringify(bridges),
  //   })
  //   handle502(response)
  //   return await response.json() as Array<Bridge>
  // }

  // async removeBridges(bridges: Array<Bridge>): Promise<Array<Bridge>> {
  //   const response = await fetch(`${this.baseUrl}/bridges`, {
  //     method: 'PUT',
  //     headers: {
  //       'content-type': 'application/json',
  //     },
  //     body: JSON.stringify(bridges),
  //   })
  //   handle502(response)
  //   return await response.json() as Array<Bridge>
  // }

  // async clearBridges(): Promise<void> {
  //   const response = await fetch(`${this.baseUrl}/bridges/clear`, { method: 'POST' })
  //   handle502(response)
  // }
}
