import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react'
import { isEqual } from 'lodash'
import { AdjustRect, Rect, defaultRect, rectStyle } from './AdjustRect'
import { Board } from './Board'
import './BoardView.css'
import { useSetting } from './Settings'

export const BoardView: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [viewSize, setViewSize] = useState([100, 100])
  const [bgSize, setBgSize] = useState([100, 100])
  const [areaSize, setAreaSize] = useState([100, 100])
  const [adjust, setAdjust] = useState(false)
  const [boardRect, setBoardRect] = useSetting('boardRect', defaultRect)
  const viewRect = useMemo<Rect>(() => boardRect.map(([x, y]) => [areaSize[0] * x / bgSize[0], areaSize[1] * y / bgSize[1]]), [boardRect, areaSize, bgSize])
  const boardRectStyle = useMemo(() => ({
    ...rectStyle(viewRect),
  }), [viewRect])
  const toggleAdjust = () => setAdjust(!adjust)

  useEffect(() => {
    const viewRatio = viewSize[0] / viewSize[1]
    const bgRatio = bgSize[0] / bgSize[1]
    if (bgRatio > viewRatio) {
      setAreaSize([viewSize[0], viewSize[0] / bgRatio])
    } else {
      setAreaSize([viewSize[1] * bgRatio, viewSize[1]])
    }
  }, [viewSize, bgSize])

  function updateSize() {
    if (!ref.current) {
      return
    }
    const width = ref.current.offsetWidth
    const height = ref.current.offsetHeight
    if (width !== viewSize[0] || height !== viewSize[1]) {
      /* console.log('view size now ', width, height) */
      setViewSize([width, height])
    }
  }

  useLayoutEffect(updateSize)

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
    /* console.log('diff board', ...boardRect.map(([x1, y1], i) => {
*   const [x2, y2] = bgRect[i]
*   return [x2 - x1, y2 - y1]
* }))
* console.log('diff view', ...viewRect.map(([x1, y1], i) => {
*   const [x2, y2] = rect[i]
*   return [x2 - x1, y2 - y1]
* })) */
    setBoardRect(bgRect)
  }

  /* console.log(`TOP RIGHT:\n  BOARD RECT: ${boardRect[0].join(', ')}\n  VIEW RECT:  ${viewRect[0].join(', ')}`) */

  return (
    <div className='BoardView' ref={ref} data-adjust={adjust}>
      <div className='viewarea' style={{ width: areaSize[0], height: areaSize[1] }}>
        <CameraLayer onSizeChange={setBgSize} />
        {/* <BoardLayer />
            <ConnectionLayer /> */}
        <div className='boardrect adjust' style={boardRectStyle}>
          <Board onSegmentClick={() => {}} selected={null} />
        </div>
        {adjust && <AdjustRect rect={viewRect} onRectChange={handleBoardRectChange} />}
        <button className='adjust' onClick={toggleAdjust}>
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
