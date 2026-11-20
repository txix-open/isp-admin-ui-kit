import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Checkbox, message } from 'antd'

import PageLayout, {
  PageAccessDenied,
  PageLoading
} from '@components/PageLayout'
import { TableEmpty, TableStatus } from '@components/TableUI'

import { ignoreApiError } from '@utils/apiErrorNotifications'

import useRole from '@hooks/useRole'

import securityLogServiceApi from '@services/securityLogService'

import { LogEventKeyType } from '@type/log.type'
import { PermissionKeysType } from '@type/roles.type'

import './audit-management-page.scss'

const AuditSettings = () => {
  const { data, isLoading, isFetching, isError, refetch } =
    securityLogServiceApi.useGetLogEventsQuery()
  const events = data ?? []
  const [setEvents, { isLoading: isSaving }] =
    securityLogServiceApi.useSetLogEventsMutation()
  const [messageApi, contextHolder] = message.useMessage()

  const enabledCount = events.filter(({ enabled }) => enabled).length
  const sortedEvents = [...events].sort((a, b) =>
    (a.name || a.event).localeCompare(b.name || b.event)
  )
  const allChecked = events.length > 0 && enabledCount === events.length
  const disabled = isFetching || isSaving

  const saveEvents = async (selected: LogEventKeyType[]) => {
    if (disabled || !data) return
    const enabled = new Set(selected)
    const settings = events.map(({ event }) => ({
      event,
      enabled: enabled.has(event)
    }))

    messageApi.loading({
      key: 'audit-settings',
      content: 'Сохранение настроек…',
      duration: 0
    })
    try {
      await setEvents(settings).unwrap()
      messageApi.success({
        key: 'audit-settings',
        content: 'Настройки сохранены'
      })
    } catch (error) {
      ignoreApiError(error)
      messageApi.error({
        key: 'audit-settings',
        content: 'Не удалось сохранить настройки аудита. Попробуйте ещё раз.'
      })
    }
  }

  return (
    <PageLayout
      className="audit-management-page"
      title="Управление аудитом"
      context="Пользователи и роли"
      description="Изменения сохраняются сразу."
      actions={
        <Button
          icon={<ReloadOutlined />}
          loading={isFetching}
          disabled={isSaving}
          onClick={() => refetch()}
        >
          Обновить
        </Button>
      }
    >
      {contextHolder}
      {isError && (
        <Alert
          type="error"
          showIcon
          title={
            data
              ? 'Не удалось обновить настройки. Показаны ранее загруженные данные.'
              : 'Не удалось загрузить настройки аудита'
          }
          action={
            <Button
              loading={isFetching}
              disabled={isSaving}
              onClick={() => refetch()}
            >
              Повторить
            </Button>
          }
        />
      )}
      {isLoading && !data ? (
        <PageLoading label="Загрузка настроек аудита…" />
      ) : data && events.length === 0 ? (
        <TableEmpty description="Нет доступных событий аудита" />
      ) : data ? (
        <section
          className="audit-management-page__settings"
          aria-label="События аудита"
          aria-busy={disabled}
        >
          <div className="audit-management-page__toolbar">
            <Checkbox
              checked={allChecked}
              indeterminate={!allChecked && enabledCount > 0}
              disabled={disabled}
              onChange={({ target }) =>
                saveEvents(
                  target.checked ? events.map(({ event }) => event) : []
                )
              }
            >
              Все события
            </Checkbox>
            <span className="audit-management-page__summary" role="status">
              {isSaving
                ? 'Сохранение…'
                : `Включено ${enabledCount} из ${events.length}`}
            </span>
          </div>
          <ul className="audit-management-page__events">
            {sortedEvents.map(({ event, name, enabled }) => (
              <li key={event} className="audit-management-page__event">
                <Checkbox
                  checked={enabled}
                  disabled={disabled}
                  onChange={({ target }) =>
                    saveEvents(
                      events
                        .filter((item) =>
                          item.event === event ? target.checked : item.enabled
                        )
                        .map((item) => item.event)
                    )
                  }
                >
                  {name || event}
                </Checkbox>
                <TableStatus tone={enabled ? 'success' : 'neutral'}>
                  {enabled ? 'Включено' : 'Отключено'}
                </TableStatus>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageLayout>
  )
}

const AuditManagementPage = () => {
  const { hasPermission } = useRole()

  if (!hasPermission(PermissionKeysType.audit_management_view)) {
    return (
      <PageAccessDenied
        title="Управление аудитом"
        context="Пользователи и роли"
      />
    )
  }

  return <AuditSettings />
}

export default AuditManagementPage
