import { useState } from 'react'
import { Alert, Button, PageItem, Pagination, Table } from 'oa'
import { fields } from './fields.ts'
import { invalidFields } from './invalidFields.ts'
import { normalizeDate } from './normalizeDate.ts'
import { type ChargeRow, type StepProps } from './types.ts'

const PAGE_SIZE = 10

// Every column stays on one line except Notes, which is 300px wide and wraps
const nowrapClass = (fieldId: string) => (fieldId === 'notes' ? undefined : 'text-nowrap')

// Activity Date shows as MM/DD/YYYY; a date that can't be parsed shows as imported
function cellValue(row: ChargeRow, fieldId: string) {
  const value = row[fieldId]
  return fieldId === 'activityDate' ? (normalizeDate(value) ?? value) : value
}

type ReviewProps = StepProps & {
  rows: ChargeRow[]
}

function Review({ onBack, onNext, nextLabel, rows }: ReviewProps) {
  const [page, setPage] = useState(1)
  const pageCount = Math.ceil(rows.length / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const pageRows = rows.slice(start, start + PAGE_SIZE)
  const invalid = rows.map(invalidFields)
  const invalidRowCount = invalid.filter((errors) => errors.size > 0).length

  // Each distinct error message -> the 1-based row numbers it appears in, in table order
  const errorRows = new Map<string, number[]>()
  invalid.forEach((errors, rowIndex) => {
    for (const message of errors.values()) {
      errorRows.set(message, [...(errorRows.get(message) ?? []), rowIndex + 1])
    }
  })

  return (
    <>
      <h4 className='mt-4 mb-3 muted'>Review Charges</h4>
      {invalidRowCount > 0 && (
        <Alert variant="danger">
          {invalidRowCount} {invalidRowCount === 1 ? 'row has' : 'rows have'} missing or invalid data. Fix the
          spreadsheet and upload it again.
          <ul className="mb-0 mt-2">
            {[...errorRows].map(([message, rowNumbers]) => (
              <li key={message}>
                {message} ({rowNumbers.length === 1 ? 'row' : 'rows'} {rowNumbers.join(', ')})
              </li>
            ))}
          </ul>
        </Alert>
      )}
      <Table bordered responsive className="mb-3">
        <thead>
          <tr>
            {fields.map((field) => (
              <th
                key={field.id}
                className={nowrapClass(field.id)}
                style={field.id === 'notes' ? { width: 500, minWidth: 500 } : undefined}
              >
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row, index) => (
            <tr key={start + index}>
              {fields.map((field) => (
                <td
                  key={field.id}
                  className={
                    [nowrapClass(field.id), invalid[start + index].has(field.id) && 'table-danger']
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                >
                  {cellValue(row, field.id)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNumber) => (
          <PageItem key={pageNumber} active={pageNumber === page} onClick={() => setPage(pageNumber)}>
            {pageNumber}
          </PageItem>
        ))}
      </Pagination>
      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={onBack}>
          Back
        </Button>
        {/* Import does nothing while any row is invalid; the Alert above explains why */}
        <Button
          type="submit"
          variant="primary"
          onClick={() => {
            if (invalidRowCount === 0) onNext()
          }}
        >
          {nextLabel}
        </Button>
      </div>
    </>
  )
}

export default Review
