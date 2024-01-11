import React, { useEffect, useRef } from 'react'
import { computePosition, flip, offset, shift } from '@floating-ui/react'
import './CursorModeIndicator.scss'

export const CursorModeIndicator: React.FC<{ hint: string }> = ({ hint }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseMove({ clientX, clientY }: MouseEvent) {
      const virtualEl = {
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: clientX,
            y: clientY,
            left: clientX,
            right: clientX,
            top: clientY,
            bottom: clientY
          }
        }
      }

      if (ref.current) {
        computePosition(virtualEl, ref.current, {
          placement: "right-start",
          middleware: [offset(10), flip(), shift()]
        }).then(({ x, y }) => {
          if (ref.current) {
            Object.assign(ref.current.style, {
              top: `${y}px`,
              left: `${x}px`
            });
          }
        });
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [hint])

  return (
    <div className='CursorModeIndicator' ref={ref}>{hint}</div>
  )
}
