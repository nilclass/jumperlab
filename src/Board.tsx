import React, { useContext } from 'react'
import './Board.scss'

type BoardContextType = {
  onSegmentClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onSegmentHover: (e: React.MouseEvent<HTMLDivElement>) => void
  selected: string | null
  highlighted: Array<number>
}

const BoardContext = React.createContext<BoardContextType | null>(null)

type BoardProps = BoardContextType

export const Board: React.FC<BoardProps> = ({ onSegmentClick, onSegmentHover, selected, highlighted }) => {
  return (
    <BoardContext.Provider value={{ onSegmentClick, onSegmentHover, selected, highlighted }}>
      <div className='Board'>
        <PowerRow net='5V' labelPos='top' />
        <PowerRow net='GND' labelPos='bottom' />
        <MainBlock first={1} last={30} labelPos='top' highlighted={highlighted} />
        <MainBlock first={31} last={60} labelPos='bottom' highlighted={highlighted} />
        <PowerRow net='5V' labelPos='top' />
        <PowerRow net='GND' labelPos='bottom' />
      </div>
    </BoardContext.Provider>
    
  )
}

export const PowerRow: React.FC<{ net: string, labelPos: string }> = React.memo(({ net, labelPos }) => {
  const segments = []
  for (let i = 0; i < 5; i++) {
    segments.push(<Segment id={net} key={i} horizontal label={net} labelPos={labelPos} />)
  }
  return (
    <div className='PowerRow'>{segments}</div>
  )
})

type SegmentProps = {
  label?: string
  labelPos?: string
  id: string
  highlight?: boolean
} & (
  { horizontal: true, vertical?: never } |
  { horizontal?: never, vertical: true }
)

export const Segment: React.FC<SegmentProps> = React.memo(({ id, horizontal, label, labelPos = 'top', highlight }) => {
  const { onSegmentClick, onSegmentHover, selected } = useContext<BoardContextType | null>(BoardContext)!;
  const pins = []
  for (let i = 0; i < 5; i++) {
    pins.push(<div className='pin' key={i} />)
  }
  return (
    <div className={`Segment ${horizontal ? 'horizontal' : 'vertical'} label-pos-${labelPos} ${selected === id ? 'selected' : ''} ${highlight ? 'highlight' : ''}`}
      data-id={id} onClick={onSegmentClick} onMouseEnter={onSegmentHover} onMouseLeave={onSegmentHover}>
      {label && <div className='label'>{label}</div>}
      {pins}
    </div>
  )
})

export const MainBlock: React.FC<{ first: number, last: number, labelPos: string, highlighted: Array<number> }> = ({ first, last, labelPos, highlighted }) => {
  if (first > last) {
    throw new Error('BUG!')
  }
  const columns = []
  for (let i = first; i <= last; i++) {
    columns.push(<Segment key={i} vertical label={String(i)} labelPos={labelPos} id={String(i)} highlight={highlighted.includes(i)} />)
  }
  return (
    <div className='MainBlock'>
      {columns}
    </div>
  )
}
