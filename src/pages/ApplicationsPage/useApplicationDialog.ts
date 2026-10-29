import { useSearchParams } from 'react-router-dom'

type ApplicationDialog = 'new-group' | 'edit-group' | 'new-app' | 'edit-app'

export const useApplicationDialog = () => {
  const [params, setParams] = useSearchParams()
  return {
    dialog: params.get('dialog'),
    openDialog: (dialog: ApplicationDialog) => {
      const next = new URLSearchParams(params)
      next.set('dialog', dialog)
      setParams(next)
    },
    closeDialog: () => {
      const next = new URLSearchParams(params)
      next.delete('dialog')
      setParams(next, { replace: true })
    }
  }
}
