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
  const connections = []
  const occupiedRanges: OccupiedRanges = [
    [],
    [],
    [],
    [],
    [],
  ]

  for (const net of netlist) {
    const rows = []
    for (const node of net.nodes) {
      if (typeof node === 'number') {
        rows.push(node)
      }
    }

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

  return connections
}
