import { BreadboardNode, JumperlessNode, Netlist, NamedNode } from '../jlctlapi'

type Connection<N extends JumperlessNode> = {
  a: ConnectionSpot<N>
  b: ConnectionSpot<N>
  netIndex: number
}

type Row = BreadboardNode

type ConnectionSpot<N extends JumperlessNode> = {
  node: N
  index: number
}

// Exclusive range of rows (does not `contain` given endpoints)
type RowRange<R extends number> = [R, R]

type OccupiedRanges<R extends number> = Array<Array<RowRange<R>>>

const contains = function <R extends number>(range: RowRange<R>, row: R) {
  return row > range[0] && row < range[1]
}
const overlaps = function <R extends number>(a: RowRange<R>, b: RowRange<R>) {
  return contains(a, b[0]) || contains(a, b[1]) || contains(b, a[0]) || contains(b, a[1])
}

const findFreeIndex = function <R extends number>(range: RowRange<R>, occupiedRanges: OccupiedRanges<R>): number {
  for (let index = 0; index < occupiedRanges.length; index++) {
    const ranges = occupiedRanges[index]
    if (!ranges.find(r => overlaps(r, range))) {
      return index
    }
  }
  console.log('give up', occupiedRanges, range)
  return 0 // give up!
}

export function computeLayout(netlist: Netlist): Array<Connection<BreadboardNode>> {
  const connections: Array<Connection<BreadboardNode>> = []
  const occupiedRangesTop: OccupiedRanges<Row> = [[], [], [], [], []]
  const occupiedRangesBottom: OccupiedRanges<Row> = [[], [], [], [], []]

  for (const net of netlist) {
    if (net.special && net.name === 'GND') {
      // Ground connections are rendered with a special marker
      continue
    }

    const rowsTop: Array<Row> = []
    const rowsBottom: Array<Row> = []
    for (const node of net.nodes) {
      if (typeof node === 'number') {
        if (node <= 30) {
          rowsTop.push(node)
        } else {
          rowsBottom.push(node)
        }
      }
    }

    computeHalfNet(connections, rowsTop, occupiedRangesTop, net.index, r => r)
    computeHalfNet(connections, rowsBottom, occupiedRangesBottom, net.index, r => r)

    if (rowsTop.length > 0 && rowsBottom.length > 0) {
      const topNode = rowsTop[0]
      rowsBottom.sort((a, b) => {
        const da = Math.abs(topNode - (a - 30))
        const db = Math.abs(topNode - (b - 30))
        return da > db ? 1 : db > da ? -1 : 0
      })

      connections.push({
        netIndex: net.index,
        a: {
          node: topNode,
          index: 4,
        },
        b: {
          node: rowsBottom[0],
          index: 4,
        },
      })
    }
  }

  return connections
}

function computeHalfNet<R extends number, N extends JumperlessNode>(connections: Array<Connection<N>>, rows: Array<R>, occupiedRanges: OccupiedRanges<R>, netIndex: number, rowToNode: (r: R) => N) {
  if (rows.length > 1) {
    rows.sort((a, b) => a > b ? 1 : a < b ? -1 : 0)
    for (let i = 1; i < rows.length; i++) {
      const range: RowRange<R> = [rows[i - 1], rows[i]]
      const index = findFreeIndex(range, occupiedRanges)
      if (Math.abs(range[0] - range[1]) > 1) {
        occupiedRanges[index].push(range)
      }
      connections.push({
        netIndex: netIndex,
        a: {
          node: rowToNode(rows[i - 1]),
          index,
        },
        b: {
          node: rowToNode(rows[i]),
          index,
        }
      })
    }
  }
}

const nanoPos: { [key: string]: ['top' | 'bottom', number] } = {
  NANO_D0: ['top', 14],
  NANO_D1: ['top', 15],
  NANO_D2: ['top', 11],
  NANO_D3: ['top', 10],
  NANO_D4: ['top', 9],
  NANO_D5: ['top', 8],
  NANO_D6: ['top', 7],
  NANO_D7: ['top', 6],
  NANO_D8: ['top', 5],
  NANO_D9: ['top', 4],
  NANO_D10: ['top', 3],
  NANO_D11: ['top', 2],
  NANO_D12: ['top', 1],
  NANO_D13: ['bottom', 1],
  NANO_RESET: ['bottom', 13],
  NANO_AREF: ['bottom', 3],
  NANO_A0: ['bottom', 4],
  NANO_A1: ['bottom', 5],
  NANO_A2: ['bottom', 6],
  NANO_A3: ['bottom', 7],
  NANO_A4: ['bottom', 8],
  NANO_A5: ['bottom', 9],
  NANO_A6: ['bottom', 10],
  NANO_A7: ['bottom', 11],
}

const nanoPosTop: { [key: string]: NamedNode } = {}
const nanoPosBottom: { [key: string]: NamedNode } = {}
for (const [key, [tb, n]] of Object.entries(nanoPos)) {
  if (tb === 'top') {
    nanoPosTop[n] = key as NamedNode
  } else {
    nanoPosBottom[n] = key as NamedNode
  }
}

function nanoPosToNode(topBottom: 'top' | 'bottom', r: number): NamedNode {
  const node = (topBottom === 'top' ? nanoPosTop : nanoPosBottom)[r]
  if (!node) {
    throw new Error(`BUG: failed to look up nano node for ${topBottom} ${r}`)
  }
  return node
}

export function computeNanoLayout(netlist: Netlist): Array<Connection<JumperlessNode>> {
  const connections: Array<Connection<JumperlessNode>> = []
  const occupiedRangesTop: OccupiedRanges<number> = [[], [], [], [], []]
  const occupiedRangesBottom: OccupiedRanges<number> = [[], [], [], [], []]
  
  for (const net of netlist) {
    if (net.special && net.name === 'GND') {
      // Ground connections are rendered with a special marker
      continue
    }

    let firstBreadboardNode: BreadboardNode | null = null
    
    const rowsTop: Array<number> = []
    const rowsBottom: Array<number> = []
    for (const node of net.nodes) {
      const pos = nanoPos[node]
      if (pos) {
        if (pos[0] === 'top') {
          rowsTop.push(pos[1])
        } else {
          rowsBottom.push(pos[1])
        }
      } else {
        if (!firstBreadboardNode && typeof node === 'number') {
          firstBreadboardNode = node
        }
      }
    }
    
    computeHalfNet(connections, rowsTop, occupiedRangesTop, net.index, r => nanoPosToNode('top', r))
    computeHalfNet(connections, rowsBottom, occupiedRangesBottom, net.index, r => nanoPosToNode('bottom', r))
    
    if (rowsTop.length > 0 && rowsBottom.length > 0) {
      const topNode = rowsTop[0]
      rowsBottom.sort((a, b) => {
        const da = Math.abs(topNode - (a - 30))
        const db = Math.abs(topNode - (b - 30))
        return da > db ? 1 : db > da ? -1 : 0
      })

      connections.push({
        netIndex: net.index,
        a: {
          node: nanoPosToNode('top', topNode),
          index: 4,
        },
        b: {
          node: nanoPosToNode('bottom', rowsBottom[0]),
          index: 4,
        },
      })
    }

    if (firstBreadboardNode) {
      const firstNanoNode = rowsBottom.length > 0 ? nanoPosToNode('bottom', rowsBottom[0]) : rowsTop.length > 0 ? nanoPosToNode('top', rowsTop[0]) : null
      if (firstNanoNode) {
        connections.push({
          netIndex: net.index,
          a: {
            node: firstNanoNode,
            index: 0,
          },
          b: {
            node: firstBreadboardNode,
            index: 0,
          },
        })
      }
    }
  }
  
  return connections
}
