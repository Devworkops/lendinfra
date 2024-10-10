import { useEffect } from "react";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Box, Link, TableCell } from "@mui/material";
import CrudMaterialTable, { ColumnData } from "../common/CrudMaterialTable";
import { TableCellRenderer } from "react-virtualized";
import React from "react";
import { DataRecord } from "../../interfaces/IDataRecord";
import { useSnackbar } from 'notistack'
import Details from "./Details";
import { useRouter } from "next/router";

export interface ApplicationProps {
  data: DataRecord | undefined;
}

export default function Applications({ data }: ApplicationProps) {
  const { auth } = useAuth()
  const [selectedData, setSelectedData] = React.useState<DataRecord>()
  const [getData] = useApi<DataRecord[]>()
  const [dataRecords, setDataRecords] = React.useState<DataRecord[]>([])
  const [selectedObject, setSelectedObject] = React.useState('')
  const { enqueueSnackbar } = useSnackbar()
  const [open, setOpen] = React.useState<string | undefined>('List')
  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    updateData();
  }, [open]);

  const updateData = async () => {
    let workflowBaseUrl = `api/applications/${id}`

    const [ response ] = await Promise.allSettled([
      getData(workflowBaseUrl)
    ])

    if (response.status === 'fulfilled') {
      const applications = response.value.data
      if (applications.errors) {
        const [{ message }, ..._] = applications.errors
        enqueueSnackbar(message, { variant: 'error' })
      } else {
        setDataRecords(applications as DataRecord[])
      }
    }
  }

  const IdRenderer: TableCellRenderer = ({ rowData }) => {
    return (
      <TableCell><Link
        variant="body2"
        onClick={() => {
          setSelectedData(rowData);
          setSelectedObject(rowData.objectName)
        }}
        href={`/applications/${rowData.id}`}
      >
        {rowData.recordId}
      </Link>
      </TableCell>
    )
  }

  const createdFieldsRenderer: TableCellRenderer = ({ rowData, dataKey }) => {
    switch (dataKey) {
      case 'createdby':
        return (
          <TableCell>{auth?.email}</TableCell>)
      case 'createdat':
        return (
          <TableCell>{rowData.createdAt}</TableCell>)
    }
  }

  const columns: ColumnData[] = [
    {
      dataKey: 'recordId',
      label: 'Id',
      width: 175,
      cellRenderer: IdRenderer
    },
    {
      dataKey: 'createdby',
      label: 'Created By',
      width: 200,
      cellRenderer: createdFieldsRenderer
    },
    {
      dataKey: 'createdat',
      label: 'Created At',
      width: 200,
      cellRenderer: createdFieldsRenderer
    }
  ]

  return <>
    { open === 'List' ?
      <>
      { dataRecords != null && dataRecords.length > 0 ?
      <Box sx={{ flexGrow: 'auto' }}>
        <CrudMaterialTable
          key={dataRecords.length}
          tableRows={dataRecords}
          setTableRows={setDataRecords}
          columns={columns}
          isReadOnly={true}
          tableHeight="calc(80vh - 140px)"
        ></CrudMaterialTable>
      </Box>
      : <>
        <br/>
        <>No record found</>
        </> }
    </> 
    : <Details data={selectedData} open={open} setOpen={setOpen} objectName={selectedObject}/>}
  </>
}