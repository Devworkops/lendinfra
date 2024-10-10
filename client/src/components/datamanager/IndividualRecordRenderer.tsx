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
import { useRouter } from 'next/router';
import { OpenBanking } from './openBanking/OpenBanking';
import { DataModel } from '../../interfaces/IDataModel';
import ShowWorkflowInstances from '../dashboard/WorkflowInstance';
import Activity from './activity';
export interface Pagination {
  page: number
  maxPageSize: number
  totalResults: number
}

type IndividualAccount = DataRecord | DataRecord[]

export default function IndividualRecordRenderer() {
  const [ value, setValue ] = React.useState('1');
  const [ integrations, setIntegrations ] = React.useState<Integration[]>([]);
  const [ notesCount, setNotesCount ] = React.useState()
  const [ open, setOpen ] = React.useState<string | undefined>('View')
  const [ data, setData ] = React.useState<DataRecord>()
  const [ objectName, setObjectName ] = React.useState<string>('')
  const [ individualAccount, setIndividualAccount ] = React.useState<IndividualAccount | undefined>();
  const [ dataModel, setDataModel ] = React.useState<DataModel>()
  const [ getData, , , ] = useApi<DataRecord | DataModel>()
  const [ getNote, , , ] = useApi<Note>()
  const [ getIntegrations, , , ] = useApi<Integration>();
  const { enqueueSnackbar } = useSnackbar()
  const { auth } = useAuth()
  const [ filterQuery, setFilterQuery ] = React.useState({
    reference: 'datarecord',
    referenceId: '',
    recordId: '',
    startDate: '',
    endDate: ''
  })

  const router = useRouter();
  const { id } = router.query;

  let recordHeadingText = objectName;
  if(data && dataModel) {
    recordHeadingText = data.recordId;
    if(dataModel.label === 'Application' && !Array.isArray(individualAccount)) {
      if(individualAccount?.recordId)
        recordHeadingText += ' - ' + individualAccount?.recordId;
      if(individualAccount?.fields?.['FirstName'])
        recordHeadingText += ' - ' + individualAccount?.fields?.['FirstName']
      if(individualAccount?.fields?.['LastName'])
        recordHeadingText += ' - ' + individualAccount?.fields?.['LastName']
    } else if (dataModel.label === 'Account') {
      if(dataModel.name == "BusinessAccount"){
        recordHeadingText += ' - ' + data?.fields?.['BusinessName']
      }else {
        recordHeadingText += ' - ' + data?.fields?.['FirstName'] + ' ' + data?.fields?.['LastName']
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ newData ] = await Promise.allSettled([getData(`api/datarecord/${id}`)]);
        if(newData.status === 'fulfilled'){
          setData(newData.value.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (id!==undefined) {
      fetchData();
    } 
  }, [id]);

  useEffect(() => {
    if (data) {    
      const fetchData = async () => {
        try {
          const [ model ] = await Promise.allSettled([getData(`api/datamodel/${data.dataModel}`)]);
          if(model.status === 'fulfilled'){
            setDataModel(model.value.data);
          }
        } catch (error) {
          console.error('Error fetching data model:', error);
        }
      };
      fetchData();      
      setObjectName(data.objectName);
    }
  }, [data, id]); 
  
  useEffect(() => {
    const fetchData = async (recordId: string) => {
      try {
        const [ newData ] = await Promise.allSettled([getData(`api/datarecord/${recordId}`)]);
        if(newData.status === 'fulfilled'){
          setIndividualAccount((prev)=>{
              if(Array.isArray(prev)){
                return [...prev, newData.value.data]
              }else return [newData.value.data]
          });
        }
      } catch (error) {
        console.log('Error fetching individual account:', error);
      }
    };

    if(dataModel && dataModel.label === 'Application'){
      let recordId;
      for(const key in dataModel?.properties) {
        //@ts-ignore
        if(dataModel.properties[key].type === 'reference'  )
          recordId = data?.fields[key];
        }
      if(recordId)
        fetchData(recordId);  
    } else if(dataModel?.label == 'Account' && dataModel?.name != "BusinessAccount") {
      setIndividualAccount(data ? [data] : []);
    } 
    else if (dataModel?.label == 'Contract') {
      let recordId;
      for (const key in dataModel?.properties) {
        //@ts-ignore
        if (dataModel.properties[key].type === 'reference' && dataModel.properties[key].ref === 'IndividualAccount') {
          recordId = data?.fields[key];
          fetchData(recordId)
        } else if (dataModel.properties[key].type === 'object' && dataModel.properties[key].properties) {
          for (const subKey in data?.fields[key]) {
            recordId = data?.fields[key][subKey]
            if (recordId) {
              fetchData(recordId);
            }
          }
        } else if(dataModel.properties[key].type === 'reference'){
          recordId = data?.fields[key];
          fetchData(recordId);
        }
      }
    }
    else if (dataModel?.name == 'BusinessAccount') {
      let recordId;
      for (const key in dataModel?.properties) {
        //@ts-ignore
        if (dataModel.properties[key].type === 'reference' && dataModel.properties[key].ref === 'IndividualAccount') {
          recordId = data?.fields[key];
          fetchData(recordId)
        } else if (dataModel.properties[key].type === 'object' && dataModel.properties[key].properties) {
          for (const subKey in data?.fields[key]) {
            recordId = data?.fields[key][subKey]
            if (recordId) {
              fetchData(recordId);
            }
          }
        } else if(dataModel.properties[key].type === 'reference'){
          recordId = data?.fields[key];
          fetchData(recordId);
        }
      }
    }
  },[dataModel, data, id])

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

    if (data) {
      const { reference, startDate, endDate } = query
      let filterQuery = `?reference=${reference}&referenceId=${data.dataModel}&recordId=${id}`

      if (startDate && endDate) { filterQuery += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` }

      noteUrl += filterQuery
      
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
  }

  useEffect(()=>{
    updateIntegrations();
  },[])

  useEffect(() => {
    updateNotesCount(filterQuery);
  }, [data, id])


  return (
    <>
      { data &&
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
                onClick={() => { 
                  // setOpen('List')
                  router.push(`/${router.pathname.split('/')[1]}`)
                 }}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </MButton>
              <Typography variant="h6" component="div" sx={{ paddingLeft: '20px', flexGrow: 1 }}>
                {recordHeadingText}
              </Typography>
            </Toolbar>
          </AppBar>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label="tabs">
                <Tab label="Details" value="1" />
                {open == 'View' && <Tab label={"Notes " + "(" + notesCount + ")"} value="2" />}
                {(objectName == 'IndividualAccount' || dataModel?.label == 'Application') && open == 'View' && integrations.find((item) => item.name === 'TransUnion') &&
                  <Tab label="Credit Report" value="3" />}
                {(objectName == 'IndividualAccount' || dataModel?.label == 'Application') && open == 'View' && integrations.find((item) => item.name === 'TrustLoop') &&
                  <Tab label="Open Banking" value="4" />}
                {objectName == 'Contract' && open == 'View' && <Tab label="Transaction" value="5" />}
                {objectName == 'IndividualAccount' && <Tab label="Applications" value="6" /> }
                {(objectName == 'IndividualAccount' || dataModel?.label == 'Application') && <Tab label="Workflows" value="7" /> }
                {objectName == 'Application' && <Tab label="Activity" value="8" /> }
              </TabList>
            </Box>
            <TabPanel value="1">
              <Details individualAccount={individualAccount} data={data} open={open} setOpen={setOpen} objectName={objectName}></Details>
            </TabPanel>
            <TabPanel value="2">
              <Notes data={data} open={open} setNotesCount={setNotesCount}></Notes>
            </TabPanel>
            <TabPanel value="3">
              {Array.isArray(individualAccount) ? <Reports data={individualAccount[0]} open={open} report={"credit"}></Reports> : <Reports 
              data={individualAccount} open={open} report={"credit"}></Reports>}
            </TabPanel>
            <TabPanel value="4">
              {Array.isArray(individualAccount) ? <OpenBanking account={individualAccount[0]} data={data}></OpenBanking> : <OpenBanking account={individualAccount} data={data}></OpenBanking> }
            </TabPanel>
            <TabPanel value="5">
              <Transactions companyId={auth?.companyId} contractId={data?.id} />
            </TabPanel>
            <TabPanel value="6">
              <Applications  data={data} ></Applications>
            </TabPanel>
            <TabPanel value="7">
              <ShowWorkflowInstances objectName={objectName} recordId={data.id}></ShowWorkflowInstances>
            </TabPanel>
            <TabPanel value="8">
              <Activity data={data} open={open} objectName={objectName}></Activity>
            </TabPanel>
          </TabContext>
        </>
      }
    </>
  )
}
