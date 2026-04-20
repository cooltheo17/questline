const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
})

export function formatShortDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return shortDateFormatter.format(new Date(year, month - 1, day))
}
