import { type ChargeRow } from './types.ts'

// Spreadsheet numbers may carry currency symbols, thousands separators or units ("8 hrs", "$45/hr"),
// so the first number in the value is used. Accounting-style negatives like (25.00) stay negative.
function parseNumber(value: string | undefined) {
  const cleaned = value?.replace(/[$,]/g, '') ?? ''
  const match = cleaned.match(/-?\d*\.?\d+/)
  if (!match) return NaN
  const number = Number(match[0])
  return /^\s*\(.*\)\s*$/.test(cleaned) ? -number : number
}

// Flat: Quantity x Unit Amount; Hourly: Hours Worked x Hourly Rate.
// Returns '' when the charge basis is unrecognized or an input is missing or not a number.
export function calculateAmount(row: ChargeRow) {
  const basis = row.chargeBasis?.trim().toLowerCase()
  let total = NaN
  if (basis === 'flat') total = parseNumber(row.quantity) * parseNumber(row.unitAmount)
  else if (basis === 'hourly') total = parseNumber(row.hoursWorked) * parseNumber(row.hourlyRate)
  return Number.isFinite(total) ? total.toFixed(2) : ''
}
