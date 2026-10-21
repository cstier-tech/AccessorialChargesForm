import moment from 'moment'

// Strict parsing means each value must match one of these exactly, and in strict
// mode M/D reject leading zeros, so padded variants are listed separately.
// Numeric dates are month-first only, so 03/04/2026 is March 4.
const DAY_FORMATS = [
  'MMMM Do, YYYY', // October 20th, 2026
  'MMMM D, YYYY', // October 20, 2026
  'MMMM DD, YYYY', // October 05, 2026
  'MMM Do, YYYY', // Oct 19th, 2026
  'MMM D, YYYY', // Oct 19, 2026
  'MMM DD, YYYY', // Oct 05, 2026
  'M/D/YYYY', // 10/25/2026, 1/5/2026
  'MM/DD/YYYY', // 03/04/2026
  'MM/D/YYYY', // 03/4/2026
  'M/DD/YYYY', // 3/04/2026
]

// Each date may also carry a time, which is dropped: May 6, 2026 3:51 PM
const DATE_FORMATS = DAY_FORMATS.flatMap((format) => [format, `${format} h:mm A`])

// Returns the date as MM/DD/YYYY, or null when it matches no format or isn't a real date.
export function normalizeDate(value: string | undefined) {
  if (!value) return null
  const date = moment(value.trim(), DATE_FORMATS, 'en', true)
  return date.isValid() ? date.format('MM/DD/YYYY') : null
}
