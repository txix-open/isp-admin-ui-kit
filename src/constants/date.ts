type FormattersKey = 'fullFormat' | 'isoUtcMs'

export const dateFormats: Record<FormattersKey, string> = {
  fullFormat: 'DD.MM.YYYY HH:mm:ss',
  isoUtcMs: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
}

export const MOSCOW_TZ = 'Europe/Moscow'
