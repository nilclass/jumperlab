import React, { useState, useRef, useContext, useLayoutEffect, useCallback } from 'react'

type DialogContextType = {
  openDialog: (dialog: React.ReactNode) => void
  closeDialog: () => void
}

const DialogContext = React.createContext<DialogContextType | null>(null)

export const DialogWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<React.ReactNode>(null)
  const closeDialog = useCallback(() => setDialog(null), [setDialog])

  return (
    <DialogContext.Provider value={{ openDialog: setDialog, closeDialog}}>
      {dialog}
      {children}
    </DialogContext.Provider>
  )
}

export const useOpenDialog = () => {
  const { openDialog } = useContext(DialogContext)!
  return (dialog: React.ReactNode, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    openDialog(dialog)
  }
}

export const ModalDialog: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDialogElement>(null)
  const { closeDialog } = useContext(DialogContext)!
  const [firstRender, setFirstRender] = useState(false)

  useLayoutEffect(() => {
    ref.current!.showModal()
  }, [])

  useLayoutEffect(() => {
    if (!firstRender) {
      setFirstRender(true)
      return
    }

    function handleBodyClick(e: MouseEvent) {
      const rect = ref.current!.getBoundingClientRect()
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        closeDialog()
      }
    }
 
    document.body.addEventListener('click', handleBodyClick)
    return () => document.body.removeEventListener('click', handleBodyClick)
   }, [firstRender, closeDialog])
  
  return (
    <dialog className={className || ''} ref={ref} onClose={closeDialog}>
      <button className='with-icon' onClick={closeDialog} style={{ float: 'right' }}>
        Close
        <div className='icon'>×</div>
      </button>
      {children}
    </dialog>
  )
}
