import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import './App.css';
import { Board } from './Board'
import { ConnectionWidget, ConnectionWrapper } from './connection';

const defaultRect: Rect = [
  [50, 50],
  [150, 50],
  [50, 150],
  [150, 150],
]

function restoreRect(): Rect | null {
  let loaded
  try {
    loaded = JSON.parse(localStorage.rect)
  } catch(e) {
    return null
  }
  return loaded as Rect
}

function App() {


  const videoRef = useRef<HTMLVideoElement>(null)
  const [rect, setRect] = useState<Rect>(restoreRect() || defaultRect)
  const [adjust, setAdjust] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [dialog, setDialog] = useState<React.ReactNode>(null)

  const handleRectChange = (rect: Rect) => {
    setRect(rect)
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(
      stream => {
        const v = videoRef.current!
        const track = stream.getVideoTracks()[0]
        const settings = track.getSettings()
        const ratio = settings.width! / settings.height!
        v.srcObject = stream
        const sRatio = v.offsetWidth / v.offsetHeight
        console.log('ratio', ratio, 'sRatio', sRatio)
      },
      (e) => console.log('no cam', e)
    )
  }, [])

  useEffect(() => {
    localStorage.rect = JSON.stringify(rect)
  }, [rect])

  const handleSegmentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const id = e.currentTarget.dataset.id!
    setSelected(selected => {
      if (selected) {
        /* const bridge = makeBridge(selected, id)
* jlctl.current!.addBridges([bridge]).then(() => console.log('bridge added')) */
      }
      return id
    })
  }, [])

  function openDialog(dialogComponent: React.FC<any>) {
    const Component = dialogComponent as React.FC<{ onClose: () => void }>
    setDialog(<Component onClose={() => { setDialog(null) }} />)
  }

  return (
    <ConnectionWrapper baseUrl='http://localhost:8080'>
      <ConnectionWidget pollIntervalMs={2000} />
      <div className="App" data-adjust={adjust}>
        <div className='toolbar'>
          <button onClick={() => setAdjust(adjust => !adjust)}>{adjust ? 'Done adjusting' : 'Adjust'}</button>
        </div>
        <video ref={videoRef} autoPlay />
        <div className='the-rect' style={rectStyle(rect)}>
          <Board onSegmentClick={handleSegmentClick} selected={selected} />
        </div>
        {adjust && <AdjustRect rect={rect} onRectChange={handleRectChange} />}
        {dialog}
      </div>
    </ConnectionWrapper>
  );
}

const ModalDialog: React.FC<{ className?: string, onClose: () => void, children: React.ReactNode }> = ({ children, className, onClose }) => {
  const ref = useRef<HTMLDialogElement>(null)

  useLayoutEffect(() => {
    ref.current!.showModal()
  }, [])

  return (
    <dialog className={`ModalDialog ${className || ''}`} ref={ref} onClose={onClose}>
      {children}
    </dialog>
  )
}

type M9 = [number, number, number,
           number, number, number,
           number, number, number]

type V3 = [number, number, number]

function adj(m: M9): M9 { // Compute the adjugate of m
  return [
    m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
    m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
    m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
  ];
}

function multmm(a: M9, b: M9): M9 { // multiply two matrices
  var c = Array(9) as M9;
  for (var i = 0; i !== 3; ++i) {
    for (var j = 0; j !== 3; ++j) {
      var cij = 0;
      for (var k = 0; k !== 3; ++k) {
        cij += a[3*i + k]*b[3*k + j];
      }
      c[3*i + j] = cij;
    }
  }
  return c;
}

function multmv(m: M9, v: V3): V3 { // multiply matrix and vector
  return [
    m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
    m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
    m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
  ];
}

function basisToPoints(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  var m: M9 = [
    x1, x2, x3,
    y1, y2, y3,
     1,  1,  1
  ];
  var v = multmv(adj(m), [x4, y4, 1]);
  return multmm(m, [
    v[0], 0, 0,
    0, v[1], 0,
    0, 0, v[2]
  ]);
}

function general2DProjection(
  x1s: number, y1s: number, x1d: number, y1d: number,
  x2s: number, y2s: number, x2d: number, y2d: number,
  x3s: number, y3s: number, x3d: number, y3d: number,
  x4s: number, y4s: number, x4d: number, y4d: number 
) {
  var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
  var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
  return multmm(d, adj(s));
}

function transform2d(w: number, h: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const t = general2DProjection(0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
  for(let i = 0; i != 9; ++i) t[i] = t[i]/t[8];
  const t2 = [t[0], t[3], 0, t[6],
       t[1], t[4], 0, t[7],
       0   , 0   , 1, 0   ,
       t[2], t[5], 0, t[8]];
  return "matrix3d(" + t2.join(", ") + ")";
}

function rectStyle(rect: Rect): React.CSSProperties {
  const [p0, p1, p2, p3] = rect
  return {
    width: 331,
    height: 189,
    transform: transform2d(331, 189, ...p0, ...p1, ...p2, ...p3)
  }
}

export default App;

type Rect = Array<[number, number]>

const AdjustRect: React.FC<{ rect: Rect, onRectChange: (r: Rect) => void }> = ({ rect, onRectChange }) => {
  const [dragging, setDragging] = useState<number | 'all' | null>(null)
  const [lastPointer, setLastPointer] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (dragging == null) {
      return
    }
    const handleMouseMove = (e: MouseEvent) => {
      const pt: [number, number] = [e.clientX, e.clientY]
      if (lastPointer) {
        if (typeof dragging === 'number') {
          const target = rect[dragging]
          onRectChange([
            ...rect.slice(0, dragging),
            [
              target[0] + pt[0] - lastPointer[0],
              target[1] + pt[1] - lastPointer[1],
            ],
            ...rect.slice(dragging+1),
          ])
        } else {
          onRectChange(rect.map(p => [
              p[0] + pt[0] - lastPointer[0],
              p[1] + pt[1] - lastPointer[1],
          ]))
        }
      }
      setLastPointer(pt)
    }

    function handleMouseUp() {
      setDragging(null)
      setLastPointer(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, lastPointer, rect])

  const cornerStyle = (point: [number, number]) => {
    return {
      left: `${point[0] - 8}px`,
      top: `${point[1] - 8}px`,
    }
  }

  return (
    <div className='AdjustRect'>
      {rect.map((point: [number, number], i: number) => (
        <div key={i}
          className='corner'
          data-dragging={dragging === i}
          style={cornerStyle(point)}
          onMouseDown={(e) => {
            if (e.button === 0) {
              setDragging(i)
            }
          }}
        />
      ))}
      <div className='move-handle'
        style={moveHandleStyle(rect)}
        onMouseDown={(e) => {
          if (e.button === 0) {
            setDragging('all')
          }
        }}
      />
    </div>
  )
}

function moveHandleStyle(rect: Rect): React.CSSProperties {
  const x = rect.reduce((s, p) => s + p[0], 0) / 4
  const y = rect.reduce((s, p) => s + p[1], 0) / 4
  return {
    left: x - 8,
    top: y - 8,
  }
}
