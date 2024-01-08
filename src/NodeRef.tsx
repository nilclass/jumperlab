import React, { useCallback } from 'react'
import { JumperlessNode } from './jlctlapi'

type NodeRefProps = {
  node: JumperlessNode
  highlighted?: boolean
  onHover?: (node: JumperlessNode | null) => void
  onClick?: (node: JumperlessNode) => void
}

export const NodeRef: React.FC<NodeRefProps> = ({ node, highlighted, onHover, onClick }) => {
  const handleEnter = useCallback(() => onHover && onHover(node), [onHover, node])
  const handleLeave = useCallback(() => onHover && onHover(null), [onHover])
  const handleClick = useCallback(() => onClick && onClick(node), [onClick])
  return (
    <button className={`NodeRef ${highlighted ? 'highlight' : ''}`} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onClick={handleClick}>
      {node}
    </button>
  )
}
