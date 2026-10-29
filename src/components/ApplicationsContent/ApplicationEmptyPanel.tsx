import { Empty } from 'antd'

import SearchAppByToken from '@ui/SearchAppByToken'

const ApplicationEmptyPanel = ({
  searchToken,
  description
}: {
  searchToken: boolean
  description: string
}) => (
  <div className="application-empty-panel">
    {searchToken && (
      <div className="application-empty-panel__search">
        <SearchAppByToken />
      </div>
    )}
    <div className="application-empty-panel__state">
      <Empty description={description} />
    </div>
  </div>
)

export default ApplicationEmptyPanel
