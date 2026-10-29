import { type ListItem } from 'oa'

// Accessorial fields in display order, shared by the Match Columns list and the Review table
export const fields: ListItem[] = [
  { id: 'sortGroup', label: 'Sort Group' },
  { id: 'referenceNumber', label: 'Reference Number' },
  { id: 'charge', label: 'Charge Type' },
  { id: 'activityDate', label: 'Activity Date' },
  { id: 'chargeBasis', label: 'Charge Basis' },
  { id: 'quantity', label: 'Quantity' },
  { id: 'unitAmount', label: 'Unit Price' },
  { id: 'hoursWorked', label: 'Hours Worked' },
  { id: 'hourlyRate', label: 'Hourly Rate' },
  { id: 'amount', label: 'Total Charge' },
  { id: 'notes', label: 'Notes' },
]
