import { Alert, Button, Checkbox, Spin, message } from 'antd'
import { Navigate } from 'react-router-dom'

import useRole from '@hooks/useRole'

import securityLogServiceApi from '@services/securityLogService'

import { routePaths } from '@routes/routePaths'

import { LogEventKeyType } from '@type/log.type'
import { PermissionKeysType } from '@type/roles.type'

import './audit-management-page.scss'

const AuditSettings = () => {
  const {
    data: events = [],
    isLoading,
    isFetching,
    isError,
    refetch
  } = securityLogServiceApi.useGetLogEventsQuery()
  const [setEvents, { isLoading: isSaving }] =
    securityLogServiceApi.useSetLogEventsMutation()
  const [messageApi, contextHolder] = message.useMessage()

  const enabledEvents = events
    .filter(({ enabled }) => enabled)
    .map(({ event }) => event)
  const options = events
    .map(({ name, event }) => ({ label: name || event, value: event }))
    .sort((a, b) => a.label.localeCompare(b.label))
  const allChecked = events.length > 0 && enabledEvents.length === events.length
  const disabled = isFetching || isSaving

  const saveEvents = async (selected: LogEventKeyType[]) => {
    const enabled = new Set(selected)
    const settings = events.map(({ event }) => ({
      event,
      enabled: enabled.has(event)
    }))

    messageApi.loading({
      key: 'audit-settings',
      content: 'Загрузка...',
      duration: 0
    })
    try {
      await setEvents(settings).unwrap()
      messageApi.success({ key: 'audit-settings', content: 'Сохранено' })
    } catch {
      messageApi.error({ key: 'audit-settings', content: 'Возникла ошибка' })
    }
  }

  return (
    <main className="audit-management-page">
      {contextHolder}
      <header className="audit-management-page__header">
        <h1 data-cy="audit-management-page__header__title">
          Управление аудитом
        </h1>
      </header>
      <section className="audit-management-page__content">
        {isLoading ? (
          <Spin />
        ) : isError ? (
          <Alert
            type="error"
            title="Не удалось загрузить настройки аудита"
            action={
              <Button
                size="small"
                loading={isFetching}
                onClick={() => refetch()}
              >
                Повторить
              </Button>
            }
          />
        ) : (
          <>
            <Checkbox
              checked={allChecked}
              indeterminate={!allChecked && enabledEvents.length > 0}
              disabled={disabled || events.length === 0}
              onChange={({ target }) =>
                saveEvents(
                  target.checked ? events.map(({ event }) => event) : []
                )
              }
            >
              Выбрать все
            </Checkbox>
            <Checkbox.Group
              className="audit-management-page__checkbox-group"
              options={options}
              value={enabledEvents}
              disabled={disabled}
              onChange={saveEvents}
            />
          </>
        )}
      </section>
    </main>
  )
}

const AuditManagementPage = () => {
  const { hasPermission } = useRole()

  if (!hasPermission(PermissionKeysType.audit_management_view)) {
    return <Navigate to={routePaths.home} replace />
  }

  return <AuditSettings />
}

export default AuditManagementPage
