import { Card, theme } from 'antd'

export const StatsCard = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: number
}) => {
  const { token } = theme.useToken()
  return (
    <Card size="small">
      <div className="modules-relations-diagram__stat-card">
        {icon}
        <div>
          <div
            className="modules-relations-diagram__stat-card-label"
            style={{ color: token.colorTextSecondary }}
          >
            {label}
          </div>
          <div className="modules-relations-diagram__stat-card-value">
            {value}
          </div>
        </div>
      </div>
    </Card>
  )
}
