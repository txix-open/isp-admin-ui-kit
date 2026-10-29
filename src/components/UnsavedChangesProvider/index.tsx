import { Button } from 'antd'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Location,
  UNSAFE_DataRouterContext,
  useBlocker,
  useLocation
} from 'react-router-dom'

import Modal from '@widgets/Modal'

export type GuardLocation = Pick<Location, 'pathname' | 'search'>
export interface UnsavedEntry {
  id: string
  label: () => string
  active: () => boolean
  busy: () => boolean
  blocks: (current: GuardLocation, next: GuardLocation) => boolean
  bypass: () => void
  restore: () => void
}
interface LocalRequest {
  ids: string[]
  action: () => void
}
interface RouteRequest {
  current: GuardLocation
  next: GuardLocation
  proceed: () => void
  reset: () => void
}
interface GuardContextType {
  register: (entry: UnsavedEntry) => () => void
  notify: () => void
  requestLeave: (id: string, action: () => void) => void
}
export const UnsavedChangesContext = createContext<GuardContextType | null>(
  null
)

const RouteGuard = ({
  entries,
  onRequest
}: {
  entries: React.MutableRefObject<Map<string, UnsavedEntry>>
  onRequest: (request: RouteRequest | null) => void
}) => {
  const current = useLocation()
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    Array.from(entries.current.values()).some(
      (entry) => entry.active() && entry.blocks(currentLocation, nextLocation)
    )
  )
  const blockerRef = useRef(blocker)
  blockerRef.current = blocker
  useEffect(() => {
    onRequest(
      blocker.state === 'blocked'
        ? {
            current,
            next: blocker.location,
            proceed: () => {
              if (blockerRef.current.state === 'blocked')
                blockerRef.current.proceed()
            },
            reset: () => {
              if (blockerRef.current.state === 'blocked')
                blockerRef.current.reset()
            }
          }
        : null
    )
  }, [blocker, current, onRequest])
  return null
}

/** One router blocker for all mounted editors, including forms layered over another draft. */
const UnsavedChangesProvider = ({ children }: { children: ReactNode }) => {
  const entries = useRef(new Map<string, UnsavedEntry>())
  const [version, setVersion] = useState(0)
  const [localRequest, setLocalRequest] = useState<LocalRequest | null>(null)
  const [routeRequest, setRouteRequest] = useState<RouteRequest | null>(null)
  const localRequestRef = useRef<LocalRequest | null>(null)
  const dataRouter = useContext(UNSAFE_DataRouterContext)
  const notify = useCallback(() => setVersion((value) => value + 1), [])
  const register = useCallback(
    (entry: UnsavedEntry) => {
      entries.current.set(entry.id, entry)
      notify()
      return () => {
        entries.current.delete(entry.id)
        notify()
      }
    },
    [notify]
  )
  const requestLeave = useCallback((id: string, action: () => void) => {
    const entry = entries.current.get(id)
    if (!entry?.active()) {
      action()
      return
    }
    if (localRequestRef.current) return
    const request = { ids: [id], action }
    localRequestRef.current = request
    setLocalRequest(request)
  }, [])
  const context = useMemo(
    () => ({ register, notify, requestLeave }),
    [register, notify, requestLeave]
  )

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!Array.from(entries.current.values()).some((entry) => entry.active()))
        return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [])

  const affected = Array.from(entries.current.values()).filter(
    (entry) =>
      entry.active() &&
      (routeRequest
        ? entry.blocks(routeRequest.current, routeRequest.next)
        : localRequest?.ids.includes(entry.id))
  )
  const saving = affected.some((entry) => entry.busy())
  const pending = Boolean(routeRequest || localRequest)
  const clearLocal = () => {
    localRequestRef.current = null
    setLocalRequest(null)
  }
  const cancel = () => {
    routeRequest?.reset()
    setRouteRequest(null)
    clearLocal()
  }
  const leave = () => {
    if (saving) return
    const route = routeRequest
    const local = localRequest
    clearLocal()
    setRouteRequest(null)
    if (route) route.proceed()
    else if (local) {
      affected.forEach((entry) => entry.bypass())
      try {
        local.action()
      } finally {
        queueMicrotask(() => affected.forEach((entry) => entry.restore()))
      }
    }
  }

  // A successful save or a reverted draft can resolve a pending transition without another prompt.
  useEffect(() => {
    if (!pending || affected.length) return
    const route = routeRequest
    const local = localRequest
    localRequestRef.current = null
    setLocalRequest(null)
    setRouteRequest(null)
    if (route) route.proceed()
    else if (local?.ids.some((id) => entries.current.has(id))) local.action()
  }, [version, pending, affected.length, localRequest, routeRequest])

  return (
    <UnsavedChangesContext.Provider value={context}>
      {dataRouter && (
        <RouteGuard entries={entries} onRequest={setRouteRequest} />
      )}
      {children}
      <Modal
        open={pending && affected.length > 0}
        title="Есть несохранённые изменения"
        onClose={cancel}
        actions={
          <>
            <Button onClick={cancel}>Продолжить редактирование</Button>
            <Button type="primary" danger disabled={saving} onClick={leave}>
              Выйти без сохранения
            </Button>
          </>
        }
      >
        <p>
          {saving
            ? 'Дождитесь завершения сохранения.'
            : 'При выходе эти изменения будут потеряны.'}
        </p>
        <ul>
          {affected.map((entry) => (
            <li key={entry.id}>{entry.label()}</li>
          ))}
        </ul>
      </Modal>
    </UnsavedChangesContext.Provider>
  )
}

export default UnsavedChangesProvider
