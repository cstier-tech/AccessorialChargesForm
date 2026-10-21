import { fields } from './fields.ts'
import { type ChargeRow } from './types.ts'

const isEmpty = (value: string | undefined) => !value?.trim()

const requiredMessage = (fieldId: string) =>
  `${fields.find((field) => field.id === fieldId)?.label ?? fieldId} is required`

// Field id -> error message for each field in this row that is missing or invalid. Charge Type,
// Activity Date and Amount are always required; Charge Basis must be Flat or Hourly, which then decides
// whether Quantity + Unit Price or Hours Worked + Hourly Rate are required. Notes is never required.
export function invalidFields(row: ChargeRow) {
  const invalid = new Map<string, string>()
  for (const fieldId of ['charge', 'activityDate', 'amount']) {
    if (isEmpty(row[fieldId])) invalid.set(fieldId, requiredMessage(fieldId))
  }

  const basis = row.chargeBasis?.trim().toLowerCase()
  const basisFields =
    basis === 'flat' ? ['quantity', 'unitAmount'] : basis === 'hourly' ? ['hoursWorked', 'hourlyRate'] : null
  if (!basisFields) {
    invalid.set(
      'chargeBasis',
      isEmpty(row.chargeBasis) ? requiredMessage('chargeBasis') : 'Charge Basis must be Flat or Hourly',
    )
    return invalid
  }
  for (const fieldId of basisFields) {
    if (isEmpty(row[fieldId])) invalid.set(fieldId, requiredMessage(fieldId))
  }
  return invalid
}
