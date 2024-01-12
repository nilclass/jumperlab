import { uniq } from 'lodash'
import { Netlist, NetlistEntry, Bridge, JumperlessNode } from './jlctlapi'

type Result<T, E = string> = { value: T, error: never } | { value: never, error: E }

function Ok<T, E>(value: T): Result<T, E> {
  return { value } as Result<T, E>
}

function Err<T, E>(error: E): Result<T, E> {
  return { error } as Result<T, E>
}

export function netlistAddBridge(netlist: Netlist, bridge: Bridge): Result<Netlist> {
  const netA = netlist.find(net => net.nodes.includes(bridge[0]))
  const netB = netlist.find(net => net.nodes.includes(bridge[1]))
  if (netA && netB && netA !== netB) {
    return netlistMergeNets(netlist, netA, netB)
  } else if (netA) {
    return Ok(netlistAddNode(netlist, netA, bridge[1]))
  } else if (netB) {
    return Ok(netlistAddNode(netlist, netB, bridge[0]))
  } else {
    return Ok(netlistNewNet(netlist, bridge))
  }
}

function netlistMergeNets(netlist: Netlist, a: NetlistEntry, b: NetlistEntry): Result<Netlist> {
  if (a.special && b.special) {
    return Err('Cannot merge special nets')
  }
  if (b.special) {
    return Ok(removeNet(updateNet(netlist, b.index, n => ({ ...n, nodes: uniq([...n.nodes, ...a.nodes]) })), a.index))
  }
  return Ok(removeNet(updateNet(netlist, a.index, n => ({ ...n, nodes: uniq([...n.nodes, ...b.nodes]) })), b.index))
}

function netlistAddNode(netlist: Netlist, net: NetlistEntry, node: JumperlessNode) {
  return updateNet(netlist, net.index, n => ({ ...n, nodes: uniq([...n.nodes, node]) }))
}

function netlistNewNet(netlist: Netlist, nodes: Array<JumperlessNode>): Netlist {
  const index = Math.max(...netlist.map(net => net.index)) + 1
  return [
    ...netlist,
    {
      index,
      nodes,
      name: `Net ${index}`,
      number: index,
      color: randomColor(),
      special: false,
      machine: true,
    },
  ]
}

function updateNet(netlist: Netlist, index: number, update: (net: NetlistEntry) => NetlistEntry): Netlist {
  return netlist.map(net => net.index === index ? update(net) : net)
}

function removeNet(netlist: Netlist, index: number): Netlist {
  return netlist.filter(net => net.index !== index)
}

export function netlistGetNodes(netlist: Netlist, index: Number): Array<JumperlessNode> {
  const net = netlist.find(net => net.index === index)
  if (!net) {
    throw new Error(`Net not found: ${index}`)
  }
  return net.nodes
}

export function netlistNodeColors(netlist: Netlist): Map<JumperlessNode, string> {
  const colors = new Map()
  netlist.forEach(net => {
    net.nodes.forEach(node => {
      colors.set(node, net.color)
    })
  })
  return colors
}

function randomColor() {
  const r = Math.floor(Math.random() * 0xFF)
  const g = Math.floor(Math.random() * 0xFF)
  const b = Math.floor(Math.random() * 0xFF)
  const color = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0')
  console.log('generated', color)
  return color
}

export function netlistDisconnectNode(netlist: Netlist, node: JumperlessNode): Netlist {
  if (typeof node === 'string') {
    // TODO: notify that special nodes cannot be removed!
    return netlist
  }
  const newList: Netlist = []
  netlist.forEach(net => {
    if (net.nodes.includes(node)) {
      const filtered = net.nodes.filter(n => n !== node)
      if (filtered.length > 1 || net.index < 8) {
        newList.push({ ...net, nodes: filtered })
      }
    } else {
      newList.push(net)
    }
  })
  return newList
}
