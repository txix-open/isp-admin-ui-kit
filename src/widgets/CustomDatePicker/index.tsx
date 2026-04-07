import { WidgetProps } from '@rjsf/utils'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { MOSCOW_TZ, dateFormats } from '@constants/date'

import './custom-date-picker.scss'

dayjs.extend(utc)
dayjs.extend(timezone)

function CustomDatePicker({
  disabled,
  id,
  onChange,
  placeholder,
  readonly,
  value
}: WidgetProps) {
  const safeValue = (() => {
    if (!value) {
      return null
    }

    const parsed = dayjs(String(value)).tz(MOSCOW_TZ)

    return parsed.isValid() ? parsed : null
  })()

  const handleChange = (nextValue: dayjs.Dayjs | null) => {
    if (!nextValue) {
      onChange(undefined)
      return
    }

    const inMoscow = nextValue.tz(MOSCOW_TZ, true)
    onChange(inMoscow.format(dateFormats.isoUtcMs))
  }

  return (
    <DatePicker
      className="custom-date-picker"
      disabled={disabled || readonly}
      id={id}
      onChange={handleChange}
      placeholder={placeholder}
      showTime
      value={safeValue}
    />
  )
}

export default CustomDatePicker
