import { useForm, useWatch } from 'react-hook-form'
import {
  Button,
  Feedback,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  FormSelect,
  ListGroup,
  ListGroupItem,
} from 'oa'
import { calculateAmount } from './calculateAmount.ts'
import { fields } from './fields.ts'
import { type ChargeRow, type ColumnMapping, type ImportedData, type StepProps } from './types.ts'

const clients = ['Billing Group 1', 'Billing Group 2', 'Billing Group 3']

const sortGroups = ['Sort Group 1', 'Sort Group 2', 'Sort Group 3']

// Sort Group only applies to this billing group, and Reference Number only to the next
const SORT_GROUP_CLIENT = 'Billing Group 2'
const REFERENCE_NUMBER_CLIENT = 'Billing Group 3'

// 'Flat' and 'Hourly' become every row's Charge Basis; 'column' reads it from the matched column
const chargeBasisOptions = [
  { value: 'column', label: 'Use Column' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Hourly', label: 'Hourly' },
] as const

const calculateAmountOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No, Use Column' },
] as const

const PREVIEW_ROW_COUNT = 3

// Only matched to a column when "Use column instead" is checked, so it isn't in the shared fields list
const clientField = { id: 'client', label: 'Billing Group' }

type MatchColumnsFormValues = {
  client: string
  useClientColumn: boolean
  sortGroup: string
  useSortGroupColumn: boolean
  referenceNumber: string
  useReferenceNumberColumn: boolean
  chargeBasis: (typeof chargeBasisOptions)[number]['value']
  calculateAmount: (typeof calculateAmountOptions)[number]['value']
  columns: ColumnMapping
}

// Which accessorial fields must be matched to a column, given the options chosen above.
// Mirrors the matchableFields filter: every shown field except Notes is required, as are Sort Group
// and Reference Number unless they're only shown because Billing Group comes from a column.
function isColumnRequired(
  fieldId: string,
  {
    client,
    useClientColumn,
    useSortGroupColumn,
    useReferenceNumberColumn,
    chargeBasis,
    calculateAmount,
  }: Pick<
    MatchColumnsFormValues,
    | 'client'
    | 'useClientColumn'
    | 'useSortGroupColumn'
    | 'useReferenceNumberColumn'
    | 'chargeBasis'
    | 'calculateAmount'
  >,
) {
  switch (fieldId) {
    case 'client':
      return useClientColumn
    case 'sortGroup':
      return client === SORT_GROUP_CLIENT && useSortGroupColumn
    case 'referenceNumber':
      return client === REFERENCE_NUMBER_CLIENT && useReferenceNumberColumn
    case 'charge':
    case 'activityDate':
      return true
    case 'chargeBasis':
      return chargeBasis === 'column'
    case 'quantity':
    case 'unitAmount':
      return chargeBasis !== 'Hourly'
    case 'hoursWorked':
    case 'hourlyRate':
      return chargeBasis !== 'Flat'
    case 'amount':
      return calculateAmount === 'no'
    default:
      return false
  }
}

type MatchColumnsProps = StepProps & {
  data: ImportedData | null
  onMatched: (rows: ChargeRow[]) => void
}

function MatchColumns({ onBack, onNext, nextLabel, data, onMatched }: MatchColumnsProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<MatchColumnsFormValues>({
    defaultValues: {
      client: '',
      useClientColumn: false,
      sortGroup: '',
      useSortGroupColumn: false,
      referenceNumber: '',
      useReferenceNumberColumn: false,
      chargeBasis: 'column',
      calculateAmount: 'yes',
      columns: Object.fromEntries([clientField, ...fields].map((field) => [field.id, ''])),
    },
  })

  const columns = useWatch({ control, name: 'columns' })
  const client = useWatch({ control, name: 'client' })
  const useClientColumn = useWatch({ control, name: 'useClientColumn' })
  const useSortGroupColumn = useWatch({ control, name: 'useSortGroupColumn' })
  const useReferenceNumberColumn = useWatch({ control, name: 'useReferenceNumberColumn' })
  const chargeBasis = useWatch({ control, name: 'chargeBasis' })
  const calculateAmountChoice = useWatch({ control, name: 'calculateAmount' })
  const shouldCalculateAmount = calculateAmountChoice === 'yes'
  const headers = data?.headers ?? []
  const previewRows = data?.rows.slice(0, PREVIEW_ROW_COUNT) ?? []

  // Charge Basis and Amount only need a column when they aren't supplied by the options above,
  // and a fixed Charge Basis makes the other basis's inputs irrelevant. Client is only matched when
  // "Use column instead" is checked. Sort Group and Reference Number are matched when their own
  // "Use column instead" is checked, or when Billing Group comes from a column (any row may need them).
  const matchableFields = [...(useClientColumn ? [clientField] : []), ...fields].filter(
    (field) =>
      (field.id !== 'sortGroup' || useClientColumn || (client === SORT_GROUP_CLIENT && useSortGroupColumn)) &&
      (field.id !== 'referenceNumber' ||
        useClientColumn ||
        (client === REFERENCE_NUMBER_CLIENT && useReferenceNumberColumn)) &&
      (field.id !== 'chargeBasis' || chargeBasis === 'column') &&
      (field.id !== 'amount' || !shouldCalculateAmount) &&
      !(chargeBasis === 'Flat' && (field.id === 'hoursWorked' || field.id === 'hourlyRate')) &&
      !(chargeBasis === 'Hourly' && (field.id === 'quantity' || field.id === 'unitAmount')),
  )

  // Validates the form first; only builds the rows and advances once every required value is set
  const handleNext = handleSubmit((values) => {
    const rows = (data?.rows ?? []).map((row) => {
      const columnValue = (fieldId: string) => {
        const column = values.columns[fieldId]
        return column ? (row[column] ?? '') : ''
      }
      const chargeRow: ChargeRow = Object.fromEntries(fields.map((field) => [field.id, columnValue(field.id)]))
      // With a selected Billing Group, Sort Group and Reference Number only apply to their own billing
      // group, and come from the value entered above unless their "Use column instead" is checked
      if (!values.useClientColumn) {
        chargeRow.sortGroup =
          values.client !== SORT_GROUP_CLIENT
            ? ''
            : values.useSortGroupColumn
              ? columnValue('sortGroup')
              : values.sortGroup
        chargeRow.referenceNumber =
          values.client !== REFERENCE_NUMBER_CLIENT
            ? ''
            : values.useReferenceNumberColumn
              ? columnValue('referenceNumber')
              : values.referenceNumber
      }
      if (values.chargeBasis !== 'column') chargeRow.chargeBasis = values.chargeBasis
      if (values.calculateAmount === 'yes') chargeRow.amount = calculateAmount(chargeRow)
      return chargeRow
    })
    onMatched(rows)
    onNext()
  })

  return (
    <>
      <h4 className='mt-4 mb-3 muted'>Match Columns</h4>
      <FormGroup className={useClientColumn ? undefined : 'required'} controlId="client">
        <FormLabel>Billing Group</FormLabel>
        <FormSelect
          {...register('client', {
            validate: (value, values) => values.useClientColumn || value !== '' || 'Billing Group is required',
          })}
          disabled={useClientColumn}
          isInvalid={!!errors.client}
        >
          <option value="">Select a billing group</option>
          {clients.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </FormSelect>
        <Feedback type="invalid">{errors.client?.message}</Feedback>
        {/* Checking clears any selected client, since the client then comes from the matched column */}
        <FormCheck
          className="mt-2"
          id="useClientColumn"
          label="Use column instead"
          {...register('useClientColumn', {
            onChange: (event) => {
              if (event.target.checked) {
                setValue('client', '')
                clearErrors('client')
              } else {
                clearErrors('columns.client')
              }
            },
          })}
        />
      </FormGroup>
      {/* Sort Group belongs to Billing Group 2 and Reference Number to Billing Group 3. Each is
          unregistered when hidden so a value from another billing group doesn't carry over. */}
      {client === SORT_GROUP_CLIENT && (
        <FormGroup className={useSortGroupColumn ? undefined : 'required'} controlId="sortGroup">
          <FormLabel>Sort Group</FormLabel>
          <FormSelect
            {...register('sortGroup', {
              shouldUnregister: true,
              validate: (value, values) => values.useSortGroupColumn || value !== '' || 'Sort Group is required',
            })}
            disabled={useSortGroupColumn}
            isInvalid={!!errors.sortGroup}
          >
            <option value="">Select a sort group</option>
            {sortGroups.map((sortGroup) => (
              <option key={sortGroup} value={sortGroup}>
                {sortGroup}
              </option>
            ))}
          </FormSelect>
          <Feedback type="invalid">{errors.sortGroup?.message}</Feedback>
          <FormCheck
            className="mt-2"
            id="useSortGroupColumn"
            label="Use column instead"
            {...register('useSortGroupColumn', {
              shouldUnregister: true,
              onChange: (event) => {
                if (event.target.checked) {
                  setValue('sortGroup', '')
                  clearErrors('sortGroup')
                } else {
                  clearErrors('columns.sortGroup')
                }
              },
            })}
          />
        </FormGroup>
      )}
      {client === REFERENCE_NUMBER_CLIENT && (
        <FormGroup className={useReferenceNumberColumn ? undefined : 'required'} controlId="referenceNumber">
          <FormLabel>Reference Number</FormLabel>
          <FormControl
            type="text"
            {...register('referenceNumber', {
              shouldUnregister: true,
              validate: (value, values) =>
                values.useReferenceNumberColumn || value.trim() !== '' || 'Reference Number is required',
            })}
            disabled={useReferenceNumberColumn}
            isInvalid={!!errors.referenceNumber}
          />
          <Feedback type="invalid">{errors.referenceNumber?.message}</Feedback>
          <FormCheck
            className="mt-2"
            id="useReferenceNumberColumn"
            label="Use column instead"
            {...register('useReferenceNumberColumn', {
              shouldUnregister: true,
              onChange: (event) => {
                if (event.target.checked) {
                  setValue('referenceNumber', '')
                  clearErrors('referenceNumber')
                } else {
                  clearErrors('columns.referenceNumber')
                }
              },
            })}
          />
        </FormGroup>
      )}
      <FormGroup className="required">
        <FormLabel className='d-block'>Charge Basis</FormLabel>
        {chargeBasisOptions.map((option) => (
          <FormCheck
            inline
            key={option.value}
            type="radio"
            id={`chargeBasis-${option.value}`}
            label={option.label}
            value={option.value}
            {...register('chargeBasis', { required: 'Charge Basis is required' })}
            isInvalid={!!errors.chargeBasis}
          />
        ))}
        {errors.chargeBasis && (
          <Feedback type="invalid" className="d-block">
            {errors.chargeBasis.message}
          </Feedback>
        )}
      </FormGroup>
      <FormGroup className="required">
        <FormLabel className='d-block'>Calculate Total Charge For Me</FormLabel>
        {calculateAmountOptions.map((option) => (
          <FormCheck
            inline
            key={option.value}
            type="radio"
            id={`calculateAmount-${option.value}`}
            label={option.label}
            value={option.value}
            {...register('calculateAmount', { required: 'Calculate Amount For Me is required' })}
            isInvalid={!!errors.calculateAmount}
          />
        ))}
        {errors.calculateAmount && (
          <Feedback type="invalid" className="d-block">
            {errors.calculateAmount.message}
          </Feedback>
        )}
      </FormGroup>
      <ListGroup className='mb-3'>
        <ListGroupItem className="fw-bold">
          <div className="row">
            <div className="col-4">Accessorial Field</div>
            <div className="col-4">Imported Columns</div>
            <div className="col-4">Preview</div>
          </div>
        </ListGroupItem>
        {matchableFields.map((field) => {
          const column = columns[field.id]
          const columnError = errors.columns?.[field.id]
          return (
            <ListGroupItem key={field.id}>
              <div className="row align-items-center">
                <div className="col-4">
                  {field.label}
                  {isColumnRequired(field.id, {
                    client,
                    useClientColumn,
                    useSortGroupColumn,
                    useReferenceNumberColumn,
                    chargeBasis,
                    calculateAmount: calculateAmountChoice,
                  }) && ' *'}
                </div>
                <div className="col-4">
                  <FormSelect
                    aria-label={`${field.label} column`}
                    {...register(`columns.${field.id}`, {
                      validate: (value, values) =>
                        !isColumnRequired(field.id, values) || value !== '' || `${field.label} is required`,
                    })}
                    isInvalid={!!columnError}
                  >
                    <option value="">Select a column</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </FormSelect>
                  <Feedback type="invalid">{columnError?.message}</Feedback>
                </div>
                <div className="col-4">
                  <ul className='small form-text'>
                   {column &&
                    previewRows.map((row, index) => <li key={index}><span className='d-block text-truncate'>{row[column]}</span></li>)} 
                  </ul>
                </div>
              </div>
            </ListGroupItem>
          )
        })}
      </ListGroup>
      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={handleNext}>
          {nextLabel}
        </Button>
      </div>
    </>
  )
}

export default MatchColumns
