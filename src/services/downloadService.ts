import { apiPaths } from '@constants/api/apiPaths'

import { getApplicationGroup } from '@utils/configUtils'
import { downloadFile } from '@utils/downloadFile'
import { getDownloadFilename } from '@utils/downloadFilename'

import { apiService } from '@services/apiService'

import type { TableSearchParams } from '@type/table-search.type'

const downloadPaths = {
  user: apiPaths.downloadUsers,
  role: apiPaths.downloadRoles,
  session: apiPaths.downloadSessions,
  log: apiPaths.downloadLogs
}

export type CsvDownloadType = keyof typeof downloadPaths

// domain.RoleAllRequest (swagger): только фильтр по группе приложений
export interface RoleDownloadParams {
  applicationGroup?: string
}

export type CsvDownloadParams = TableSearchParams & RoleDownloadParams

export const downloadCsv = async (
  type: CsvDownloadType,
  params?: CsvDownloadParams
) => {
  const { query, order } = params ?? {}
  const { data, headers } = await apiService.post<Blob>(
    apiPaths.baseAdminUrl + downloadPaths[type],
    type === 'user' || type === 'role'
      ? { query, order, applicationGroup: getApplicationGroup() }
      : { query, order },
    { responseType: 'blob' }
  )

  const prefix = new Uint8Array(await data.slice(0, 3).arrayBuffer())
  const hasBom = prefix[0] === 0xef && prefix[1] === 0xbb && prefix[2] === 0xbf
  const csv = new Blob(hasBom ? [data] : ['\uFEFF', data], {
    type: 'text/csv;charset=utf-8'
  })

  downloadFile({
    content: csv,
    fileName: getDownloadFilename(headers['content-disposition'], `${type}.csv`)
  })
}
