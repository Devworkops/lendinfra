import { parseISO } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'

const formatInTimeZone = (date: string | number | Date, fmt: string, tz: string) =>
  format(utcToZonedTime(date, tz),
    fmt,
    { timeZone: tz })

export function fDate (dateValue: any) {
  const parsedTime = parseISO(dateValue)
  const formattedTime = formatInTimeZone(parsedTime, 'yyyy-MM-dd kk:mm:ss', 'UTC')
  return formattedTime
}

export function fDatestring (dateValue: any) {
  const parsedTime = parseISO(dateValue)
  const formattedTime = formatInTimeZone(parsedTime, 'yyyy-MM-dd', 'UTC')
  return formattedTime
}
