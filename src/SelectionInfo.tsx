import React, { useContext, useMemo, useRef, forwardRef, RefAttributes } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { InteractionContext } from './interaction'
import { JumperlessNode, NetlistEntry } from './jlctlapi'
import { JumperlessStateContext } from './JumperlessState'
import { NodeRef } from './NodeRef'
import './SelectionInfo.scss'

export const SelectionInfo: React.FC = () => {
  const { netlist } = useContext(JumperlessStateContext)
  const { selectedNode } = useContext(InteractionContext)!
  const net = useMemo(() => selectedNode ? netlist.find(net => net.nodes.includes(selectedNode)) || null : null, [selectedNode, netlist])
  const ref = useRef<HTMLDivElement>(null)

  return (
    <TransitionGroup>
      {selectedNode && (
        <CSSTransition nodeRef={ref} classNames='SelectionInfo' timeout={200}>
          <SelectionInfoInner selectedNode={selectedNode} net={net} ref={ref} />
        </CSSTransition>
      )}
    </TransitionGroup>
  )
}

type SelectionInfoInnerProps = {
  selectedNode: JumperlessNode
  net: NetlistEntry | null
} & RefAttributes<HTMLDivElement>

const SelectionInfoInner: React.ForwardRefExoticComponent<SelectionInfoInnerProps> = forwardRef(({ selectedNode, net }, ref) => {
  return (
    <div className='SelectionInfo' ref={ref}>
      <div>
        <strong>Selected node: </strong>
        <NodeRef node={selectedNode} />
      </div>

      <div>
        <strong>Net: </strong>
        {net ? (
          <em>{net.name}</em>
        ) : <em>(none)</em>}
      </div>
    </div>
  )
})
