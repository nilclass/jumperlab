import { uniq } from 'lodash'
import { Netlist, NetlistEntry, Bridge, JumperlessNode } from './jlctlapi'

export function netlistAddBridge(netlist: Netlist, bridge: Bridge): Netlist {
  const netA = netlist.find(net => net.nodes.includes(bridge[0]))
  const netB = netlist.find(net => net.nodes.includes(bridge[1]))
  if (netA && netB && netA !== netB) {
    return netlistMergeNets(netlist, netA, netB)
  } else if (netA) {
    return netlistAddNode(netlist, netA, bridge[1])
  } else if (netB) {
    return netlistAddNode(netlist, netB, bridge[0])
  } else {
    return netlistNewNet(netlist, bridge)
  }
}

function netlistMergeNets(netlist: Netlist, a: NetlistEntry, b: NetlistEntry): Netlist {
  if (a.special && b.special) {
    throw new Error('Cannot merge special nets')
  }
  if (b.special) {
    return removeNet(updateNet(netlist, b.index, n => ({ ...n, nodes: uniq([...n.nodes, ...a.nodes]) })), a.index)
  }
  return removeNet(updateNet(netlist, a.index, n => ({ ...n, nodes: uniq([...n.nodes, ...b.nodes]) })), b.index)
}

function netlistAddNode(netlist: Netlist, net: NetlistEntry, node: JumperlessNode): Netlist {
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
      color: '#000000',
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

