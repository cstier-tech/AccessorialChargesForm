import { useState } from 'react'
import { Card, CardBody, Layout, Row, Tab, Tabs, Col } from 'oa'
import EnterCharge from './tabs/EnterCharge.tsx'
import ImportSpreadsheet from './tabs/ImportSpreadsheet.tsx'

type TabKey = 'enterCharge' | 'importSpreadsheet'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('enterCharge')

  return (
    <>
      <div className='w-100 bg-gray-200 muted p-4 text-center'>HEADER</div>
      <Layout>
        <Row>
          <Col lg='8' className='m-auto'>
            <Card className='card-shadow'>
              <Tabs
                id="accessorial-charges-tabs"
                activeKey={activeTab}
                onSelect={(key) => setActiveTab(key as TabKey)}
                tabStyle='line'
                className='nav-justified'
              >
                <Tab eventKey="enterCharge" title="Enter a Charge" className='mt-0'>

                  <CardBody className='px-4 pt-1'>
                    <EnterCharge />
                  </CardBody>

                </Tab>
                <Tab eventKey="importSpreadsheet" title="Import Spreadsheet">
                  <CardBody className='px-4 pt-1'>
                    <ImportSpreadsheet />
                  </CardBody>

                </Tab>
              </Tabs>
            </Card>
          </Col>
        </Row>

      </Layout>
      <div className='w-100 bg-gray-200 muted p-6 text-center'>
        FOOTER
      </div>
    </>

  )
}

export default App
