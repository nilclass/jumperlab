import React, { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback, useContext } from 'react'
import { AdjustRect, Rect, defaultRect, rectStyle } from './AdjustRect'
import { Board } from './Board'
import './BoardView.css'
import { ConnectionContext } from './connection'
import { JumperlessNode } from './jlctlapi'
import { useSetting } from './Settings'

type BoardViewProps = {
  selectedNode: JumperlessNode | null
  onNodeClick: (node: JumperlessNode | null) => void
}

type BoardViewMode = 'image' | 'camera' | 'blank'

export const BoardViewModeSelect = () => {
  const [mode, setMode] = useSetting('boardViewMode', 'image')

  return (
    <div className='BoardViewModeSelect'>
      <strong>Board view mode: </strong>
      <RadioGroup options={[
        { value: 'image', label: '🖼️', title: 'Image' },
        { value: 'camera', label: '📹', title: 'Camera' },
        { value: 'blank', label: '▢', title: 'Blank' },
      ]} name='boardViewMode' value={mode} onChange={setMode} />
    </div>
  )
}

type RadioGroupProps = {
  name: string
  value: string
  options: Array<{
    value: string
    label: React.ReactNode
    title: string
  }>
  onChange: (value: string) => void
}

const RadioGroup: React.FC<RadioGroupProps> = ({ name, value, options, onChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value)
  }, [onChange])
  return (
    <div className='RadioGroup'>
      {options.map(opt => (
        <label className='option' data-checked={opt.value === value} key={opt.value} title={opt.title}>
          {opt.label}
          <input type='radio' name={name} value={opt.value} checked={opt.value === value} onChange={handleChange} />
        </label>
      ))}
    </div>
  )
}

/**
 * BoardView shows a `Board`, on top of a background (e.g. camera feed).
 *
 * The position on the board can be adjusted with built-in controls.
 *
 * On top of the board, a connection layer will be shown.
 */
export const BoardView: React.FC<BoardViewProps> = ({ selectedNode, onNodeClick }) => {
  const [mode, setMode] = useSetting('boardViewMode', 'image')
  const ref = useRef<HTMLDivElement>(null)
  // size of the view area (detected, changes on window resize)
  const [viewSize, setViewSize] = useState([100, 100])

  // size of the background (e.g. camera feed) in source coordinates (e.g. physical camera pixels)
  const [bgSize, setBgSize] = useState([100, 100])

  // size of the background in view coordinates. Depending on the ratios of the view and background,
  // either the width or the height of this will equal the one from viewSize. The respective other
  // coordinate is always smaller than the one from viewSize.
  const areaSize = useMemo<[number, number]>(() => {
    const viewRatio = viewSize[0] / viewSize[1]
    const bgRatio = bgSize[0] / bgSize[1]
    if (bgRatio > viewRatio) {
      return [viewSize[0], viewSize[0] / bgRatio]
    } else {
      return [viewSize[1] * bgRatio, viewSize[1]]
    }
  }, [viewSize, bgSize])

  // True, while adjusting the board rect
  const [adjust, setAdjust] = useState(false)

  // Four corners of the board in source coordinates
  const [boardRect, setBoardRect] = useSetting('boardRect', defaultRect)

  // Four corners of the board in view coordinates (relative to `.viewarea`)
  const viewRect = useMemo<Rect>(() => boardRect.map(([x, y]) => [areaSize[0] * x / bgSize[0], areaSize[1] * y / bgSize[1]]), [boardRect, areaSize, bgSize])

  // Applies 3D transform placing the board at the right position on the camera feed
  const boardRectStyle = useMemo(() => rectStyle(viewRect), [viewRect])

  const selectedSegment = useMemo(() => nodeToSegment(selectedNode), [selectedNode])

  const [pinOverlay, setPinOverlay] = useState(true)

  function updateSize() {
    if (!ref.current) {
      return
    }
    const width = ref.current.offsetWidth
    const height = ref.current.offsetHeight
    if (width !== viewSize[0] || height !== viewSize[1]) {
      setViewSize([width, height])
    }
  }

  // Check if view size is still correct after rendering
  useLayoutEffect(updateSize)

  // Update view size whenever window is resized
  useEffect(() => {
    function handleResize() {
      updateSize()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleBoardRectChange = (rect: Rect) => {
    // translate view coordinates to background (camera) coordinates
    const bgRect: Rect = rect.map(([x, y]) => [bgSize[0] * x / areaSize[0], bgSize[1] * y / areaSize[1]])
    setBoardRect(bgRect)
  }

  const handleSegmentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (adjust) {
      // ignore interactions with the board while adjusting the view
      return
    }

    const segmentId = e.currentTarget.dataset.id
    if (!segmentId) {
      throw new Error('BUG: click on segment with no segment ID')
    }

    onNodeClick(segmentToNode(segmentId))
  }, [adjust, selectedSegment, onNodeClick])

  return (
    <div className='BoardView' ref={ref} data-adjust={adjust} data-pin-overlay={pinOverlay}>
      <div className='viewarea' style={{ width: areaSize[0], height: areaSize[1] }}>
        {mode === 'camera'
        ? <CameraLayer onSizeChange={setBgSize} />
    : mode === 'image'
    ? <ImageLayer onSizeChange={setBgSize} />
          : <BlankLayer onSizeChange={setBgSize} />}
        <div className='boardrect' style={boardRectStyle}>
          <Board onSegmentClick={handleSegmentClick} selected={selectedSegment} />
          <ConnectionLayer />
        </div>
        {adjust && <AdjustRect rect={viewRect} onRectChange={handleBoardRectChange} />}
        <div className='buttons'>
          <button className='adjust-button' onClick={() => setAdjust(!adjust)}>
            {adjust ? 'Done' : 'Change board position'}
          </button>
          <button onClick={() => setPinOverlay(!pinOverlay)}>
            Toggle pin overlay
          </button>
        </div>
      </div>
    </div>
  )
}

function segmentToNode(segment: string | null): JumperlessNode | null {
  if (segment === null) {
    return null
  }
  if (segment.match(/^\d+$/)) {
    return parseInt(segment, 10) as JumperlessNode
  }
  console.warn(`Unhandled: ${segment}`)
  return null
}

function nodeToSegment(node: JumperlessNode | null): string | null {
  if (node === null) {
    return null
  }
  return node.toString()
}

const BlankLayer: React.FC<{ onSizeChange: (size: [number, number]) => void }> = ({ onSizeChange }) => {
  return null
}


const ImageLayer: React.FC<{ onSizeChange: (size: [number, number]) => void }> = ({ onSizeChange }) => {
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    onSizeChange([e.currentTarget.offsetWidth, e.currentTarget.offsetHeight])
  }
  return <img src="images/default-board-pic.jpg" onLoad={handleLoad} />
}

const CameraLayer: React.FC<{ onSizeChange: (size: [number, number]) => void }> = ({ onSizeChange }) => {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(
      stream => {
        const video = ref.current!
        const track = stream.getVideoTracks()[0]
        const settings = track.getSettings()
        video.srcObject = stream
        onSizeChange([settings.width!, settings.height!])
      },
      (e) => console.log('no cam')
    )
  }, [])
  
  return (
    <video ref={ref} autoPlay />
  )
}

const ConnectionLayer: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const { bridges, netlist } = useContext(ConnectionContext)!

  useLayoutEffect(() => {
    const segmentBridges = bridges
      .map(([a, b]): DrawableBridge | null => {
        const aSegment = nodeToSegment(a)
        const bSegment = nodeToSegment(b)
        if (aSegment === null || bSegment === null) {
          return null
        }
        //const color
        return {
          segments: [aSegment, bSegment],
          color: 'blue',
        }
      })
      .filter(x => x !== null) as Array<DrawableBridge>
    drawConnections(ref.current!, segmentBridges)
  }, [bridges])

  return (
    <canvas className='ConnectionLayer' ref={ref} width={331} height={189} />
  )
}

type DrawableBridge = { segments: [string, string], color: string }

function drawConnections(canvas: HTMLCanvasElement, bridges: Array<DrawableBridge>) {
  const c = canvas.getContext('2d')
  if (!c) {
    throw new Error('Failed to get 2D drawing context')
  }
  c.clearRect(0, 0, canvas.width, canvas.height)

  for (const { segments: [aId, bId], color } of bridges) {
    const a = document.querySelector<HTMLDivElement>(`.Segment[data-id="${aId}"]`)
    const b = document.querySelector<HTMLDivElement>(`.Segment[data-id="${bId}"]`)

    if (!a) {
      throw new Error(`Segment not found: ${aId}`)
    }
    if (!b) {
      throw new Error(`Segment not found: ${bId}`)
    }

    const aPt = [a.offsetLeft + a.offsetWidth / 2,
                 a.offsetTop + a.offsetHeight / 2]
    const bPt = [b.offsetLeft + b.offsetWidth / 2,
                 b.offsetTop + b.offsetHeight / 2]

    c.save()
    //c.strokeStyle = '#f74599'
    c.strokeStyle = color
    c.lineWidth = 3

    c.beginPath()
    c.moveTo(aPt[0], aPt[1])
    c.lineTo(bPt[0], bPt[1])
    c.stroke()
  }
}
