

export type BreadboardNode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
  11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
  21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
  31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 |
  41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 |
  51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60

const specialNodes = {
  GND: true,
  SUPPLY_3V3: true,
  SUPPLY_5V: true,
  DAC0: true,
  DAC1: true,
  ISENSE_PLUS: true,
  ISENSE_MINUS: true,
  ADC0: true,
  ADC1: true,
  ADC2: true,
  ADC3: true,
  RP_GPIO_0: true,
  RP_UART_TX: true,
  RP_GPIO_16: true,
  RP_UART_RX: true,
  RP_GPIO_17: true,
  NANO_D0: true,
  NANO_D1: true,
  NANO_D2: true,
  NANO_D3: true,
  NANO_D4: true,
  NANO_D5: true,
  NANO_D6: true,
  NANO_D7: true,
  NANO_D8: true,
  NANO_D9: true,
  NANO_D10: true,
  NANO_D11: true,
  NANO_D12: true,
  NANO_D13: true,
  NANO_RESET: true,
  NANO_AREF: true,
  NANO_A0: true,
  NANO_A1: true,
  NANO_A2: true,
  NANO_A3: true,
  NANO_A4: true,
  NANO_A5: true,
  NANO_A6: true,
  NANO_A7: true,
}

export type SpecialNode = keyof typeof specialNodes
export type JumperlessNode = BreadboardNode | SpecialNode

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

export type Status = {
  connected: boolean
}

export type ChipStatus = {
  char: string
  xStatus: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]
  yStatus: [number, number, number, number, number, number, number, number]
}

export function breadboardNode (n: number): BreadboardNode {
  if (n < 1 && n > 60) {
    throw new Error(`Invalid breadboard node: ${n}`)
  }
  return n as BreadboardNode
}

export function specialNode (name: string): SpecialNode {
  if (!(name in specialNodes)) {
    throw new Error(`Invalid special node: ${JSON.stringify(name)}`)
  }
  return name as SpecialNode
}

export function makeBridge(a: string, b: string): Bridge {
  return [validateNode(a), validateNode(b)]
}

export function validateNode(id: string): JumperlessNode {
  if (id.match(/^\d+$/)) {
    return breadboardNode(parseInt(id, 10))
  } else {
    return specialNode(id)
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
    if (this.baseUrl.slice(-1) !== '/') {
      this.baseUrl += '/'
    }
  }

  async getStatus(): Promise<Status> {
    const response = await fetch(this.buildUrl('status'))
    return await response.json() as Status
  }

  async getNetlist(): Promise<Array<NetlistEntry>> {
    const response = await fetch(this.buildUrl('nets'))
    handle502(response)
    return await response.json() as Array<NetlistEntry>
  }

  async putNetlist(netlist: Array<NetlistEntry>): Promise<void> {
    await fetch(this.buildUrl('nets'), {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(netlist),
    })
  }

  async getSupplySwitchPos(): Promise<SupplySwitchPos> {
    const response = await fetch(this.buildUrl('supply_switch_pos'))
    handle502(response)
    return await response.json() as SupplySwitchPos
  }

  async setSupplySwitchPos(pos: SupplySwitchPos): Promise<void> {
    const response = await fetch(this.buildUrl(`supply_switch_pos/${pos}`), { method: 'PUT' })
    handle502(response)
  }

  async getChipStatus(): Promise<Array<ChipStatus>> {
    const response = await fetch(this.buildUrl('chip_status'))
    handle502(response)
    const result = await response.json();
    console.log('chip status', result)
    return result.map(({ char, x_status, y_status }: { char: ChipStatus['char'], x_status: ChipStatus['xStatus'], y_status: ChipStatus['yStatus'] }) => ({
      char,
      xStatus: x_status,
      yStatus: y_status,
    }))
  }

  buildUrl(path: string): string {
    return `${this.baseUrl}${path}`
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
