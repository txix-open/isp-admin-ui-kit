import { useContext, useId, useLayoutEffect, useRef } from 'react'

import {
  GuardLocation,
  UnsavedChangesContext
} from '@components/UnsavedChangesProvider'

interface Options {
  dirty: boolean
  busy?: boolean
  label: string
  overlay?: boolean
  overlayParam?: string
}

const useUnsavedChanges = ({
  dirty,
  busy = false,
  label,
  overlay = false,
  overlayParam = 'create'
}: Options) => {
  const context = useContext(UnsavedChangesContext)
  if (!context) throw new Error('Editors require UnsavedChangesProvider')
  const id = useId()
  const latest = useRef({ dirty, busy, label, overlay, overlayParam })
  const bypassed = useRef(false)
  if (!dirty && !busy) bypassed.current = false
  latest.current = { dirty, busy, label, overlay, overlayParam }
  const { register, notify, requestLeave } = context
  useLayoutEffect(
    () =>
      register({
        id,
        label: () => latest.current.label,
        active: () =>
          !bypassed.current && (latest.current.dirty || latest.current.busy),
        busy: () => latest.current.busy,
        blocks: (current: GuardLocation, next: GuardLocation) =>
          current.pathname !== next.pathname ||
          (latest.current.overlay &&
            new URLSearchParams(current.search).get(
              latest.current.overlayParam
            ) !==
              new URLSearchParams(next.search).get(
                latest.current.overlayParam
              )),
        bypass: () => {
          bypassed.current = true
        },
        restore: () => {
          bypassed.current = false
        }
      }),
    [id, register]
  )
  useLayoutEffect(() => {
    notify()
  }, [dirty, busy, notify])
  return {
    requestLeave: (action: () => void) => requestLeave(id, action),
    markSaved: () => {
      bypassed.current = true
      notify()
    }
  }
}

export default useUnsavedChanges
