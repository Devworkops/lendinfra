import * as React from 'react'
import { useEffect } from 'react'
import moment from 'moment'
import { useSnackbar } from 'notistack'
import CrudMaterialTable, { type ColumnData } from '../common/CrudMaterialTable'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import { type TableCellRenderer } from 'react-virtualized'
import {
  FormControl,
  type SelectChangeEvent,
  Box,
  TableCell,
  AppBar,
  Toolbar,
  Typography,
  Link,
  Menu,
  MenuItem,
  Button,
  InputLabel,
  Select,
  TextField
} from '@mui/material'
import { CustomDateRangePicker } from '../common/CustomDateRangePicker'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import MButton from '../common/Mbutton'
import PageHeading from '../common/PageHeading'
import { Payments } from '@mui/icons-material'
import { type DataRecord } from '../../interfaces/IDataRecord'
import AddEditDataRecord from './AddEditData'
import { DataModel } from '../../interfaces/IDataModel'
import WorkflowRunDetail from './WorkflowRunDetail'
import { useRouter } from 'next/router';
import DataRecordDetails from './DataRecordDetails'
import Search from './Search'
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';


export interface Pagination {
  page: number
  maxPageSize: number
  totalResults: number
}

interface FilterType {
  objectName: string
  options: string[]
}

export default function DataStoreManager(props: { objectName: string, label: string }) {
  const { auth } = useAuth()
  const { objectName, label } = props;
  const [getData, postData,,] = useApi<any>()
  const [getDataModels] = useApi<DataModel[]>()
  const [DataModels, setDataModels] = React.useState<DataModel[]>([])
  const [ accountsData, setAccountsData ] = React.useState<DataRecord[]>([])
  const [data, setData] = React.useState<DataRecord[]>([])
  const [selectedData, setSelectedData] = React.useState<DataRecord>()
  const [statusValue, setstatusValue] = React.useState<string>('All')
  const [isOpen, setIsOpen] = React.useState<string | undefined>('List')
  const [showWorkflow, setShowWorkflow] = React.useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [selectedObject, setSelectedObject] = React.useState('')
  const [objectNames, setObjectNames] = React.useState<String[]>([])
  const [ statuses, setStatuses ] = React.useState<string[]>([]);
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState({status:false,reason:false,id:''});
  const [selectedStatusOrReason, setSelectedStatusOrReason] = React.useState({status:'',reason:'', id: ''}); 
  const [, , updateDataRecord,] = useApi<DataRecord>()
  const [ isStatusEditingMode, setIsStatusEditingMode ] = React.useState<boolean>(false);
  const [ isReasonEditingMode, setIsReasonEditingMode ] = React.useState<boolean>(false);


  useEffect(() => {
    // Access query parameters from the router object
    const { recordId } = router.query;
    if (recordId) {
      const rowData = data.find(el => el.id === recordId)
      if (rowData) {
        setIsOpen('View')
        setSelectedData(rowData);
        setSelectedObject(rowData.objectName)
      }
    }
  }, [router.query, data]);

  // Filters
  const [filterQuery, setFilterQuery] = React.useState({
    startDate: '',
    endDate: '',
    status: 'All',
    objectName: objectNames,
    options: ''
  })

  const [currentFilter, setCurrentFilter] = React.useState<FilterType>({
    objectName: objectName,
    options: []
  })
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    maxPageSize: 100,
    totalResults: 0
  })

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: any) => {
    setIsOpen('New')
    setAnchorEl(null);
    setSelectedObject(event?.target.outerText)
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChanges = (payload: any) => {
    const newQuery = {
      ...filterQuery,
      startDate: payload.startDate,
      endDate: payload.endDate
    }
    setFilterQuery(newQuery)
    updateData(newQuery, pagination)
  }

  const handleStatusFilterChange = (
    event: React.MouseEvent<HTMLElement> | SelectChangeEvent<string>,
    value: string
  ) => {
    if (event && statusValue !== value) {
      const newQuery = {
        ...filterQuery,
        status: value
      }
      setFilterQuery(newQuery)
      setstatusValue(value)
      updateData(newQuery, pagination)
    }
  }
  const handleResetFilter = () => {
    const newQuery = {
      startDate: '',
      endDate: '',
      status: 'All',
      objectName: objectNames,
      options: ''
    }
    setFilterQuery(newQuery)
    updateData(newQuery, pagination)
  }

  useEffect(() => {
    getObjects()
    updateDataModel()
  }, [isOpen])

  function handlePageChange(pagination: Pagination) {
    updateData(filterQuery, pagination)
  }

  const getObjects = async () => {
    const [labels] = await Promise.allSettled([
      getData(`api/dataModel/reference`)
    ])
    if (labels.status == 'fulfilled') {
      const labelsData = labels.value.data
      if (labelsData.errors) {
        const [{ message }, ..._] = labelsData.errors
        enqueueSnackbar(message, { variant: 'error' })
      } else {
        const labelObjects = labelsData.filter((data: { label: string }) => { return data.label === label }).map((object: { id: any }) => object.id)
        setObjectNames(labelObjects)
        const newQuery = {
          startDate: '',
          endDate: '',
          status: 'All',
          objectName: labelObjects,
          options: ''
        }
        updateData(newQuery, pagination)
        setFilterQuery(newQuery)
      }
    }
  }

  const updateData = async (query: any, pagination: Pagination) => {
    let workflowBaseUrl = `api/datarecord/all/${auth?.companyId}`

    const { page, maxPageSize } = pagination
    workflowBaseUrl += `?pageToken=${page}&maxPageSize=${maxPageSize}`

    if (query) {
      const { objectName, options, status, startDate, endDate } = query
      let filterQuery = ''
      if (status) filterQuery += `&status=${status}`
      if (options) filterQuery += `&options=${options}`

      if (startDate && endDate) { filterQuery += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` }

      if (objectName.length > 1) {
        objectName.forEach((object: any) => {
          filterQuery += `&objectName=${object}`
        }
        )
      }
      else {
        filterQuery += `&objectName=${objectName[0]}`
      }

      workflowBaseUrl += filterQuery
    }

    const [DataRecordes] = await Promise.allSettled([
      getData(workflowBaseUrl)
    ])

    if (DataRecordes.status === 'fulfilled') {
      const workflowData = DataRecordes.value.data
      if (workflowData.errors) {
        const [{ message }, ..._] = workflowData.errors
        enqueueSnackbar(message, { variant: 'error' })
      } else {
        const { results, totalResults } = workflowData
        if(results.length > 0) {
          setData(results as DataRecord[])
          setPagination({
            page,
            maxPageSize,
            totalResults
          })
        } else {
          enqueueSnackbar('No Record Found', {variant: 'warning'})
        }
      }
    }
  }

  const updateDataModel = async () => {
    let DataModelBaseUrl = `api/DataModel/all/${auth?.companyId}?label=${label}`

    const [datmodelRes] = await Promise.allSettled([
      getDataModels(DataModelBaseUrl),
    ])

    if (datmodelRes.status === "fulfilled") {
      const workflowData = datmodelRes.value.data
      if (workflowData.errors) {
        const [{ message }, ..._] = workflowData.errors
        enqueueSnackbar(message, { variant: "error" })
      } else {
        const { results, totalResults } = workflowData
        setDataModels(results as DataModel[])
      }
    }
  };
  const filteredApplications = DataModels.find(item => item.name == "Application");
  const statusList = filteredApplications?.properties?.Status?.list

  const handleStatusChange = (value: string, type: string, id:string) => {
    setSelectedStatusOrReason((prev)=>{
      return {...prev, [type]: value, id}
    })
  };

  const editingHandler = (type: string, id: string) => {
    setIsEditing((prev) => {
      const isReason = type === "reason";
      const isStatus = type === "status";
  
      if (prev.id !== id) {
        setSelectedStatusOrReason({ status: '', reason: '', id });
      }  
      return { status: isStatus ? !prev.status : false, reason: isReason ? !prev.reason : false, id };
    });
  };

  const handleSubmit=async (rawData:any,status:string, reason:string) => {
    let updateForm:boolean = false;
    let result
    if (reason && status) {
      rawData.fields.Status = status;
      rawData.fields['Status Reason'] = reason;
      updateForm = true
    } else if(status){
      rawData.fields.Status = status;
      updateForm = true
    } else if (reason){
      rawData.fields['Status Reason'] = reason;
      updateForm = true
    } else {
      updateForm = false
    }

    if(updateForm){
      setIsEditing({status:false,reason:false,id:''})
      result = await updateDataRecord(`api/datarecord/${rawData.id}`, rawData)
      if (result && result.data.errors) {
        enqueueSnackbar(result.data.errors[0].message, {
            variant: 'error'
        })
      } else {
        enqueueSnackbar('Record updated Successfully', {variant: 'success'})
      }
    } else {
      enqueueSnackbar('No value to Update', {variant: 'success'})
    }
  }

  const fieldsRenderer: TableCellRenderer = ({ rowData }) => {
      let status = JSON.stringify(rowData.fields['Status'], null, 0);
      status = status ? status.replaceAll('"', ''):'';
      return (
        <TableCell>
          {isEditing.status == true  && isEditing.id == rowData.id ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Select value={(rowData.id === selectedStatusOrReason.id) ? (selectedStatusOrReason.status || status)  : status} 
              onChange={(e)=>handleStatusChange(e.target.value, "status",rowData.id)}
              style={{ minWidth:'130px'}}>
                {statusList.map((status: any) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
              &ensp;
              {isStatusEditingMode && <>
                < SaveIcon
                  onClick={() => {
                    handleSubmit(rowData,selectedStatusOrReason.status, selectedStatusOrReason.reason ),
                    setIsStatusEditingMode(false)
                  }}
                  style={{ cursor: 'pointer', color: 'black' }}
                />
                &ensp;
                <CancelIcon
                  onClick={() => {
                    setIsEditing((prev)=>{return  {...prev, status: false}})
                    setSelectedStatusOrReason({status:'',reason:'', id: ''});
                    setIsStatusEditingMode(false)
                  }}
                  style={{ cursor: 'pointer', color: 'grey' }}
                />
              </>}
            </div>
          ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <EditIcon
                    onClick={() =>{ editingHandler('status',rowData.id), setIsStatusEditingMode(true)}}
                    style={{ cursor: 'pointer', color: '#EAEAEA' }}
                  />&ensp;
                  <span style={{ marginRight: '8px' }}>{rowData.id === selectedStatusOrReason.id ? (selectedStatusOrReason.status || status)  : status}</span>
                </div>
              </>
            )}
        </TableCell>
      )
  }

  const getDataRecordsFunction = async () => {
    let accounts = data.map(application =>
      application.objectName === "Overdraft Application" 
      ? application.fields['Account'] 
      : application.objectName === "Contract" ? application.fields['AccountId'] : application.fields['IndividualAccount']
    );
    
    if(accounts && accounts.length > 0) {
      const response = await postData(`api/datarecords/accounts`, {accounts: accounts});

      if (response.status === 200) {
        setAccountsData(response.data as DataRecord[])
      }
    }
  }

  const getRecordName = (id: string) => {
    let record: {
      id: string
      label: string
    } = { id: '', label: ''};
    const selectedDataRecord = accountsData.find(function (item) {
        return item.id === id;
    });
  if(selectedDataRecord && selectedDataRecord.fields){
    record.label = (selectedDataRecord.fields.FirstName) ? selectedDataRecord.recordId + ' ' + selectedDataRecord.fields.FirstName + ' ' + selectedDataRecord.fields.LastName
    : selectedDataRecord.recordId+ ' ' + selectedDataRecord.fields.BusinessName;
    record.id = selectedDataRecord.id;
        return record
    }
  }

  useEffect(() => {
    if((objectName === 'Application' || objectName === 'Overdraft Application' || objectName === 'Contract' )&& data){
      getDataRecordsFunction();
    }
  }, [data]);


  const applicationNameColumnRenderer: TableCellRenderer = ({ rowData }) => {
    let userId=''
    if(rowData.objectName == "Overdraft Application"){
       userId = rowData.fields['Account'];
    }else if (rowData.objectName == "Contract") {
      userId = rowData.fields['AccountId'];
    }else{
       userId = rowData.fields['IndividualAccount'];
    }
    const userIdLabel = getRecordName(userId);
    if(userId && userIdLabel) {
      return <TableCell>
        <Link href={`/accounts/${userId}`}>{userIdLabel.label}</Link>
      </TableCell>;
    }
  }

  const IdRenderer: TableCellRenderer = ({ rowData }) => {
    let type: string;
    if(label === 'Account') type = 'accounts';
    else if(label === 'Application') type = 'applications';
    else if(label === 'Contract') type = 'contracts';
    else type ='undefined';
    
    // setChecked(selectTransactions.includes(rowData.id));
    return (
      <TableCell><Link
        // component="button"
        variant="body2"
        onClick={() => {
          setSelectedData(rowData);
          setSelectedObject(rowData.objectName)
          // router.push(`/${type}/${rowData.id}`)
        }}
        href={`/${type}/${rowData.id}`}
      >
        {rowData.recordId}
      </Link>
      </TableCell>
    )
  }

  const NameRenderer: TableCellRenderer = ({ rowData }) => {
    return (
      <TableCell>
        {rowData.objectName=="BusinessAccount" ? rowData.fields.BusinessName || '' :(rowData.fields.FirstName || '') + ' ' + (rowData.fields.LastName || '')}
      </TableCell>
    )
  }

  const createdFieldsRenderer: TableCellRenderer = ({ rowData, dataKey }) => {
    switch (dataKey) {
      case 'createdat':
        return (
          <TableCell>{moment.utc(rowData.createdAt).format('DD/MM/YYYY HH:mm')}</TableCell>)
      case 'type':
        return (
          <TableCell>{rowData.objectName}</TableCell>)
      case 'statusReason':
        return (
          <TableCell style={{width:'auto', display: 'flex'}} >{displayStatusReason(rowData)}</TableCell>)
      case 'introducer':
        return (
          <TableCell>{rowData.fields.Introducer && rowData.fields.Introducer}</TableCell>)
      case 'LxPAgrId':
        return (
          <TableCell>{rowData.fields.LxPAgrId ? rowData.fields.LxPAgrId :''}</TableCell>)
      case 'FacilityAmount':
        return (
          <TableCell>{rowData.fields.FacilityAmount}</TableCell>)
      case 'email':
        return (
          <TableCell>{rowData.fields.Email ? rowData.fields.Email : ''}</TableCell>)
      case 'loanAmount':
        return (
          <TableCell>{rowData.fields.LoanAmount ? `£${rowData.fields.LoanAmount.toLocaleString()}` : ''}</TableCell>)
    }
  }

  const handleReasonChange = (value: string, type: string, id:string) => {
    setSelectedStatusOrReason((prev)=>{
      return {...prev, [type]: value,id}
    })
  }; 

  const displayStatusReason = (rowData:any) => {
    let statusReason = JSON.stringify(rowData.fields['Status Reason'], null, 0);
    statusReason = statusReason ? statusReason.replaceAll('"', ''):''
    return (
      <>
        {isEditing.reason == true   && isEditing.id == rowData.id ? (
          <div style={{ display: 'flex', alignItems: 'center', width:'100%' }}>
            <TextField
            value={rowData.id === selectedStatusOrReason.id ? (selectedStatusOrReason.reason || statusReason)  : statusReason}
            onChange={(e) => handleReasonChange(e.target.value,'reason',rowData.id)}
            variant="outlined"
            size="small"
            style={{ width: '100%', maxWidth: '20rem'}}
          />
            &ensp;
            {isReasonEditingMode && <>
              <SaveIcon
                onClick={() => {
                  handleSubmit(rowData,selectedStatusOrReason.status, selectedStatusOrReason.reason),
                  setIsReasonEditingMode(false)
                }}
                style={{ cursor: 'pointer', color: 'black' }}
                />
              <CancelIcon
                onClick={() => {
                  setIsEditing((prev)=>{return  {...prev, reason: false}})
                  setSelectedStatusOrReason({status:'',reason:'',id:''})
                  setIsReasonEditingMode(false)
                }}
                style={{ cursor: 'pointer', color: 'grey' }}
                />
            </>}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <EditIcon
                  onClick={() => { editingHandler('reason', rowData.id)
                    setIsReasonEditingMode(true)
                  }}
                  style={{ cursor: 'pointer', color: '#EAEAEA'}} // Space between icon and text
              />&ensp;
              <span>{rowData.id === selectedStatusOrReason.id ? (selectedStatusOrReason.reason || statusReason) : statusReason}</span>
          </div>
          )}
      </>
    )
  };

  const columns: ColumnData[] = [
    {
      dataKey: 'recordId',
      label: 'Id',
      width: 150,
      cellRenderer: IdRenderer
    },
    {
      dataKey: 'fields',
      label: 'Name',
      width: 150,
      cellRenderer: NameRenderer
    },
    {
      dataKey: 'type',
      label: 'Type',
      width:   140,
      cellRenderer: createdFieldsRenderer
    },
    {
      dataKey: 'createdat',
      label: 'Created At',
      width: 150,
      cellRenderer: createdFieldsRenderer
    }
  ]

  if (label == 'Application') {
    columns.map(column => {
      if(column.dataKey === 'fields' && column.label == 'Name') {
        column.cellRenderer = applicationNameColumnRenderer;
      }
    })
    columns.splice(1,0,{
      dataKey: 'LxPAgrId',
      label: 'LXP AgrID',
      width: 125,
      cellRenderer: createdFieldsRenderer
    })
    columns.splice(3,0,{
      dataKey: 'loanAmount',
      label: 'Loan Amount',
      width: 125,
      cellRenderer: createdFieldsRenderer
    })
    columns.push({
      dataKey: 'fields',
      label: 'Status',
      width: isStatusEditingMode ? 250 :190,
      cellRenderer: fieldsRenderer
    })
    columns.push({
      dataKey: 'statusReason',
      label: 'Status Reason',
      width: isReasonEditingMode ? 400 : 300,
      cellRenderer: createdFieldsRenderer
    })
    columns.push({
      dataKey: 'introducer',
      label: 'Introducer',
      width: 200,
      cellRenderer: createdFieldsRenderer
    })
  }
  if (label == 'Contract') {
    columns.map(column => {     
      if(column.dataKey === 'fields' && column.label == 'Name') {
        column.cellRenderer = applicationNameColumnRenderer;
      }
    })
    columns.splice(2, 0, {
      dataKey: 'FacilityAmount',
      label: 'Amount',
      width: 200,
      cellRenderer: createdFieldsRenderer
    });
  }
  if (objectName == 'Account') {
    columns.splice(2,0,{
      dataKey: 'email',
      label: 'Email',
      width: 200,
      cellRenderer: createdFieldsRenderer
    });
  }

  return (
    <>{isOpen == 'List' ?
      <>
        {data && data.length > 0
          ? (
            <>
              <AppBar
                position="static"
                color="inherit"
                sx={{ boxShadow: 'none', mb: 3 }}
              >
                <Toolbar sx={{ paddingLeft: '4px !important' }}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {label + 's'}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleClick}
                  >
                    Add {label}
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    {DataModels.map((Datamodel: DataModel) => (
                      <MenuItem onClick={(event) => handleMenuOpen(event)}>{Datamodel.name}</MenuItem>
                    ))}
                  </Menu>
                  <MButton
                    endIcon={<AutorenewIcon></AutorenewIcon>}
                    variant="outlined"
                    sx={{ ml: 2 }}
                    onClick={handleStatusFilterChange}
                  >
                    Refresh
                  </MButton>
                </Toolbar>
              </AppBar>
              {label==='Application' && <DataRecordDetails setStatusesArray={setStatuses} />}
              <Box
                sx={{ minWidth: 123, my: 3, mx: 1, display: 'flex', gap: '20px' }}
              >
                <Search objectName={objectName} setData={setData} />
                <FormControl
                  sx={{ minWidth: 130, borderRadius: '2px' }}
                  size="small"
                >
                  <CustomDateRangePicker
                    startDate=""
                    endDate=""
                    handleChanges={handleChanges}
                    size="small"
                  ></CustomDateRangePicker>
                </FormControl>
              {router.pathname.includes('application') && <FormControl sx={{ minWidth: 150, borderRadius: '2px' }}>
                  <InputLabel id="status-select-label">
                      Status
                  </InputLabel>
                  <Select
                      labelId="status"
                      id="status-simple-select"
                      value={filterQuery.status}
                      label="Status"
                      onChange={(event) => { handleStatusFilterChange(event, event.target.value) }}
                      sx={{ maxHeight: '48px', borderRadius: '2px' }}
                  >
                      <MenuItem value={'All'}>All</MenuItem>
                      {statuses.map(status=> <MenuItem value={status}>{status}</MenuItem>)}
                  </Select>
                </FormControl>}
                <MButton
                  variant="outlined"
                  sx={{ borderRadius: '60px', matgin: 'auto', pl: 4, pr: 5 }}
                  color="secondary"
                  onClick={async () => { await updateData(filterQuery, pagination) }}
                  size="small"
                >
                  Filter Records
                </MButton>
              </Box>
              <Box sx={{ flexGrow: 'auto' }}>
                <CrudMaterialTable
                  key={data.length}
                  tableRows={data}
                  setTableRows={setData}
                  columns={columns}
                  isReadOnly={true}
                  pagination={{
                    ...pagination,
                    onPageChange: handlePageChange
                  }}
                  tableHeight="calc(80vh - 140px)"
                ></CrudMaterialTable>
              </Box>
            </>
          )
          : (
            <>
              <PageHeading heading={label + 's'} startIcon={<Payments />}>
                <Box component="div" sx={{ justifyContent: 'left' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleClick}
                  >
                    Add {label}
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    {DataModels && DataModels.map((Datamodel: DataModel) => (
                      <MenuItem onClick={(event) => handleMenuOpen(event)}>{Datamodel.name}</MenuItem>
                    ))}
                  </Menu>
                  <MButton
                    size="small"
                    variant="outlined"
                    onClick={handleResetFilter}
                    sx={{ ml: 2 }}
                  >
                    Reset Filter
                  </MButton>
                </Box>
              </PageHeading>
              <Box sx={{ padding: '30px', justifyContent: 'center', display: 'flex' }}>
                No Record Found
              </Box>
            </>
          )}
      </> :
        <AddEditDataRecord open={isOpen} setOpen={setIsOpen} data={isOpen != 'New' ? selectedData : undefined} label={label} objectName={selectedObject}></AddEditDataRecord>
    }
    </>
  )
}
