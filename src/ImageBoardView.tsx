import React, { useContext, useMemo, useRef, useState } from "react"
import { JumperlessStateContext } from './JumperlessState'
import { SupplySwitchPos } from "./jlctlapi"
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

const ROW_PATHS = [
  "M407.19788 1450.7103H486.940151V2014.0357399999998H407.19788z",
  "M486.94028 1450.7103H566.682551V2014.0357399999998H486.94028z",
  "M566.68262 1450.7103H646.424891V2014.0357399999998H566.68262z",
  "M646.42456 1450.7103H726.166831V2014.0357399999998H646.42456z",
  "M726.16718 1450.7103H805.909451V2014.0357399999998H726.16718z",
  "M805.9093 1450.7103H885.651571V2014.0357399999998H805.9093z",
  "M885.65149 1450.7103H965.3937609999999V2014.0357399999998H885.65149z",
  "M965.39386 1450.7103H1045.136131V2014.0357399999998H965.39386z",
  "M1045.1365 1450.7103H1124.8787710000001V2014.0357399999998H1045.1365z",
  "M1124.8782 1450.7103H1204.6204710000002V2014.0357399999998H1124.8782z",
  "M1204.6207 1450.7103H1284.362971V2014.0357399999998H1204.6207z",
  "M1284.3629 1450.7103H1364.1051710000002V2014.0357399999998H1284.3629z",
  "M1364.105 1450.7103H1443.847271V2014.0357399999998H1364.105z",
  "M1443.8474 1450.7103H1523.5896710000002V2014.0357399999998H1443.8474z",
  "M1523.5897 1450.7103H1603.331971V2014.0357399999998H1523.5897z",
  "M1603.332 1450.7103H1683.0742710000002V2014.0357399999998H1603.332z",
  "M1683.0741 1450.7103H1762.8163710000001V2014.0357399999998H1683.0741z",
  "M1762.8163 1450.7103H1842.558571V2014.0357399999998H1762.8163z",
  "M1842.5588 1450.7103H1922.301071V2014.0357399999998H1842.5588z",
  "M1922.3011 1450.7103H2002.043371V2014.0357399999998H1922.3011z",
  "M2002.0427 1450.7103H2081.784971V2014.0357399999998H2002.0427z",
  "M2081.7854 1450.7103H2161.5276710000003V2014.0357399999998H2081.7854z",
  "M2161.5281 1450.7103H2241.270371V2014.0357399999998H2161.5281z",
  "M2241.27 1450.7103H2321.012271V2014.0357399999998H2241.27z",
  "M2321.0122 1450.7103H2400.754471V2014.0357399999998H2321.0122z",
  "M2400.7549 1450.7103H2480.497171V2014.0357399999998H2400.7549z",
  "M2480.4963 1450.7103H2560.238571V2014.0357399999998H2480.4963z",
  "M2560.2393 1450.7103H2639.9815710000003V2014.0357399999998H2560.2393z",
  "M2639.9817 1450.7103H2719.723971V2014.0357399999998H2639.9817z",
  "M2719.7236 1450.7103H2799.465871V2014.0357399999998H2719.7236z",
  "M407.19788 2153.8367H486.940151V2717.16214H407.19788z",
  "M486.94028 2153.8367H566.682551V2717.16214H486.94028z",
  "M566.68256 2153.8367H646.4248309999999V2717.16214H566.68256z",
  "M646.4245 2153.8367H726.1667709999999V2717.16214H646.4245z",
  "M726.16711 2153.8367H805.9093809999999V2717.16214H726.16711z",
  "M805.90924 2153.8367H885.6515109999999V2717.16214H805.90924z",
  "M885.65143 2153.8367H965.393701V2717.16214H885.65143z",
  "M965.39386 2153.8367H1045.136131V2717.16214H965.39386z",
  "M1045.1365 2153.8367H1124.8787710000001V2717.16214H1045.1365z",
  "M1124.8782 2153.8367H1204.6204710000002V2717.16214H1124.8782z",
  "M1204.6207 2153.8367H1284.362971V2717.16214H1204.6207z",
  "M1284.3629 2153.8367H1364.1051710000002V2717.16214H1284.3629z",
  "M1364.105 2153.8367H1443.847271V2717.16214H1364.105z",
  "M1443.8473 2153.8367H1523.589571V2717.16214H1443.8473z",
  "M1523.5896 2153.8367H1603.331871V2717.16214H1523.5896z",
  "M1603.3319 2153.8367H1683.074171V2717.16214H1603.3319z",
  "M1683.074 2153.8367H1762.8162710000001V2717.16214H1683.074z",
  "M1762.8163 2153.8367H1842.558571V2717.16214H1762.8163z",
  "M1842.5588 2153.8367H1922.301071V2717.16214H1842.5588z",
  "M1922.3011 2153.8367H2002.043371V2717.16214H1922.3011z",
  "M2002.0427 2153.8367H2081.784971V2717.16214H2002.0427z",
  "M2081.7852 2153.8367H2161.527471V2717.16214H2081.7852z",
  "M2161.5278 2153.8367H2241.270071V2717.16214H2161.5278z",
  "M2241.27 2153.8367H2321.012271V2717.16214H2241.27z",
  "M2321.012 2153.8367H2400.7542710000002V2717.16214H2321.012z",
  "M2400.7549 2153.8367H2480.497171V2717.16214H2400.7549z",
  "M2480.4961 2153.8367H2560.238371V2717.16214H2480.4961z",
  "M2560.239 2153.8367H2639.981271V2717.16214H2560.239z",
  "M2639.9817 2153.8367H2719.723971V2717.16214H2639.9817z",
  "M2719.7236 2153.8367H2799.465871V2717.16214H2719.7236z"
]

const ImageBoardView: React.FC = () => {
  const { supplySwitchPos, setSupplySwitchPos } = useContext(JumperlessStateContext)
  const { handleNodeClick, selectedNode } = useContext(InteractionContext)!

  const switchDiff = useMemo(() => {
    return (SWITCH_OPTS.indexOf(supplySwitchPos) - 1) * 55
  }, [supplySwitchPos])

  function cycleSwitchPos() {
    const i = (SWITCH_OPTS.indexOf(supplySwitchPos) + 1) % SWITCH_OPTS.length
    setSupplySwitchPos(SWITCH_OPTS[i])
  }

  const { arrow, refs, getReferenceProps, getFloatingProps, isOpen, floatingStyles } = useRailswitchTooltip()

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const id = (e.target as HTMLElement).id

    if (id) {
      const rowMatch = id.match(/^row(\d+)$/)
      if (rowMatch) {
        const row = parseInt(rowMatch[1], 10)
        handleNodeClick(row)
        return
      }

      if (['tNeg', 'bNeg', 'ngnd0', 'ngnd1'].includes(id)) {
        handleNodeClick('GND')
        return
      }

      if (id === 'n5v') {
        handleNodeClick('5V')
        return
      }

      const nanoMatch = id.match(/^(a|d)(\d+)$/)
      if (nanoMatch) {
        handleNodeClick(id.toUpperCase())
        return
      }
    }
    handleNodeClick(null)
  }

  const rows = ROW_PATHS.map((path, i) => {
    const row = i + 1
    return (
      <path
        key={row}
      id={`row${row}`}
        className={`row ${selectedNode === row ? 'selected' : ''}`}
        d={path}
      />
    )
  })


  return (
    <div className="ImageBoardView">
      <SelectionInfo />
      <svg
        viewBox="0 0 3200 3200"
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid"
        onClick={handleClick}
      >
        <g id="g1">
          <g id="nanoHeader">
            <rect
              className='nanoPin'
              id="d12"
              width={81.971809}
              height={256.60733}
              x={988.57129}
              y={367.09097}
              ry={0.37795275}
            />
            <rect
              className='nanoPin'
              id="d11"
              width={76.847221}
              height={256.61069}
              x={1072.5413}
              y={367.08929}
              ry={0.3779577}
            />
            <rect
              className='nanoPin'
              id="d10"
              width={80.893265}
              height={256.60803}
              x={1151.3864}
              y={367.09061}
              ry={0.3779538}
            />
            <rect
              className='nanoPin'
              id="d9"
              width={72.591599}
              height={256.61356}
              x={1234.9969}
              y={367.08783}
              ry={0.37796193}
            />
            <rect
              className='nanoPin'
              id="d8"
              width={76.227379}
              height={256.61111}
              x={1312.9922}
              y={367.08908}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="d7"
              width={78.049431}
              height={256.60989}
              x={1392.625}
              y={367.08969}
              ry={0.37795654}
            />
            <rect
              className='nanoPin'
              id="d6"
              width={76.227379}
              height={256.61111}
              x={1474.8103}
              y={367.08908}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="d5"
              width={76.227379}
              height={256.61111}
              x={1555.173}
              y={367.08908}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="d4"
              width={76.227379}
              height={256.61111}
              x={1633.5356}
              y={367.08908}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="d3"
              width={76.227379}
              height={256.61111}
              x={1711.8983}
              y={367.08908}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="d2"
              width={76.227379}
              height={256.61111}
              x={1790.261}
              y={367.08908}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="ngnd0"
              width={84.595268}
              height={256.60565}
              x={1868.7933}
              y={367.0918}
              ry={0.37795028}
            />
            <rect
              className='nanoPin'
              id="rst1"
              width={76.227379}
              height={256.61111}
              x={1955.6936}
              y={367.08905}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="d0"
              width={76.227379}
              height={256.61111}
              x={2034.2233}
              y={367.08905}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="d1"
              width={76.227379}
              height={256.61111}
              x={2112.7529}
              y={367.08905}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="d13"
              width={78.98185}
              height={256.60928}
              x={988.57031}
              y={952.03479}
              ry={0.37795562}
            />
            <rect
              className='nanoPin'
              id="n3v3"
              width={79.837097}
              height={256.6087}
              x={1069.5504}
              y={952.0351}
              ry={0.37795478}
            />
            <rect
              className='nanoPin'
              id="aref"
              width={86.024788}
              height={256.60474}
              x={1151.3879}
              y={952.03705}
              ry={0.37794897}
            />
            <rect
              className='nanoPin'
              id="a0"
              width={68.180794}
              height={256.61664}
              x={1239.4093}
              y={952.03113}
              ry={0.37796646}
            />
            <rect
              className='nanoPin'
              id="a1"
              width={76.227379}
              height={256.61111}
              x={1312.9922}
              y={952.03387}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="a2"
              width={78.049431}
              height={256.60989}
              x={1392.625}
              y={952.03448}
              ry={0.37795654}
            />
            <rect
              className='nanoPin'
              id="a3"
              width={76.227379}
              height={256.61111}
              x={1474.8103}
              y={952.03387}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="a4"
              width={76.227379}
              height={256.61111}
              x={1633.5355}
              y={952.03387}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="a5"
              width={76.227379}
              height={256.61111}
              x={1555.173}
              y={952.03387}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="a6"
              width={76.227379}
              height={256.61111}
              x={1711.8983}
              y={952.03387}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="a7"
              width={76.227379}
              height={256.61111}
              x={1790.2609}
              y={952.03387}
              ry={0.37795833}
            />
            <rect
              className='nanoPin'
              id="n5v"
              width={84.595268}
              height={256.60565}
              x={1868.7933}
              y={952.03662}
              ry={0.37795028}
            />
            <rect
              className='nanoPin'
              id="rst0"
              width={70.018097}
              height={256.61536}
              x={1955.6914}
              y={952.03174}
              ry={0.37796459}
            />
            <rect
              className='nanoPin'
              id="ngnd1"
              width={82.436722}
              height={256.60703}
              x={2028.0118}
              y={952.03589}
              ry={0.37795234}
            />
            <rect
              className='nanoPin'
              id="vin"
              width={76.227379}
              height={256.61111}
              x={2112.7529}
              y={952.03387}
              ry={0.37795833}
            />
          </g>
          <g id="rails">
            <rect
              className='rail'
              id="tPos"
              width={2514.6069}
              height={85.783966}
              x={347.19583}
              y={1278.9934}
              ry={0.31750244}
            />
            <rect
              className='rail'
              id="tNeg"
              width={2514.6069}
              height={85.783966}
              x={347.19583}
              y={1364.8767}
              ry={0.31750244}
            />
            <rect
              className='rail'
              id="bPos"
              width={2514.6069}
              height={85.783966}
              x={349.44824}
              y={2717.2117}
              ry={0.31750244}
            />
            <rect
              className='rail'
              id="bNeg"
              width={2514.6069}
              height={85.783966}
              x={349.44824}
              y={2803.095}
              ry={0.31750244}
            />
          </g>
          <g id="Rows">{rows}</g>
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
            xlinkHref="/images/board-background.png"
            id="image1"
            x={0}
            y={-0.00001924485}
          />
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

