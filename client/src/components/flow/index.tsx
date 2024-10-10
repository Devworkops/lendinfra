import * as React from 'react'
import { useEffect } from 'react'
import { useSnackbar } from 'notistack'
import CrudMaterialTable, { type ColumnData } from '../common/CrudMaterialTable'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import { type TableCellRenderer } from 'react-virtualized'
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Link,
  IconButton,
  Tooltip,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import { CustomDateRangePicker } from "../common/CustomDateRangePicker";
import { FlowType, Workflow } from "../../interfaces/IWorkflow";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useTheme } from '@mui/material/styles';
import MButton from "../common/Mbutton";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PageHeading from "../common/PageHeading";
import { Payments } from "@mui/icons-material";
import AddWorkflow from "./AddFlow";
import router from "next/router";
import DataRecordAutoComplete from '../common/DataRecordAutoComplete'
import { DataRecord } from '../../interfaces/IDataRecord'

export type Pagination = {
  page: number,
  maxPageSize: number,
  totalResults: number,
}

interface FilterType {
  type: string
  options: string[]
}

export default function ShowWorkflows(props: {active: boolean}) {
  const theme = useTheme()

  const { auth } = useAuth()

  const { active } = props;
  const [getWorkflows] = useApi<Workflow[]>();
  const [runWorkflow] = useApi<any>();
  const [getWorkflow, saveWorkflow, updateWorkflow] = useApi<Workflow>();
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow>();
  const [selectedRecord, setSelectedRecord] = React.useState<DataRecord>();
  let [statusValue, setstatusValue] = React.useState<string>("All");
  const [ editWorkflow, setEditWorkflow ] = React.useState<boolean>(false);
  const [ data, setData ] = React.useState<Workflow|undefined>();
  const [isOpen, setIsOpen] = React.useState<string>('');
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Filters
  const [filterQuery, setFilterQuery] = React.useState({
    startDate: '',
    endDate: '',
    status: 'All',
    type: 'All',
    options: ''
  })

  const [currentFilter, setCurrentFilter] = React.useState<FilterType>({
    type: '',
    options: []
  })
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    maxPageSize: 100,
    totalResults: 0
  })

  const handleFilterChange = (
    event: SelectChangeEvent | any,
    fieldLabel: string
  ) => {
    const newQuery = {
      ...filterQuery,
      [fieldLabel]: event.target.value as string
    }
    setFilterQuery(newQuery)
    updateData(newQuery, pagination)
  }

  const handleResetFilter = () => {
    const newQuery = {
      startDate: '',
      endDate: '',
      status: 'All',
      type: 'All',
      options: ''
    }
    setFilterQuery(newQuery)
    updateData(newQuery, pagination)
  }

  const handleRunWorkflow = (rowData: Workflow) => {
    setSelectedWorkflow(rowData)
    setIsOpen('run');
  }

  const handleRecordSelection = (record: DataRecord) => {
    setSelectedRecord(record);
  }

  const runWorkflowInstance = () => {
    if (selectedWorkflow && selectedRecord) {
      setIsLoading(true);
      try {
        const response = runWorkflow(`api/workflow/run/${selectedWorkflow.id}?recordId=${selectedRecord.id}`).then((response) => {
          if (response.data.errors) {
            enqueueSnackbar(response.data.errors[0].message, {
              variant: 'error'
            });
            setIsLoading(false);
            setIsOpen('');
          }
          else {
            enqueueSnackbar(response.data.message, {
              variant: 'success'
            });
            setIsLoading(false);
            setIsOpen('');
          }
        })
      } catch (error) {
        enqueueSnackbar('An error occurred while running the workflow.', {
          variant: 'error'
        });
        setIsLoading(false);
        setIsOpen('');
      } 
    }
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
    event: SelectChangeEvent<string>,
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

  useEffect(() => {
    updateData(null, pagination)
  }, [])

  function handlePageChange(pagination: Pagination) {
    updateData(filterQuery, pagination)
  }

  const updateData = async (query: any, pagination: Pagination) => {
    let workflowBaseUrl = `api/workflow/all/${auth?.companyId}`

    const { page, maxPageSize } = pagination
    workflowBaseUrl += `?pageToken=${page}&maxPageSize=${maxPageSize}&active=${active}`;

    if (query) {
      const { type, options, status, startDate, endDate } = query
      let filterQuery = `&status=${status}&options=${options}&type=${type}`

      if (startDate && endDate) { filterQuery += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` }

      workflowBaseUrl += filterQuery
    }

    const [workflowRes] = await Promise.allSettled([
      getWorkflows(workflowBaseUrl)
    ])

    if (workflowRes.status === 'fulfilled') {
      const workflowData = workflowRes.value.data
      if (workflowData.errors) {
        const [{ message }, ..._] = workflowData.errors
        enqueueSnackbar(message, { variant: 'error' })
      } else {
        const { results, totalResults } = workflowData
        setWorkflows(results as Workflow[])
        setPagination({
          page,
          maxPageSize,
          totalResults
        })
      }
    }
  }

  const actionRenderer: TableCellRenderer = ({ rowData }) => {
    return (
      <TableCell><Tooltip title='Run Workflow'>
        <IconButton aria-label="run-workflow" size="small" onClick={() => handleRunWorkflow(rowData)}>
          <PlayCircleOutlineIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      </TableCell>
    );
  };

  const nameRenderer: TableCellRenderer = ({ rowData }) => {
    // setChecked(selectTransactions.includes(rowData.id));
    return (
      <TableCell><Link
        component="button"
        variant="body2"
        onClick={() => {
          router.push('/flow/' + `${rowData.id}`)
        }}
      >
        {rowData.name}
      </Link>
      </TableCell>
    )
  }

  const toggleWorkflowState = (workflowData: Workflow, isActive: boolean) => {
    const response = updateWorkflow(`api/workflow/${workflowData.id}`, { ...workflowData, isActive }).then((response) => {
      if (response.data.errors) {
        enqueueSnackbar(response.data.errors[0].message, {
          variant: 'error'
        });
      }
      else {
        enqueueSnackbar('Saved Succesfully', {
          variant: 'success'
        });
        window.location.reload()
      }
    })
  }

  const activeRenderer: TableCellRenderer = ({ rowData }) => {
    return (
      <TableCell>
        {rowData.isActive.toString().toUpperCase()}
        <Button onClick={() => { toggleWorkflowState(rowData, !rowData.isActive) }}> {rowData.isActive ? 'Deactivate' : 'Activate'} </Button>
      </TableCell>
    )
  }

  const handleEditClick = (rowData: any) => {
    setIsOpen('edit')
    setData(rowData)
  }
  
  const editRenderer : TableCellRenderer = ({ rowData }) => {
    return <TableCell>
      <Button onClick={() => handleEditClick(rowData)}>Edit</Button>
    </TableCell>
  }

  const columns: ColumnData[] = [
    {
      dataKey: "runAction",
      label: "Action",
      width: 80,
      cellRenderer: actionRenderer,
    },
    {
      dataKey: 'name',
      label: 'Name',
      width: 175,
      cellRenderer: nameRenderer
    },
    {
      dataKey: 'description',
      label: 'Description',
      width: 160
    },
    {
      dataKey: 'type',
      label: 'Type',
      width: 160
    },
    {
      dataKey: 'status',
      label: 'Status',
      width: 170
    },
    {
      dataKey: 'isActive',
      label: 'Active',
      width: 170,
      cellRenderer: activeRenderer
    },
    {
      dataKey: 'edit',
      label: 'Edit',
      width: 125,
      cellRenderer: editRenderer
    }
  ]

  return (
    <>
      {workflows && workflows.length > 0
        ? (
          <>
            <AppBar
              position="static"
              color="inherit"
              sx={{ boxShadow: 'none', mb: 3 }}
            >
              <Toolbar sx={{ paddingLeft: '4px !important' }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Workflows
                </Typography>
                <MButton
                  size="small"
                  variant="outlined"
                  onClick={() => { setIsOpen('add') }}
                >
                  Add Workflow
                </MButton>
                <MButton
                  endIcon={<AutorenewIcon></AutorenewIcon>}
                  variant="outlined"
                  sx={{ ml: 2 }}
                >
                  Refresh
                </MButton>
              </Toolbar>
            </AppBar>
            <Box
              sx={{ minWidth: 123, my: 3, mx: 1, display: 'flex', gap: '20px' }}
            >
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
              <FormControl sx={{ minWidth: 150, borderRadius: '2px' }}>
                <InputLabel id="flow-type-select-label">
                  Flow Type
                </InputLabel>
                <Select
                  labelId="flow-type"
                  id="flow-type-simple-select"
                  value={filterQuery.type}
                  label="Type"
                  onChange={(event) => { handleFilterChange(event, 'type') }}
                  sx={{ maxHeight: '48px', borderRadius: '2px' }}
                >
                  <MenuItem value={'All'}>All</MenuItem>
                  <MenuItem value={FlowType.recordTriggered}>Record Triggered</MenuItem>
                  <MenuItem value={FlowType.platformEventTriggeredFlow}>Platform Trigerred</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150, borderRadius: '2px' }}>
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
                  <MenuItem value={'DRAFT'}>Draft</MenuItem>
                  <MenuItem value={'PUBLISHED'}>Published</MenuItem>
                </Select>
              </FormControl>
              {/* {filterQuery.type !== '' && (
              <FormControl sx={{ minWidth: 150, borderRadius: '2px' }}>
                <InputLabel id="option-type-select-label">
                  Filter Options
                </InputLabel>
                <Select
                  labelId="option-type"
                  id="options-type-simple-select"
                  value={filterQuery.options}
                  label="Type"
                  onChange={(event) => { handleFilterChange(event, 'options') }}
                  sx={{ maxHeight: '48px', borderRadius: '2px' }}
                >
                  {currentFilter.options.map((option: string) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}

                  </Select>
                </FormControl>
              )} */}

              <MButton
                variant="outlined"
                sx={{ borderRadius: '60px', matgin: 'auto', pl: 4, pr: 5 }}
                color="secondary"
                onClick={async () => { await updateData(filterQuery, pagination) }}
                size="small"
              >
                Search Workflows
              </MButton>
            </Box>
            <Box sx={{ flexGrow: 'auto' }}>
              <CrudMaterialTable
                key={workflows.length}
                tableRows={workflows}
                setTableRows={setWorkflows}
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
            <PageHeading heading="Workflow" startIcon={<Payments />}>
              <Box component="div" sx={{ justifyContent: 'left' }}>
                <MButton
                  size="small"
                  variant="outlined"
                  onClick={() => { setIsOpen('add') }}
                >
                  Add Workflow
                </MButton>
                <MButton
                  size="small"
                  variant="outlined"
                  onClick={handleResetFilter}
                  sx={{ ml: 2 }}
                >
                  Reset Filter
                </MButton>
              </Box>
              {/* <Box component="div" sx={{ justifyContent: 'left' }}>
                <MButton
                  size="small"
                  variant="outlined"
                  onClick={handleResetFilter}
                >
                  Reset Filter
                </MButton>
              </Box> */}
            </PageHeading>
            <Box sx={{ padding: '30px', justifyContent: 'center', display: 'flex' }}>
              No Record Found
            </Box>
          </>
        )}
      <AddWorkflow open={isOpen} setOpen={setIsOpen} data={data}></AddWorkflow>

      {selectedWorkflow && isOpen == 'run' &&
        <Dialog open={isOpen == 'run'} onClose={() => setIsOpen('')} fullWidth>
          <DialogTitle sx={{ textAlign: 'center' }}>Select {selectedWorkflow.object} Record</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'row' }}>
            <DataRecordAutoComplete handleRecordChange={handleRecordSelection} intialValue={selectedRecord ? selectedRecord : null} objectName={selectedWorkflow.object}></DataRecordAutoComplete>
            <MButton sx={{ height: '30px', marginTop: '20px' }} style={{maxWidth: '105px', width: '100%'}} onClick={runWorkflowInstance} variant='contained'>{isLoading ? 'Please wait' : 'Run'}</MButton>
          </DialogContent>
        </Dialog>
      }
    </>
  )
}
