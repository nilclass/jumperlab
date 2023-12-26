import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react'
import { AdjustRect, Rect, defaultRect, rectStyle } from './AdjustRect'
import { Board } from './Board'
import './BoardView.css'
import { useSetting } from './Settings'

/**
 * BoardView shows a `Board`, on top of a background (e.g. camera feed).
 *
 * The position on the board can be adjusted with built-in controls.
 *
 * On top of the board, a connection layer will be shown.
 */
export const BoardView: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  // size of the view area (detected, changes on window resize)
  const [viewSize, setViewSize] = useState([100, 100])

  // size of the background (e.g. camera feed) in source coordinates (e.g. physical camera pixels)
  const [bgSize, setBgSize] = useState([100, 100])

  // size of the background in view coordinates. Depending on the ratios of the view and background,
  // either the width or the height of this will equal the one from viewSize. The respective other
  // coordinate is always smaller than the one from viewSize.
  const areaSize = useMemo(() => {
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

  return (
    <div className='BoardView' ref={ref} data-adjust={adjust}>
      <div className='viewarea' style={{ width: areaSize[0], height: areaSize[1] }}>
        <CameraLayer onSizeChange={setBgSize} />
        {/* <BoardLayer />
            <ConnectionLayer /> */}
        <div className='boardrect' style={boardRectStyle}>
          <Board onSegmentClick={() => {}} selected={null} />
        </div>
        {adjust && <AdjustRect rect={viewRect} onRectChange={handleBoardRectChange} />}
        <button className='adjust-button' onClick={() => setAdjust(!adjust)}>
          {adjust ? 'Done' : 'Change board position'}
        </button>
      </div>
    </div>
  )
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
