import * as React from 'react'
import { useEffect } from 'react'
import { useSnackbar } from 'notistack'
import CrudMaterialTable, { ColumnData } from '../common/CrudMaterialTable'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import { type TableCellRenderer } from 'react-virtualized'
import {
  type SelectChangeEvent,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Link,
  TableCell
} from '@mui/material'
import MButton from '../common/Mbutton'
import PageHeading from '../common/PageHeading'
import { Payments } from '@mui/icons-material'
import { type DataModel } from '../../interfaces/IDataModel'
import AddDataModel from './AddDataModel'
import ViewEditDataModel from './ViewEditDataModel'

interface ParentCompProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  createRow: (item: Record<string, any>) => void
}

export interface Pagination {
  page: number
  maxPageSize: number
  totalResults: number
}

interface FilterType {
  type: string
  options: string[]
}

export default function AddEditDataModels () {
  const { auth } = useAuth()
  const [getDataModels, , , deleteDataModel] = useApi<DataModel[]>()
  const [DataModels, setDataModels] = React.useState<DataModel[]>([])
  const [selectedDataModel, setSelectedDataModel] = React.useState<DataModel>()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isViewEditOpen, setIsViewEditOpen] = React.useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const [filterQuery, setFilterQuery] = React.useState({
    createdBy: '',
    isActive: true,
    options: ''
  })

  // Filters
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    maxPageSize: 100,
    totalResults: 0
  })


  useEffect(() => {
    updateData(null, pagination)
  }, [isOpen, isViewEditOpen])

  function handlePageChange (pagination: Pagination) {
    updateData(filterQuery, pagination)
  }

  const updateData = async (query: any, pagination: Pagination) => {
    let DataModelBaseUrl = `api/DataModel/all/${auth?.companyId}`

    const { page, maxPageSize } = pagination
    DataModelBaseUrl += `?pageToken=${page}&maxPageSize=${maxPageSize}`

    if (query) {
      const { type, options, status, startDate, endDate } = query
      let filterQuery = `&status=${status}&options=${options}&type=${type}`

      if (startDate && endDate) { filterQuery += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` }

      DataModelBaseUrl += filterQuery
    }

    const [datmodelRes] = await Promise.allSettled([
      getDataModels(DataModelBaseUrl)
    ])

    if (datmodelRes.status === 'fulfilled') {
      const workflowData = datmodelRes.value.data
      if (workflowData.errors) {
        const [{ message }, ..._] = workflowData.errors
        enqueueSnackbar(message, { variant: 'error' })
      } else {
        const { results, totalResults } = workflowData
        setDataModels(results as DataModel[])
        setPagination({
          page,
          maxPageSize,
          totalResults
        })
      }
    }
  }

  const deleteModel = async (rowData:any)=>{
    let result = await deleteDataModel('api/datamodel', rowData.id)

    if (result && result.data.errors) {
      enqueueSnackbar(result.data.errors[0].message, {
        variant: 'error'
      })
    } else {
      enqueueSnackbar('Data Model deactivated Successfully', {
        variant: 'success'
      })
      updateData(null, pagination)
    }
  }

  const actionRenderer: TableCellRenderer = ({ rowData }) => {
    return (
      <Button onClick={()=>deleteModel(rowData)}>Delete</Button>
    )
  }

  const NameRenderer: TableCellRenderer = ({ rowData }) => {
    return (
      <TableCell ><Link
        component="button"
        variant="body2"
        onClick={() => {
          setIsViewEditOpen(true)
          setSelectedDataModel(rowData);
        }}
      >
        {rowData.name}
      </Link>
      </TableCell>
    )
  }

  const columns: ColumnData[] = [
    {
      dataKey: 'name',
      label: 'Name',
      width: 175,
      cellRenderer:NameRenderer
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
      dataKey: 'prefix',
      label: 'Prefix',
      width: 160
    },
    {
      dataKey: 'label',
      label: 'Parent Model',
      width: 160
    },
    {
      dataKey: 'action',
      label: 'Action',
      width: 80,
      cellRenderer: actionRenderer
    },
  ]

  return (
    <>
      {DataModels && DataModels.length > 0
        ? (
        <>
          <AppBar
            position="static"
            color="inherit"
            sx={{ boxShadow: 'none', mb: 3 }}
          >
            <Toolbar sx={{ paddingLeft: '4px !important' }}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Data Models
              </Typography>

              <MButton
                size="small"
                variant="outlined"
                onClick={() => { setIsOpen(true) }}
              >
                Add Data model
              </MButton>
            </Toolbar>
          </AppBar>
          <Box sx={{ flexGrow: 'auto' }}>
            <CrudMaterialTable
              key={DataModels.length}
              tableRows={DataModels}
              setTableRows={setDataModels}
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
          <PageHeading heading="Data Models" startIcon={<Payments />}>
            <Box component="div" sx={{ justifyContent: 'left' }}>
              <MButton
                size="small"
                variant="outlined"
                onClick={() => { setIsOpen(true) }}
              >
                Add Data model
              </MButton>
            </Box>
          </PageHeading>
          <Box sx={{ padding: '30px', justifyContent: 'center', display: 'flex' }}>
            No Record Found
          </Box>
        </>
          )}
      <AddDataModel open={isOpen} setOpen={setIsOpen}></AddDataModel>
      {selectedDataModel&&<ViewEditDataModel open={isViewEditOpen} setOpen={setIsViewEditOpen} dataModel={selectedDataModel}></ViewEditDataModel>}
    </>
  )
}
