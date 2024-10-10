import React, { useEffect } from 'react'
import { AppBar, Box, Toolbar, Typography } from '@mui/material'
import { type DataRecord } from '../../interfaces/IDataRecord'
import MButton from '../common/Mbutton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Details from './Details'
import Notes from './Notes'
import Reports from './Reports'
import { Integration } from '../../interfaces/IIntegration';
import useApi from '../../hooks/useApi';
import { useSnackbar } from 'notistack'
import { Note } from '../../interfaces/INote';
import { useAuth } from '../../hooks/useAuth'
import Transactions from '../contractManager/Transactions';
import Applications from './Applications';

export interface Pagination {
  page: number
  maxPageSize: number
  totalResults: number
}

export interface AddDatastoreDialogProps {
  data: DataRecord | undefined
  open: string | undefined
  setOpen: React.Dispatch<React.SetStateAction<string | undefined>>
  label: string
  objectName: string
}


export default function AddEditDataRecord(props: AddDatastoreDialogProps) {
  const { open, setOpen, data, objectName } = props
  const [value, setValue] = React.useState('1');
  const [integrations, setIntegrations] = React.useState<Integration[]>([]);
  const [notesCount, setNotesCount] = React.useState()
  const [getNote, , ,] = useApi<Note>()
  const [getIntegrations, , ,] = useApi<Integration>();
  const { enqueueSnackbar } = useSnackbar()
  const { auth } = useAuth()
  const [filterQuery, setFilterQuery] = React.useState({
    reference: 'datarecord',
    referenceId: '',
    recordId: '',
    startDate: '',
    endDate: ''
  })

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const updateIntegrations = async () => {
    let IntegrationBaseUrl = `api/integration/all`
    const [integrationRes] = await Promise.allSettled([
      getIntegrations(IntegrationBaseUrl)
    ])

    if (integrationRes.status === 'fulfilled') {
      const IntegrationData = integrationRes.value.data
      if (IntegrationData.errors) {
        const [{ message }, ..._] = IntegrationData.errors
        enqueueSnackbar(message, { variant: 'error' })
      } else {
        const { integrations, availableIntegrations } = IntegrationData
        setIntegrations(integrations as Integration[])

      }
    }

  }

  const updateNotesCount = async (query: any) => {
    let noteUrl = `api/note/all/${auth?.companyId}`

    if (query) {
      const { reference, referenceId, recordId, startDate, endDate } = query
      let filterQuery = `?reference=${reference}&referenceId=${data?.dataModel}&recordId=${data?.id}`

      if (startDate && endDate) { filterQuery += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` }

      noteUrl += filterQuery
    }

    const [Notes] = await Promise.allSettled([
      getNote(noteUrl)
    ])

    if (Notes.status === 'fulfilled') {
      const recordNotes = Notes.value.data
      if (recordNotes.errors) {
        const [{ message }, ..._] = recordNotes.errors
        enqueueSnackbar(message, { variant: 'error' })
      } else {
        const { results, totalResults } = recordNotes
        setNotesCount(totalResults)
      }
    }
  }

  useEffect(() => {
    updateIntegrations();
    updateNotesCount(filterQuery);
  }, [])

  return (
    <>
      {open != 'List' &&
        <>
          <AppBar
            position="static"
            color="inherit"
            sx={{ boxShadow: 'none', mb: 3 }}
          >
            <Toolbar sx={{ paddingLeft: '4px !important' }}>
              <MButton
                size="small"
                variant="outlined"
                onClick={() => { setOpen('List') }}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </MButton>
              <Typography variant="h6" component="div" sx={{ paddingLeft: '20px', flexGrow: 1 }}>
                {`${objectName}${data ? ' - ' + data.recordId : ''}`}
              </Typography>
            </Toolbar>
          </AppBar>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label="tabs">
                <Tab label="Details" value="1" />
                {open == 'View' && <Tab label={"Notes " + "(" + notesCount + ")"} value="2" />}
                {objectName == 'IndividualAccount' && open == 'View' && integrations.find((item) => item.name === 'TransUnion') &&
                  <Tab label="Credit Report" value="3" />}
                {objectName == 'IndividualAccount' && open == 'View' && integrations.find((item) => item.name === 'TrustLoop') &&
                  <Tab label="Analytics Report" value="4" />}
                {objectName == 'Contract' && open == 'View' && <Tab label="Transaction" value="5" />}
                {objectName == 'IndividualAccount' && <Tab label="Applications" value="6" /> }
              </TabList>
            </Box>
            <TabPanel value="1">
              <Details data={data} open={open} setOpen={setOpen} objectName={objectName}></Details>
            </TabPanel>
            <TabPanel value="2">
              <Notes data={data} open={open} setNotesCount={setNotesCount}></Notes>
            </TabPanel>
            <TabPanel value="3">
              <Reports data={data} open={open} report={"credit"}></Reports>
            </TabPanel>
            <TabPanel value="4">
              <Reports data={data} open={open} report={"analytics"}></Reports>
            </TabPanel>
            <TabPanel value="5">
              <Transactions companyId={auth?.companyId} contractId={data?.id} />
            </TabPanel>
            <TabPanel value="6">
              <Applications  data={data} ></Applications>
            </TabPanel>
          </TabContext>
        </>
      }
    </>
  )
}
