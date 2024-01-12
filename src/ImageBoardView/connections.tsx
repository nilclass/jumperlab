import { JumperlessNode, Netlist } from '../jlctlapi'

type Connection = {
  a: ConnectionSpot
  b: ConnectionSpot
}

type Row = JumperlessNode & number

type ConnectionSpot = {
  node: Row
  index: number
}

type RowRange = [Row, Row]

type OccupiedRanges = Array<Array<RowRange>>

const contains = (range: RowRange, row: Row) => row > range[0] && row < range[1]
const overlaps = (a: RowRange, b: RowRange) => contains(a, b[0]) || contains(a, b[1]) || contains(b, a[0]) || contains(b, a[1])

const findFreeIndex = (range: RowRange, occupiedRanges: OccupiedRanges): number => {
  for (let index = 0; index < occupiedRanges.length; index++) {
    const ranges = occupiedRanges[index]
    if (!ranges.find(r => overlaps(r, range))) {
      return index
    }
  }
  console.log('give up', occupiedRanges, range)
  return 0 // give up!
}

export function computeLayout(netlist: Netlist): Array<Connection> {
  const connections: Array<Connection> = []
  const occupiedRangesTop: OccupiedRanges = [[], [], [], [], []]
  const occupiedRangesBottom: OccupiedRanges = [[], [], [], [], []]

  for (const net of netlist) {
    const rowsTop = []
    const rowsBottom = []
    for (const node of net.nodes) {
      if (typeof node === 'number') {
        if (node <= 30) {
          rowsTop.push(node)
        } else {
          rowsBottom.push(node)
        }
      }
    }

    computeHalfNet(connections, rowsTop, occupiedRangesTop)
    computeHalfNet(connections, rowsBottom, occupiedRangesBottom)

    if (rowsTop.length > 0 && rowsBottom.length > 0) {
      const topNode = rowsTop[0]
      rowsBottom.sort((a, b) => {
        const da = Math.abs(topNode - (a - 30))
        const db = Math.abs(topNode - (b - 30))
        return da > db ? 1 : db > da ? -1 : 0
      })

      connections.push({
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

function computeHalfNet(connections: Array<Connection>, rows: Array<Row>, occupiedRanges: OccupiedRanges) {
  if (rows.length > 1) {
    rows.sort((a, b) => a > b ? 1 : a < b ? -1 : 0)
    for (let i = 1; i < rows.length; i++) {
      const range: RowRange = [rows[i - 1], rows[i]]
      const index = findFreeIndex(range, occupiedRanges)
      if (Math.abs(range[0] - range[1]) > 1) {
        occupiedRanges[index].push(range)
      }
      connections.push({
        a: {
          node: rows[i - 1],
          index,
        },
        b: {
          node: rows[i],
          index,
        }
      })
    }
  }
}
