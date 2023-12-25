
export type JumperlessNode = string | number
export type Bridge = [JumperlessNode, JumperlessNode]
export type NetlistEntry = {
  index: number
  name: string
  number: number
  nodes: string
  bridges: string
}

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

export class JlCtl {
  baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getNetlist(): Promise<Array<NetlistEntry>> {
    const response = await fetch(`${this.baseUrl}/netlist`)
    return await response.json() as Array<NetlistEntry>
  }

  async getBridges(): Promise<Array<Bridge>> {
    const response = await fetch(`${this.baseUrl}/bridges`)
    return await response.json() as Array<Bridge>
  }

  async addBridges(bridges: Array<Bridge>): Promise<Array<Bridge>> {
    const response = await fetch(`${this.baseUrl}/bridges`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(bridges),
    })
    return await response.json() as Array<Bridge>
  }

  async removeBridges(bridges: Array<Bridge>): Promise<Array<Bridge>> {
    const response = await fetch(`${this.baseUrl}/bridges`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(bridges),
    })
    return await response.json() as Array<Bridge>
  }

  async clearBridges(): Promise<void> {
    await fetch(`${this.baseUrl}/bridges/clear`, { method: 'POST' })
  }
}
