import * as React from 'react'
import moment from 'moment'
import { useEffect } from 'react'
import { useSnackbar } from 'notistack'
import CrudMaterialTable, { TableCell, type ColumnData } from '../common/CrudMaterialTable'
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
    Typography,
    Link,
} from "@mui/material";
import { CustomDateRangePicker } from "../common/CustomDateRangePicker";
import { WorkflowInstance } from "../../interfaces/IWorkflow";
import MButton from "../common/Mbutton";
import router from "next/router";
import WorkflowRunDetail from '../datamanager/WorkflowRunDetail'

export type Pagination = {
    page: number,
    maxPageSize: number,
    totalResults: number,
}

interface FilterType {
    type: string
    options: string[]
}

export default function ShowWorkflowInstances(props: { objectName: string, recordId: string | undefined }) {
    const { auth } = useAuth()
    const { objectName, recordId } = props;
    const [getWorkflows] = useApi<WorkflowInstance[]>();
    const [workflows, setWorkflows] = React.useState<WorkflowInstance[]>([]);
    let [statusValue, setstatusValue] = React.useState<string>("All");
    const [showWorkflow, setShowWorkflow] = React.useState<boolean>(false);
    const [selectedData, setSelectedData] = React.useState<WorkflowInstance>()
    const { enqueueSnackbar } = useSnackbar();

    // Filters
    const [filterQuery, setFilterQuery] = React.useState({
        startDate: '',
        endDate: '',
        status: 'All',
        type: '',
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
    }

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

    const handleResetFilter = () => {
        const newQuery = {
            startDate: '',
            endDate: '',
            status: 'All',
            type: '',
            options: ''
        }
        setFilterQuery(newQuery)
        updateData(newQuery, pagination)
    }

    useEffect(() => {
        updateData(null, pagination)
    }, [])

    function handlePageChange(pagination: Pagination) {
        updateData(filterQuery, pagination)
    }

    const updateData = async (query: any, pagination: Pagination) => {
        let workflowBaseUrl = `api/workflow/instance/all/${auth?.companyId}`

        const { page, maxPageSize } = pagination
        workflowBaseUrl += `?pageToken=${page}&maxPageSize=${maxPageSize}`

        if (query) {
            const { type, options, status, startDate, endDate } = query
            let filterQuery = `&status=${status}&options=${options}&type=${type}`

            if (startDate && endDate) { filterQuery += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` }

            workflowBaseUrl += filterQuery
        }

        if (recordId) {
            workflowBaseUrl += `&recordId=${recordId}`
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
                setWorkflows(results as WorkflowInstance[])
                setPagination({
                    page,
                    maxPageSize,
                    totalResults
                })
            }
        }
    }

    const nameRenderer: TableCellRenderer = ({ rowData }) => {
        return (
            <TableCell isOpen={false}><Link
                component="button"
                variant="body2"
                onClick={() => {
                    router.push('/flow/' + `${rowData.workflow._id}`)
                }}
            >
                {rowData.workflow.name}
            </Link></TableCell>
        )
    }

    const descRenderer: TableCellRenderer = ({ rowData }) => {
        return <TableCell isOpen={false}>{rowData.workflow.description}</TableCell>
    }

    const typeRenderer: TableCellRenderer = ({ rowData }) => {
        return <TableCell isOpen={false}>{rowData.workflow.type}</TableCell>
    }

    const dataRecordRenderer: TableCellRenderer = ({ rowData }) => {
        const objectType = rowData?.workflow?.object.includes('Account') ? 'accounts' : 'applications'
        return (
            <TableCell isOpen={false}>
                <Link
                    href={`/${objectType}/${rowData.recordId}`}
                    // component="button"
                    variant="body2"
                    // onClick={() => {
                    //     router.push(`/${objectType}?recordId=${rowData.recordId}`)
                    // }}
                >
                    {rowData.recordName}
                </Link>
            </TableCell>
        )
    }

    const workflowRunDetailRenderer: TableCellRenderer = ({ rowData }) => {
        return (
            <TableCell isOpen={false}>
                <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                        setShowWorkflow(true);
                        setSelectedData(rowData);
                    }}
                >
                    Show
                </Link>
            </TableCell>
        )
    }

    const dateTimeRenderer: TableCellRenderer = ({ rowData }) => {
        return <TableCell isOpen={false}>{moment.utc(rowData.startedAt).format('DD/MM/YYYY HH:mm')}</TableCell>
    }

    const columns: ColumnData[] = [
        {
            dataKey: 'startedAt',
            label: 'Start Date Time',
            width: 175,
            cellRenderer: dateTimeRenderer
        },
        {
            dataKey: 'recordId',
            label: 'Data Record',
            width: 160,
            cellRenderer: dataRecordRenderer
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
            width: 160,
            cellRenderer: descRenderer
        },
        {
            dataKey: 'type',
            label: 'Type',
            width: 160,
            cellRenderer: typeRenderer
        },
        {
            dataKey: 'status',
            label: 'Status',
            width: 170
        },
        {
            dataKey: 'executionDetail',
            label: 'Execution Detail',
            width: 160,
            cellRenderer: workflowRunDetailRenderer
        },
    ]

    return (
        <>
            {workflows && workflows.length > 0
                ? (
                    <>
                        <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, paddingTop: '10px' }}>
                            Recent Workflows Run
                        </Typography>
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
                                    <MenuItem value={'In Progress'}>In Progress</MenuItem>
                                    <MenuItem value={'Completed'}>Completed</MenuItem>
                                    <MenuItem value={'Paused'}>Paused</MenuItem>
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
                        {showWorkflow && selectedData && <WorkflowRunDetail isOpen={showWorkflow} onClose={setShowWorkflow} objectName={selectedData.workflow.object} workflowInstanceId={selectedData._id} recordId={selectedData.recordId}></WorkflowRunDetail>}
                    </>
                )
                : (
                    <>
                        <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, paddingTop: '10px' }}>
                            Recent Workflows Run
                        </Typography>
                        <Box sx={{ padding: '30px', display: 'flex' }}>
                            No Record Found
                        </Box>
                    </>
                )}
        </>
    )
}
