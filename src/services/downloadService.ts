import { apiPaths } from '@constants/api/apiPaths'

import { downloadFile } from '@utils/downloadFile'
import { getDownloadFilename } from '@utils/downloadFilename'

import { apiService } from '@services/apiService'

import type { LimitOffsetRequestType } from '@type/index'
import type { TableSearchParams } from '@type/table-search.type'

const downloadPaths = {
  user: apiPaths.downloadUsers,
  role: apiPaths.downloadRoles,
  session: apiPaths.downloadSessions,
  log: apiPaths.downloadLogs
}

export type CsvDownloadType = keyof typeof downloadPaths
export type CsvDownloadParams = LimitOffsetRequestType & TableSearchParams

export const downloadCsv = async (
  type: CsvDownloadType,
  params?: CsvDownloadParams
) => {
  const { data, headers } = await apiService.post<Blob>(
    apiPaths.baseAdminUrl + downloadPaths[type],
    params ?? {},
    { responseType: 'blob' }
  )

  downloadFile({
    content: data,
    fileName: getDownloadFilename(headers['content-disposition'], `${type}.csv`)
  })
}
