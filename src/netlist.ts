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
    return []
  }
  return net.nodes
}

export function netlistNodeNets(netlist: Netlist): Map<JumperlessNode, NetlistEntry> {
  const nets = new Map()
  netlist.forEach(net => {
    net.nodes.forEach(node => {
      nets.set(node, net)
    })
  })
  return nets
}

export function netlistNetForNode(netlist: Netlist, node: JumperlessNode): NetlistEntry | null {
  return netlist.find(net => net.nodes.includes(node)) || null
}

function randomColor() {
  let setRandomChanneltoZero = Math.floor(Math.random() * 3) //this picks a random channel to (not quite) zero out, so we get more saturated colors

  let max = 0
  //console.log(setRandomChanneltoZero)

  let r = Math.floor((Math.random() * 0x55) * 0x3)
  let g = Math.floor((Math.random() * 0x55) * 0x3)
  let b = Math.floor((Math.random() * 0x55) * 0x3)

  r = (setRandomChanneltoZero % 3 === 0 ? Math.floor(r*0.25) : r)
  g = (setRandomChanneltoZero % 3 === 1 ? Math.floor(g*0.25) : g)
  b = (setRandomChanneltoZero % 3 === 2 ? Math.floor(b*0.25) : b)

  max = Math.max(r, g, b)

  console.log(max)
  console.log("unmodified: ")
  console.log(r, g, b)

  if (max <= 0xBB) { //if it's a dark color, make it brighter
    console.log("dark")

    if (r > (max - 0x55)) { //this value kinda determines the likelihoood of getting secondary colors, so it's tuned to be roughly 50/50 primary and secondaries (rgb are primaries in this case)
      r *= 3
    }
    if (g > (max - 0x55)) {
      g *= 3
    }
    if (b > (max - 0x55)) {
      b *= 3
    }

    max = Math.max(r, g, b)

    if (max < 0xAA) { //even with multiplying by 3, it's still dark, so we need to make it brighter

      //console.log("still dark")
      //console.log(max)

      if (r === max) {
        r *= 4
      }
      if (g === max) {
        g *= 4
      }
      if (b === max) {
        b *= 4
      }
    }

    if (r > 0xFF) {
      r = 0xFF
    }
    if (g > 0xFF) {
      g = 0xFF
    }

    if (b > 0xFF) {
      b = 0xFF
    }

    //console.log("modified: ")
    //console.log(r, g, b)
  }


  const color = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0')
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
