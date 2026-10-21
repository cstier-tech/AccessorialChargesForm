export type StepProps = {
  // Undefined on the first step, which has nowhere to go back to
  onBack?: () => void
  onNext: () => void
  nextLabel: string
}

export type CsvRow = Record<string, string>

// Accessorial field id -> imported column header ('' when unmatched)
export type ColumnMapping = Record<string, string>

// One imported row keyed by accessorial field id, after column matching
export type ChargeRow = Record<string, string>

// The parsed spreadsheet: column header names plus one object per row, keyed by header
export type ImportedData = {
  headers: string[]
  rows: CsvRow[]
}
