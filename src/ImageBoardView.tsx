import React, { useContext, useMemo, useRef, useState, useCallback } from "react"
import { JumperlessStateContext } from './JumperlessState'
import { JumperlessNode, NetlistEntry, SupplySwitchPos } from "./jlctlapi"
import {
  useFloating,
  autoUpdate,
  arrow,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingArrow,
} from "@floating-ui/react"
import './ImageBoardView.scss'
import { InteractionContext } from "./interaction"
import { SelectionInfo } from "./SelectionInfo"
import { netlistNodeNets } from "./netlist"
import { CursorModeIndicator } from "./CursorModeIndicator"
import { computeLayout } from "./ImageBoardView/connections"
import { useSetting } from "./Settings"
import { imagePath } from "./utils"

const SWITCH_OPTS: Array<SupplySwitchPos> = [
  '8V',
  '5V',
  '3.3V',
]

const SWITCH_LABELS: { [key in SupplySwitchPos]: string } = {
  '3.3V': '+3.3V',
  '5V': '+5V',
  '8V': '±8V',
}

const ROW_POSITIONS = [
  [407.19788, 1450.7103], [486.94028, 1450.7103], [566.68262, 1450.7103], [646.42456, 1450.7103], [726.16718, 1450.7103],
  [805.9093, 1450.7103], [885.65149, 1450.7103], [965.39386, 1450.7103], [1045.1365, 1450.7103], [1124.8782, 1450.7103],
  [1204.6207, 1450.7103], [1284.3629, 1450.7103], [1364.105, 1450.7103], [1443.8474, 1450.7103], [1523.5897, 1450.7103],
  [1603.332, 1450.7103], [1683.0741, 1450.7103], [1762.8163, 1450.7103], [1842.5588, 1450.7103], [1922.3011, 1450.7103],
  [2002.0427, 1450.7103], [2081.7854, 1450.7103], [2161.5281, 1450.7103], [2241.27, 1450.7103], [2321.0122, 1450.7103],
  [2400.7549, 1450.7103], [2480.4963, 1450.7103], [2560.2393, 1450.7103], [2639.9817, 1450.7103], [2719.7236, 1450.7103],
  [407.19788, 2153.8367], [486.94028, 2153.8367], [566.68256, 2153.8367], [646.4245, 2153.8367], [726.16711, 2153.8367],
  [805.90924, 2153.8367], [885.65143, 2153.8367], [965.39386, 2153.8367], [1045.1365, 2153.8367], [1124.8782, 2153.8367],
  [1204.6207, 2153.8367], [1284.3629, 2153.8367], [1364.105, 2153.8367], [1443.8473, 2153.8367], [1523.5896, 2153.8367],
  [1603.3319, 2153.8367], [1683.074, 2153.8367], [1762.8163, 2153.8367], [1842.5588, 2153.8367], [1922.3011, 2153.8367],
  [2002.0427, 2153.8367], [2081.7852, 2153.8367], [2161.5278, 2153.8367], [2241.27, 2153.8367], [2321.012, 2153.8367],
  [2400.7549, 2153.8367], [2480.4961, 2153.8367], [2560.239, 2153.8367], [2639.9817, 2153.8367], [2719.7236, 2153.8367]
]

const ROW_WIDTH = 79.74227100000007
const ROW_HEIGHT = 563.3254399999998

const ROW_CENTERS = ROW_POSITIONS.map(([x, y]) => [x + ROW_WIDTH / 2, y])

const ROW_INDEX_OFFSETS = [
  196,
  276,
  356,
  436,
  516,
]

function holePosTop(row: JumperlessNode & number, index: number): [number, number] {
  const [x, y] = ROW_CENTERS[row - 1]
  return [x, y + ROW_INDEX_OFFSETS[index]]
}

function holePosBottom(row: JumperlessNode & number, index: number): [number, number] {
  const [x, y] = ROW_CENTERS[row - 1]
  return [x, y + ROW_HEIGHT - ROW_INDEX_OFFSETS[index]]
}

const RAIL_POS = {
  tPos: [347.19583, 1278.9934],
  tNeg: [347.19583, 1364.8767],
  bPos: [349.44824, 2717.2117],
  bNeg: [349.44824, 2803.095]
}

function railNode(rail: string, supplySwitchPos: SupplySwitchPos): JumperlessNode | null {
  if (rail === 'tNeg' || rail === 'bNeg') {
    return 'GND'
  }
  if (supplySwitchPos === '3.3V') {
    return '3V3'
  }
  if (supplySwitchPos === '5V') {
    return '5V'
  }
  return null
}

const NANO_NODES = {
  "D12": {
    width: 81.971809,
    height: 256.60733,
    x: 988.57129,
    y: 367.09097,
  },
  "D11": {
    width: 76.847221,
    height: 256.61069,
    x: 1072.5413,
    y: 367.08929,
  },
  "D10": {
    width: 80.893265,
    height: 256.60803,
    x: 1151.3864,
    y: 367.09061,
  },
  "D9": {
    width: 72.591599,
    height: 256.61356,
    x: 1234.9969,
    y: 367.08783,
  },
  "D8": {
    width: 76.227379,
    height: 256.61111,
    x: 1312.9922,
    y: 367.08908,
  },
  "D7": {
    width: 78.049431,
    height: 256.60989,
    x: 1392.625,
    y: 367.08969,
  },
  "D6": {
    width: 76.227379,
    height: 256.61111,
    x: 1474.8103,
    y: 367.08908,
  },
  "D5": {
    width: 76.227379,
    height: 256.61111,
    x: 1555.173,
    y: 367.08908,
  },
  "D4": {
    width: 76.227379,
    height: 256.61111,
    x: 1633.5356,
    y: 367.08908,
  },
  "D3": {
    width: 76.227379,
    height: 256.61111,
    x: 1711.8983,
    y: 367.08908,
  },
  "D2": {
    width: 76.227379,
    height: 256.61111,
    x: 1790.261,
    y: 367.08908,
  },
  "ngnd0": {
    width: 84.595268,
    height: 256.60565,
    x: 1868.7933,
    y: 367.0918,
  },
  "RST1": {
    width: 76.227379,
    height: 256.61111,
    x: 1955.6936,
    y: 367.08905,
  },
  "D0": {
    width: 76.227379,
    height: 256.61111,
    x: 2034.2233,
    y: 367.08905,
  },
  "D1": {
    width: 76.227379,
    height: 256.61111,
    x: 2112.7529,
    y: 367.08905,
  },
  "D13": {
    width: 78.98185,
    height: 256.60928,
    x: 988.57031,
    y: 952.03479,
  },
  "n3v3": {
    width: 79.837097,
    height: 256.6087,
    x: 1069.5504,
    y: 952.0351,
  },
  "AREF": {
    width: 86.024788,
    height: 256.60474,
    x: 1151.3879,
    y: 952.03705,
  },
  "A0": {
    width: 68.180794,
    height: 256.61664,
    x: 1239.4093,
    y: 952.03113,
  },
  "A1": {
    width: 76.227379,
    height: 256.61111,
    x: 1312.9922,
    y: 952.03387,
  },
  "A2": {
    width: 78.049431,
    height: 256.60989,
    x: 1392.625,
    y: 952.03448,
  },
  "A3": {
    width: 76.227379,
    height: 256.61111,
    x: 1474.8103,
    y: 952.03387,
  },
  "A4": {
    width: 76.227379,
    height: 256.61111,
    x: 1555.173,
    y: 952.03387,
  },
  "A5": {
    width: 76.227379,
    height: 256.61111,
    x: 1633.5355,
    y: 952.03387,
  },
  "A6": {
    width: 76.227379,
    height: 256.61111,
    x: 1711.8983,
    y: 952.03387,
  },
  "A7": {
    width: 76.227379,
    height: 256.61111,
    x: 1790.2609,
    y: 952.03387,
  },
  "n5v": {
    width: 84.595268,
    height: 256.60565,
    x: 1868.7933,
    y: 952.03662,
  },
  "RST0": {
    width: 70.018097,
    height: 256.61536,
    x: 1955.6914,
    y: 952.03174,
  },
  "ngnd1": {
    width: 82.436722,
    height: 256.60703,
    x: 2028.0118,
    y: 952.03589,
  },
  "VIN": {
    width: 76.227379,
    height: 256.61111,
    x: 2112.7529,
    y: 952.03387,
  },
}

function nanoNodeToNode(nanoNode: string): string {
  switch (nanoNode) {
    case 'ngnd0':
    case 'ngnd1':
      return 'GND'
    case 'RST0':
    case 'RST1':
      return 'RESET'
    case 'n3v3':
      return 'SUPPLY_3V3'
    case 'n5v':
      return 'SUPPLY_5V'
    default:
      return nanoNode
  }
}

const SPECIAL_FUNCTIONS: { [key: string]: { width: number, height: number, x: number, y: number, rotate?: number } } = {
  dac0: {
    width: 207.44432,
    height: 49.302864,
    x: 2679.916,
    y: 1079.9348,
  },
  dac1: {
    width: 207.44432,
    height: 49.302864,
    x: 2679.916,
    y: 1128.6094,
  },
  adc0: {
    width: 207.4442,
    height: 49.302864,
    x: 2679.916,
    y: 847.59515,
  },
  adc1: {
    width: 207.44397,
    height: 49.302864,
    x: 2679.916,
    y: 896.9187,
  },
  adc2: {
    width: 207.44386,
    height: 49.302864,
    x: 2679.916,
    y: 946.24225,
  },
  adc3: {
    width: 207.44365,
    height: 49.302864,
    x: 2679.916,
    y: 995.5658,
  },
  gpio0: {
    width: 193.90086,
    height: 127.49269,
    x: 2693.4243,
    y: 689.08044,
  },
  gpio18: {
    width: 171.293,
    height: 54.129276,
    x: 629.73944,
    y: 46.719563,
    rotate: 45,
  },
  gpio19: {
    width: 171.293,
    height: 54.129276,
    x: 630.74194,
    y: 126.31828,
    rotate: 45,
  },
  rx: {
    width: 171.293,
    height: 54.129276,
    x: 626.43115,
    y: -112.97909,
    rotate: 45,
  },
  tx: {
    width: 171.293,
    height: 54.129276,
    x: 628.93744,
    y: -33.480652,
    rotate: 45,
  },
}

function makePath(points: Array<[number, number]>): string {
  const [x, y] = points[0]
  return `M${x} ${y}` + points.slice(1).map(([x, y]) => `L${x} ${y}`).join('')
}

const ImageBoardView: React.FC = () => {
  const { netlist, supplySwitchPos, setSupplySwitchPos, busy } = useContext(JumperlessStateContext)
  const { mode, handleNodeClick, selectedNode, handleDismiss, cursorHint, setHighlightedNode, highlightedNet, setHighlightedNet } = useContext(InteractionContext)!
  const nodeNets = useMemo(() => netlistNodeNets(netlist), [netlist])
  const [australia] = useSetting('australia', false)

  const nodeColor = useCallback((node: JumperlessNode): string | null => {
    const net = nodeNets.get(node)
    return net ? net.color : null
  }, [nodeNets])

  const switchDiff = useMemo(() => {
    return (SWITCH_OPTS.indexOf(supplySwitchPos) - 1) * 55
  }, [supplySwitchPos])

  function cycleSwitchPos() {
    const i = (SWITCH_OPTS.indexOf(supplySwitchPos) + 1) % SWITCH_OPTS.length
    setSupplySwitchPos(SWITCH_OPTS[i])
  }

  const { arrow, refs, getReferenceProps, getFloatingProps, isOpen, floatingStyles } = useRailswitchTooltip()

  function elementNode(element: HTMLElement): JumperlessNode | null {
    const node = element.dataset.node

    if (node) {
      if (/^\d+$/.test(node)) {
        return parseInt(node, 10)
      }
      return node
    }
    return null
  }

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    handleNodeClick(elementNode(e.target as HTMLElement))
  }

  const handleHover = (e: React.MouseEvent<SVGSVGElement>) => {
    const node = elementNode(e.target as HTMLElement)
    setHighlightedNode(node)
    const net = node && nodeNets.get(node)
    setHighlightedNet(net ? net.index : null)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (handleDismiss()) {
      e.preventDefault()
    }
  }

  const rows = ROW_POSITIONS.map(([x, y], i) => {
    const row = i + 1
    const fill = nodeColor(row)
    const style: React.CSSProperties = {}
    if (fill) {
      style.fill = fill
    }

    return (
      <rect
        key={row}
        x={x}
        y={y}
        id={`row${row}`}
        className={`row ${selectedNode === row ? 'selected' : ''}`}
        width={ROW_WIDTH}
        height={ROW_HEIGHT}
        style={style}
        data-node={row}
      />
    )
  })

  const rails = useMemo(() => {
    return Object.entries(RAIL_POS).map(([id, [x, y]]) => {
      const node = railNode(id, supplySwitchPos)
      const color = node && nodeColor(node)
      const style: React.CSSProperties = {}
      if (color) {
        style.fill = color
      }
      return (
        <rect className='rail' key={id} id={id} width={2514.6069} height={85.783966} x={x} y={y} ry={0.31750244} style={style} data-node={node} />
      )
    })
  }, [supplySwitchPos, nodeColor])

  const specialMarkers = useMemo(() => {
    const markers: Array<React.ReactNode> = []
    netlist.forEach(net => {
      if (net.special) {
        net.nodes.slice(1).forEach(node => {
          markers.push(markerFor(net, node, australia))
        })
      }
    })
    return markers
  }, [netlist, australia])

  const connections = useMemo(() => {
    return computeLayout(netlist).map(({ a, b, netIndex }) => {
      let d: string

      if (a.node <= 30 && b.node <= 30) { // both in top half
        const aPos = holePosTop(a.node, a.index)
        const bPos = holePosTop(b.node, b.index)
        d = makePath(
          Math.abs(a.node - b.node) === 1
          ? [aPos, bPos] // direct neighbors get a straight connection
          : [ // all others are connected with midpoints
              aPos,
              [
                aPos[0] + (ROW_WIDTH / 2),
                aPos[1] + (ROW_WIDTH / 2),
              ],
              [
                bPos[0] - (ROW_WIDTH / 2),
                bPos[1] + (ROW_WIDTH / 2),
              ],
              bPos,
          ]
        )
      } else if (a.node > 30 && b.node > 30) { // both in bottom half
        const aPos = holePosBottom(a.node, a.index)
        const bPos = holePosBottom(b.node, b.index)
        d = makePath(
          Math.abs(a.node - b.node) === 1
          ? [aPos, bPos] // direct neighbors get a straight connection
          : [ // all others are connected with midpoints
              aPos,
              [
                aPos[0] + (ROW_WIDTH / 2),
                aPos[1] - (ROW_WIDTH / 2),
              ],
              [
                bPos[0] - (ROW_WIDTH / 2),
                bPos[1] - (ROW_WIDTH / 2),
              ],
              bPos,
          ]
        )
      } else {
        const aPos = holePosTop(a.node, a.index)
        const bPos = holePosBottom(b.node, b.index)
        d = makePath([
          aPos,
          [aPos[0], aPos[1] + (ROW_WIDTH / 2)],
          [bPos[0], bPos[1] - (ROW_WIDTH / 2)],
          bPos,
        ])
      }

      const style = {
        stroke: nodeColor(a.node)!,
        strokeWidth: netIndex === highlightedNet ? 16 : 8,
        fill: 'none',
      }
      const id = `${a.node}-${b.node}`
      return <path className='connection' key={id} id={id} style={style} d={d} />
    })
  }, [netlist, highlightedNet, nodeColor])

  const nanoPins = useMemo(() => {
    return Object.entries(NANO_NODES).map(([node, { x, y, width, height }]) => {
      const color = nodeColor(node)
      const style: React.CSSProperties = {}
      if (color) {
        style.fill = color
      }
      const id = `nano-${node}`
      return <rect key={node} className='nanoPin' id={id} data-node={nanoNodeToNode(node)} x={x} y={y} width={width} height={height} ry={0.37795275} style={style} />
    })
  }, [nodeColor])

  const specialFunctions = useMemo(() => {
    return Object.entries(SPECIAL_FUNCTIONS).map(([node, { x, y, width, height, rotate }]) => {
      const transformProps = typeof rotate === 'number' ? { transform: `rotate(${rotate})` } : {}
      return (
        <rect
          className='specialFunction'
          key={node}
          x={x}
          y={y}
          width={width}
          height={height}
          {...transformProps}
        />
      )
    })
  }, [])

  return (
    <div className="ImageBoardView" data-busy={busy}>
      <SelectionInfo />
      {cursorHint !== null && <CursorModeIndicator hint={cursorHint} />}
      <svg
        viewBox="0 0 3200 3200"
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid"
        onClick={handleClick}
        onMouseMove={handleHover}
        data-interaction-mode={mode}
        onContextMenu={handleContextMenu}
      >
        <g id="g1">
          <g id="nanoHeader">{nanoPins}</g>
          <g id="rails">{rails}</g>
          <g id="Rows">{rows}</g>
          <g id="specialFunctions">{specialFunctions}</g>
          <rect
            style={{
              opacity: 1,
              fill: "#ff275d",
              fillRule: "evenodd",
              stroke: "#000",
              strokeWidth: 0.105827,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              fillOpacity: 1
            }}
            id="logo"
            width={83.346313}
            height={118.73895}
            x={729.62268}
            y={615.39575}
            ry={45.223984}
          />
          <g id="railselectionswitch" onClick={cycleSwitchPos} ref={refs.setReference} {...getReferenceProps()}>
            <rect
              id="switchclickarea"
              className='clickarea'
              width={106.02859}
              height={366.08533}
              x={336.7016}
              y={801.72998}
              ry={0}
              rx={0}
            />
            <rect
              id="railswitchhandle"
              className='handle'
              width={46.692024}
              height={54.439331}
              x={366.3699}
              y={957.55298 + switchDiff}
              ry={7.3958402}
            />
          </g>
          <image
            width={3242.8799}
            height={3242.8799}
            preserveAspectRatio="none"
            style={{ display: "inline", pointerEvents: 'none' }}
            xlinkHref={imagePath('board-background.png')}
            id="image1"
            x={0}
            y={-0.00001924485}
          />
          <g className="connections">{connections}</g>
          <g className="specialMarkers">{specialMarkers}</g>
        </g>
      </svg>
      <FloatingPortal>
        {isOpen && (
          <div
            className="railSwitchTooltip"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {arrow}
            <div className='value'>{SWITCH_LABELS[supplySwitchPos]}</div>
          </div>
        )}
      </FloatingPortal>
    </div>
  )
}

const GND: React.FC<{ color: string, x: number, y: number, flip?: boolean }> = ({ color, x, y, flip }) => {
  const style = {
    stroke: color,
    strokeWidth: 4.12754,
    fill: 'none',
  }
  return (
    <g
      transform={`translate(${x} ${y}) ${flip ? 'scale(1 -1)' : ''}`}
    >
      <path
        style={style}
        d={`m 7,78 c 0,-1.0732 -0.49529999999999996,-1.651 -1.4859200000000001,-1.651 h -9.24571 c -1.07316,0 -1.5684699999999998,0.578 -1.5684699999999998,1.651 0,1.0732 0.49529999999999996,1.651 1.5684699999999998,1.651 h 9.24571 c 0.9905999999999999,0 1.4859200000000001,-0.578 1.4859200000000001,-1.651 z m 6.02623,-9.5759 c 0,-1.0732 -0.49529999999999996,-1.651 -1.4859200000000001,-1.651 h -21.29816 c -1.07316,0 -1.5684699999999998,0.578 -1.5684699999999998,1.651 0,1.0731 0.49529999999999996,1.651 1.5684699999999998,1.651 h 21.29816 c 0.9905999999999999,0 1.4859200000000001,-0.578 1.4859200000000001,-1.651 z m 6.02622,-9.4934 c 0,-1.0732 -0.49529999999999996,-1.651 -1.4859200000000001,-1.651 h -33.43315 c -1.07317,0 -1.5684699999999998,0.578 -1.5684699999999998,1.651 0,1.0732 0.49529999999999996,1.651 1.5684699999999998,1.651 h 33.43315 c 0.9905999999999999,0 1.4859200000000001,-0.578 1.4859200000000001,-1.651 z m 6.02622,-9.4934 c 0,-1.1557 -0.49529999999999996,-1.7335 -1.4859200000000001,-1.7335 h -21.13305 v -29.3056 c 0,-0.9909999999999999 -0.5779,-1.4860000000000002 -1.65102,-1.4860000000000002 -1.07317,0 -1.65102,0.495 -1.65102,1.4860000000000002 v 29.3056 h -21.05051 c -1.07316,0 -1.5684699999999998,0.578 -1.5684699999999998,1.7335 0,1.0732 0.49529999999999996,1.6511 1.5684699999999998,1.6511 h 45.485600000000005 c 0.9905999999999999,0 1.4859200000000001,-0.578 1.4859200000000001,-1.6511 z`}
        id="path34608" />
    </g>
  )
}

function markerFor(specialNet: NetlistEntry, node: JumperlessNode, flip: boolean): React.ReactNode {
  if (specialNet.name === 'GND' && typeof node === 'number') {
    const [x, y] = markerPos(node, flip)
    return <GND key={node} color={specialNet.color} x={x} y={y} flip={flip} />
  }
  return null
}

function markerPos(row: JumperlessNode & number, flip: boolean): [number, number] {
  if (row <= 30) {
    return holePosTop(row, flip ? 0 : 4)
  } else {
    return holePosBottom(row, flip ? 4 : 0)
  }
}

function useRailswitchTooltip() {
  const [isOpen, setIsOpen] = useState(false)
  const arrowRef = useRef(null)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "left",
    whileElementsMounted: autoUpdate,
    middleware: [
      arrow({ element: arrowRef }),
      offset(5),
      flip({
        fallbackAxisSideDirection: "start"
      }),
      shift()
    ]
  });
  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role
  ]);

  return {
    arrow: <FloatingArrow ref={arrowRef} context={context} fill='#BF4040' />,
    isOpen,
    floatingStyles,
    refs,
    getReferenceProps,
    getFloatingProps,
  }
}

export default ImageBoardView
