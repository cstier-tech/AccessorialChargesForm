import Papa from 'papaparse'
import { useForm } from 'react-hook-form'
import { Button, Col, Feedback, FormControl, FormGroup, FormLabel, IconButton, InputGroup, Row } from 'oa'
import { type CsvRow, type ImportedData, type StepProps } from './types.ts'

const FILE_INPUT_ID = 'spreadsheetFile'

type UploadFormValues = {
  file: FileList | null
  startRow: number
}

type UploadProps = StepProps & {
  onParsed: (data: ImportedData) => void
}

function Upload({ onNext, nextLabel, onParsed }: UploadProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UploadFormValues>({
    defaultValues: { file: null, startRow: 0 },
  })

  function getInput() {
    return document.getElementById(FILE_INPUT_ID) as HTMLInputElement | null
  }

  function clearFile() {
    const input = getInput()
    if (input) input.value = ''
    // Clearing the input doesn't fire a change event, so the form value has to be reset by hand
    setValue('file', null)
  }

  // Validates the form first; only parses and advances once a file has been chosen
  const handleNext = handleSubmit(({ file, startRow }) => {
    const selected = file?.[0]
    if (!selected) return
    Papa.parse<CsvRow>(selected, {
      header: true,
      skipEmptyLines: true,
      // Papa Parse skips nothing for values below 1 or NaN (an emptied input)
      skipFirstNLines: startRow - 1,
      complete: (results) => {
        console.log(results.data)
        onParsed({ headers: results.meta.fields ?? [], rows: results.data })
        onNext()
      },
    })
  })

  return (
    <>
      <h4 className='mt-4 muted'>Upload CSV</h4>
      <FormGroup controlId={FILE_INPUT_ID} className="required">
        <FormLabel>File Upload</FormLabel>
        <InputGroup hasValidation>
          <FormControl
            type="file"
            accept=".csv,text/csv"
            {...register('file', {
              validate: (files) => (files?.length ?? 0) > 0 || 'File Upload is required',
            })}
            isInvalid={!!errors.file}
          />
          <IconButton icon="times" variant="danger" aria-label="Clear file" onClick={clearFile} />
          <Feedback type="invalid">{errors.file?.message}</Feedback>
        </InputGroup>
      </FormGroup>
      <FormGroup as={Row}  controlId="startRow">
        <FormLabel xs='auto' column>Start at Row:</FormLabel>
        <Col>
          <FormControl type="number" min={0} {...register('startRow', { valueAsNumber: true })} />
        </Col>
      </FormGroup>
      <div className="d-flex justify-content-end gap-2">
        <Button variant="primary" onClick={handleNext}>
          {nextLabel}
        </Button>
      </div>
    </>
  )
}

export default Upload
