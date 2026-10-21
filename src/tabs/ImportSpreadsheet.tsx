import { useState } from 'react'
import { Costep, Costeps, Icon, type CostepStatus } from 'oa'
import Upload from './importSteps/Upload.tsx'
import MatchColumns from './importSteps/MatchColumns.tsx'
import Review from './importSteps/Review.tsx'
import { type ChargeRow, type ImportedData } from './importSteps/types.ts'

const STEPS = [
  { label: 'Upload', icon: 'upload' },
  { label: 'Match Columns', icon: 'exchange-alt' },
  { label: 'Review', icon: 'check' },
] as const

function ImportSpreadsheet() {
  const [step, setStep] = useState(0)
  const [importedData, setImportedData] = useState<ImportedData | null>(null)
  const [chargeRows, setChargeRows] = useState<ChargeRow[]>([])

  const isLastStep = step === STEPS.length - 1
  const stepProps = {
    onBack: step > 0 ? () => setStep(step - 1) : undefined,
    onNext: () => {
      if (!isLastStep) setStep(step + 1)
    },
    nextLabel: isLastStep ? 'Import' : 'Next',
  }

  function statusFor(index: number): CostepStatus {
    if (index === step) return 'active'
    return index < step ? 'visited' : 'inactive'
  }

  return (
    <>
      <Costeps>
        {STEPS.map(({ label, icon }, index) => (
          <Costep
            key={label}
            label={label}
            icon={<Icon name={icon} />}
            step={index + 1}
            status={statusFor(index)}
            colClassName="col-4"
          />
        ))}
      </Costeps>

      {step === 0 && <Upload {...stepProps} onParsed={setImportedData} />}
      {step === 1 && (
        <MatchColumns {...stepProps} data={importedData} onMatched={setChargeRows} />
      )}
      {step === 2 && (
        <Review {...stepProps} rows={chargeRows} />
      )}
    </>
  )
}

export default ImportSpreadsheet
