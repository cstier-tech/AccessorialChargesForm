import { useForm, useWatch } from 'react-hook-form'
import {
  Button,
  Col,
  Feedback,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
  FormSelect,
  OptContent,
  OptItem,
  OptList,
  Row,
} from 'oa'

type ChargeBasis = 'Flat' | 'Hourly'

type ChargeFormValues = {
  client: string
  sortGroup: string
  referenceNumber: string
  activityDate: string
  charge: string
  chargeBasis: ChargeBasis
  quantity: string
  unitAmount: string
  hoursWorked: string
  hourlyRate: string
  notes: string
}

const clients = ['Billing Group 1', 'Billing Group 2', 'Billing Group 3']

const sortGroups = ['Sort Group 1', 'Sort Group 2', 'Sort Group 3']

const chargeTypes = ['Rush', 'Apply Custom Labels', 'Forward Packages', 'Change Ship Method']

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Blank or non-numeric input counts as 0 so the calculated amount stays readable while typing
function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function EnterCharge() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChargeFormValues>({
    defaultValues: {
      client: '',
      sortGroup: '',
      referenceNumber: '',
      activityDate: '',
      charge: '',
      chargeBasis: 'Flat',
      quantity: '',
      unitAmount: '',
      hoursWorked: '',
      hourlyRate: '',
      notes: '',
    },
  })

  const [client, chargeBasis, quantity, unitAmount, hoursWorked, hourlyRate] = useWatch({
    control,
    name: ['client', 'chargeBasis', 'quantity', 'unitAmount', 'hoursWorked', 'hourlyRate'],
  })

  // The Flat fields are only required when Flat is selected, and the Hourly fields only when Hourly is
  const requiredFor = (basis: ChargeBasis, message: string) => ({
    validate: (value: string, values: ChargeFormValues) =>
      values.chargeBasis !== basis || value.trim() !== '' || message,
  })

  const amount =
    chargeBasis === 'Flat'
      ? toNumber(quantity) * toNumber(unitAmount)
      : toNumber(hoursWorked) * toNumber(hourlyRate)

  const onSubmit = (data: ChargeFormValues) => {
    console.log({ ...data, amount })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <FormGroup className="col required" controlId="client">
          <FormLabel>Billing Group</FormLabel>
          <FormSelect
            {...register('client', { required: 'Billing Group is required' })}
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
        </FormGroup>
        {/* Sort Group belongs to Billing Group 2 and Reference Number to Billing Group 3; each is
            unregistered when hidden so a value from another billing group isn't submitted */}
        {client === 'Billing Group 2' && (
          <FormGroup className="col required" controlId="sortGroup">
            <FormLabel>Sort Group</FormLabel>
            <FormSelect
              {...register('sortGroup', { required: 'Sort Group is required', shouldUnregister: true })}
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
          </FormGroup>
        )}
        {client === 'Billing Group 3' && (
          <FormGroup className="col required" controlId="referenceNumber">
            <FormLabel>Reference Number</FormLabel>
            <FormControl
              type="text"
              {...register('referenceNumber', {
                required: 'Reference Number is required',
                shouldUnregister: true,
              })}
              isInvalid={!!errors.referenceNumber}
            />
            <Feedback type="invalid">{errors.referenceNumber?.message}</Feedback>
          </FormGroup>
        )}
      </div>

      <div className="row">
        <FormGroup className="col required" controlId="activityDate">
          <FormLabel>Activity Date</FormLabel>
          <FormControl
            type="date"
            {...register('activityDate', { required: 'Activity Date is required' })}
            isInvalid={!!errors.activityDate}
          />
          <Feedback type="invalid">{errors.activityDate?.message}</Feedback>
        </FormGroup>
      </div>

      <FormGroup className="required" controlId="charge">
        <FormLabel>Charge Type</FormLabel>
        <FormSelect
          {...register('charge', { required: 'Charge Type is required', disabled: !client })}
          isInvalid={!!errors.charge}
        >
          <option value="">Select a charge type</option>
          {chargeTypes.map((chargeType) => (
            <option key={chargeType} value={chargeType}>
              {chargeType}
            </option>
          ))}
        </FormSelect>
        <Feedback type="invalid">{errors.charge?.message}</Feedback>
      </FormGroup>

      <FormGroup className="required">
        <FormLabel>Charge Basis</FormLabel>
        <OptList>
          <OptItem label='Flat' id="chargeBasisFlat" value="Flat" type="radio" {...register('chargeBasis', { required: 'Charge Basis is required' })} isInvalid={!!errors.chargeBasis} checked={chargeBasis === 'Flat'} >
            <OptContent isForm>
              <Row className="align-items-end sm-gutters">
                <FormGroup as={Col} className={chargeBasis === 'Flat' ? 'required' : undefined} controlId="quantity">
                  <FormLabel className='fw-normal'>Quantity</FormLabel>
                  <FormControl
                    type="number"
                    {...register('quantity', requiredFor('Flat', 'Quantity is required'))}
                    isInvalid={!!errors.quantity}
                  />
                  <Feedback type="invalid">{errors.quantity?.message}</Feedback>
                </FormGroup>
                <Col xs='auto'>
                  <FormGroup>
                    <div className="form-control-plaintext fw-bold">
                      <i className="fas fa-times"></i>
                    </div>
                  </FormGroup>
                </Col>
                <FormGroup as={Col} className={chargeBasis === 'Flat' ? 'required' : undefined} controlId="unitAmount">
                  <FormLabel className='fw-normal'>Unit Price</FormLabel>
                  <FormControl
                    type="number"
                    {...register('unitAmount', requiredFor('Flat', 'Unit Price is required'))}
                    isInvalid={!!errors.unitAmount}
                  />
                  <Feedback type="invalid">{errors.unitAmount?.message}</Feedback>
                </FormGroup>
                <Col xs='auto'>
                  <FormGroup>
                    <div className="form-control-plaintext fw-bold">
                      <i className="fas fa-equals"></i>
                    </div>
                  </FormGroup>
                </Col>
                <Col xs='auto'>
                  <FormGroup>
                    <div className="form-control-plaintext fw-bold">{currency.format(amount)}</div>
                  </FormGroup>
                </Col>
              </Row>
            </OptContent>
          </OptItem>
          <OptItem label='Hourly' id="chargeBasisHourly" value="Hourly" type="radio" {...register('chargeBasis', { required: 'Charge Basis is required' })} isInvalid={!!errors.chargeBasis} checked={chargeBasis === 'Hourly'} >
            <OptContent isForm>
              <Row className="align-items-end sm-gutters">
                <FormGroup as={Col} className={chargeBasis === 'Hourly' ? 'required' : undefined} controlId="hoursWorked">
                  <FormLabel className='fw-normal'>Hours Worked</FormLabel>
                  <FormControl
                    type="text"
                    {...register('hoursWorked', requiredFor('Hourly', 'Hours Worked is required'))}
                    isInvalid={!!errors.hoursWorked}
                  />
                  <Feedback type="invalid">{errors.hoursWorked?.message}</Feedback>
                </FormGroup>
                <Col xs='auto'>
                  <FormGroup>
                    <div className="form-control-plaintext fw-bold">
                      <i className="fas fa-times"></i>
                    </div>
                  </FormGroup>
                </Col>
                <FormGroup as={Col} className={chargeBasis === 'Hourly' ? 'required' : undefined} controlId="hourlyRate">
                  <FormLabel className='fw-normal'>Hourly Rate</FormLabel>
                  <FormControl
                    type="text"
                    {...register('hourlyRate', requiredFor('Hourly', 'Hourly Rate is required'))}
                    isInvalid={!!errors.hourlyRate}
                  />
                  <Feedback type="invalid">{errors.hourlyRate?.message}</Feedback>
                </FormGroup>
                <Col xs='auto'>
                  <FormGroup>
                    <div className="form-control-plaintext fw-bold">
                      <i className="fas fa-equals"></i>
                    </div>
                  </FormGroup>
                </Col>
                <Col xs='auto'>
                  <FormGroup>
                    <div className="form-control-plaintext fw-bold">{currency.format(amount)}</div>
                  </FormGroup>
                </Col>
              </Row>
            </OptContent>
          </OptItem>
        </OptList>
        {errors.chargeBasis && (
          <Feedback type="invalid" className="d-block">
            {errors.chargeBasis.message}
          </Feedback>
        )}
      </FormGroup>
      <FormGroup controlId="notes">
        <FormLabel>Notes</FormLabel>
        <FormControl as="textarea" {...register('notes')} />
      </FormGroup>
      <div className="d-flex justify-content-end gap-2">
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </div>

    </Form>
  )
}

export default EnterCharge
