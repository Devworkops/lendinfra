import React, { useRef } from 'react'
import MuiTableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  AutoSizer,
  Column,
  defaultTableRowRenderer,
  type Index,
  Table,
  type TableCellRenderer,
  type TableHeaderProps,
  type TableRowRenderer
} from 'react-virtualized'
import { Box, IconButton, TablePagination, TextField } from '@mui/material'
import {
  DeleteOutlined,
  SaveOutlined,
  CancelOutlined,
  EditOutlined
} from '@mui/icons-material'
import { type Props } from 'react-modal'
// import { Pagination } from '../transactions/ShowTransaction';

export interface Pagination {
  page: number
  maxPageSize: number
  totalResults: number
}

export interface ColumnData {
  dataKey: string
  label: string
  width: number
  cellRenderer?: TableCellRenderer
}

export interface ShowDetailProps {
  detail: Record<string, any>
  setTableData?: React.Dispatch<React.SetStateAction<any>>
  tableData?: any[]
  collapsibleHeight?: number
  setCollapsibleHeight?: React.Dispatch<React.SetStateAction<any>>
  closeModal: any
}

export type ShowDetailComponent = (props: ShowDetailProps) => React.ReactNode

interface CrudTablePaginationProps extends Pagination {
  onPageChange: (pagination: Pagination) => void
}

interface CrudTableProps {
  createButtonComp?: React.ReactNode
  showDetailComp?: ShowDetailComponent
  actionComp?: TableCellRenderer
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  columns: ColumnData[]
  [key: string]: any // rows
  setTableData?: React.Dispatch<React.SetStateAction<any>>
  editRow?: (item: Record<string, any>) => void
  deleteRow?: (item: Record<string, any>) => void
  isReadOnly?: boolean
  disableHeader?: boolean
  expandedRows?: number[]
  tableHeight?: string
  pagination?: CrudTablePaginationProps
}

const rowHeight = 48

export const TableCell: React.FC<Props> = ({ children }) => {
  return (
        <MuiTableCell
            component="div"
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
              cursor: 'initial',
              height: rowHeight,
              width: '100%'
            }}
            variant="body"
        >
            {children}
        </MuiTableCell>
  )
}

const CrudMaterialTable: React.FC<CrudTableProps> = (props) => {
  const { actionComp, columns, createButtonComp, showDetailComp, isReadOnly, editRow, deleteRow, expandedRows, pagination, tableRows, setTableRows, showDetailHeight, disableHeader, tableHeight } = props
  const [enableShowDetail, setEnableShowDetail] = React.useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0)
  const [collapsibleHeight, setCollapsibleHeight] = React.useState(showDetailHeight || 100)
  const tableRef = useRef<Table | null>(null)

  const discardChanges = (rowId: string) => {
    const orginalRow = tableRows.find((i: { id: string }) => i.id === rowId)
    orginalRow.isEdit = false
    const newRows = tableRows.map((row: { id: any }) => (row.id === orginalRow.id ? { ...orginalRow } : { ...row }))
    setTableRows(newRows)
  }

  const saveChanges = (rowData: any) => {
    if (editRow != undefined) { editRow(rowData) }
    const newRows = tableRows.map((row: { id: any }) => (row.id === rowData.id ? { ...row, isEdit: false } : { ...row }))
    setTableRows(newRows)
  }

  const deleteTableRow = (rowData: any) => {
    if (deleteRow != undefined) { deleteRow(rowData) }
  }
  const disableUser = (rowData: any) => {
    const newStatus = !rowData.isActive
    const newRowData = { ...rowData, isActive: newStatus }
    if (editRow != undefined) { editRow(newRowData) }
    const newRows = tableRows.map((row: { id: any }) => (row.id === rowData.id ? { ...row, isActive: newStatus } : { ...row }))
    setTableRows(newRows)
  }

  const startEdit = (rowId: string) => {
    const newRows = tableRows.map((row: { id: string }) => (row.id === rowId ? { ...row, isEdit: true } : { ...row }))
    setTableRows(newRows)
  }

  const handleEditCell = (e: any, rowId: string, dataKey: string) => {
    const newRows = tableRows.map((row: { id: string }) =>
      row.id === rowId
        ? { ...row, [dataKey]: e.target.value }
        : { ...row }
    )
    setTableRows(newRows)
  }

  const handleShowDetail = (index: number) => {
    setSelectedIndex(index)
    setEnableShowDetail(true)
  }

  const handleShowDetailRemove = () => {
    setSelectedIndex(0)
    setEnableShowDetail(false)
  }

  const crudActionCellRenderer: TableCellRenderer = ({ rowIndex, rowData, cellData, columnIndex, dataKey, isScrolling }) => {
    if (isReadOnly) {
      return (<TableCell isOpen={false}>
                <Box component="div" sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: theme => theme.spacing(1),
                  color: theme => theme.palette.text.secondary
                }}>
                    {showDetailComp != undefined &&
                        (!enableShowDetail && <IconButton
                            color="primary"
                            size="small"
                            aria-label="detail"
                            onClick={() => { handleShowDetail(rowIndex) }}
                        >
                            <OpenInNewRoundedIcon fontSize="small" />
                        </IconButton>)
                    }
                    {actionComp != undefined && actionComp({ rowIndex, rowData, cellData, columnIndex, dataKey, isScrolling })}
                </Box>
            </TableCell>)
    }
    if (rowData.isEdit) {
      return (<TableCell isOpen={false}>
                <Box component="div" sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: theme => theme.spacing(1),
                  color: theme => theme.palette.text.secondary
                }}>
                    {showDetailComp != undefined &&
                        (enableShowDetail
                          ? <IconButton
                            color="primary"
                            size="small"
                            aria-label="detail"
                            onClick={() => { handleShowDetail(rowIndex) }}
                        >
                            <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                          : <IconButton
                                color="primary"
                                size="small"
                                aria-label="detail"
                                onClick={() => { handleShowDetailRemove() }}
                            >
                                <KeyboardArrowUpIcon fontSize="small" />
                            </IconButton>)
                    }
                    <IconButton
                        color="primary"
                        size="small"
                        aria-label="save"
                        onClick={() => { saveChanges(rowData) }}
                    >
                        <SaveOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        size="small"
                        aria-label="cancel"
                        sx={{
                          color: theme => theme.palette.text.primary
                        }}
                        onClick={() => { discardChanges(rowData.id) }}
                    >
                        <CancelOutlined fontSize="small" />
                    </IconButton>
                </Box>
            </TableCell>)
    } else {
      return (<TableCell isOpen={false}><Box component="div" sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme => theme.spacing(1),
        color: theme => theme.palette.text.secondary
      }}>
                {showDetailComp != undefined && (enableShowDetail
                  ? <IconButton
                    color="primary"
                    size="small"
                    aria-label="detail"
                    onClick={() => { handleShowDetail(rowIndex) }}
                >
                    <KeyboardArrowDownIcon fontSize="small" />
                </IconButton>
                  : <IconButton
                        color="primary"
                        size="small"
                        aria-label="detail"
                        onClick={() => { handleShowDetail(-1) }}
                    >
                        <KeyboardArrowUpIcon fontSize="small" />
                    </IconButton>)}
                <IconButton
                    color="inherit"
                    sx={{
                      color: theme => theme.palette.text.primary
                    }}
                    size="small"
                    aria-label="edit"
                    onClick={() => { startEdit(rowData.id) }}
                >
                    <EditOutlined fontSize="small" />
                </IconButton>
                {dataKey === 'actions'
                  ? (
                    <IconButton
                        color="inherit"
                        size="small"
                        aria-label="delete"
                        onClick={() => { deleteTableRow(rowData) }}
                    >
                        <DeleteOutlined fontSize="small" />
                    </IconButton>
                    )
                  : (
                    <IconButton
                            color="inherit"
                            size="small"
                            aria-label="delete"
                            onClick={() => { disableUser(rowData) }}
                        >
                        {(rowData.isActive) ? (<DisableAction />) : (<ActivateAction />)}
                    </IconButton>
                    )
                    }
                {actionComp != undefined && actionComp({ rowIndex, rowData, cellData, columnIndex, dataKey, isScrolling })}
            </Box></TableCell>)
    }
  }
  const simpleCellRenderer: TableCellRenderer = ({ cellData }) => {
    return (
            <TableCell isOpen={false}>
                {cellData}
            </TableCell>
    )
  }

  const editableCellRenderer: TableCellRenderer = ({ dataKey, cellData, rowData }) => {
    return (
          <TableCell isOpen={false}>
            {rowData.isEdit
              ? (
                <TextField
                  size="small"
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: 'inherit' }
                  }}
                  value={cellData}
                  onChange={(e) => { handleEditCell(e, rowData.id, dataKey) }}
                />
                )
              : cellData
            }
          </TableCell>
    )
  }

  const headerRenderer = ({ label }: TableHeaderProps) => (
        <TableCell isOpen={false}>
            <span style={{ fontWeight: 'bold' }}>{label}</span>
        </TableCell>
  )

  const rowRenderer: TableRowRenderer = props => {
    return defaultTableRowRenderer(props)
  }

  const noRowsRenderer = () => {
    return <div className ='row'>No Data</div>
  }

  const getRowStyles = ({ index }: Index): React.CSSProperties => {
    const isEdit = Boolean(tableRows[index]?.isEdit)

    return {
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      boxShadow: isEdit
        ? '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)'
        : 'none'
    }
  }

  const _getRowHeight = ({ index }: Index): number => {
    const classificationsLen = tableRows[index]?.classifications?.length
    return classificationsLen && classificationsLen > 3 ? (classificationsLen * 25 + 40) : 65
  }
  const _getDatum = (index: number) => { return tableRows[index] }
  const rowGetter = ({ index }: Index) => _getDatum(index)

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (pagination != null) {
      const { onPageChange, totalResults } = pagination
      onPageChange({
        page: 1,
        maxPageSize: parseInt(event.target.value),
        totalResults
      })
    }
  }

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    if (pagination != null) {
      const { maxPageSize, onPageChange, totalResults } = pagination
      onPageChange({
        maxPageSize,
        totalResults,
        page: newPage + 1
      })
    }
  }

  return (
        <>  {(showDetailComp != undefined && enableShowDetail) &&
                <Box sx={{ paddingLeft: '50px', width: '100%' }}>
                    {(showDetailComp({ detail: tableRows[selectedIndex], tableData: tableRows, setTableData: setTableRows, closeModal: handleShowDetailRemove }))}
                </Box>
            }
            {createButtonComp != undefined && <Box sx={{ padding: '10px' }}>{createButtonComp}</Box>}
            {tableRows && tableRows.length > 0 && <TableContainer sx={{ height: tableHeight || 'calc(100vh - 150px)', overflow: 'hidden' }} key={collapsibleHeight}>
                <AutoSizer>
                    {({ height, width }) => (
                        <Table
                            ref={tableRef}
                            height={height}
                            width={width}
                            headerHeight={rowHeight}
                            noRowsRenderer={noRowsRenderer}
                            rowClassName="row"
                            rowStyle={getRowStyles}
                            rowCount={tableRows ? tableRows.length : 0}
                            rowGetter={rowGetter}
                            rowRenderer={rowRenderer}
                            rowHeight={_getRowHeight}
                            disableHeader={disableHeader || false}
                        >
                            {columns.map(({ dataKey, cellRenderer, ...other }) => {
                              return (
                                    <Column
                                        style={{ alignItems: 'center', boxSizing: 'border-box' }}
                                        key={dataKey}
                                        headerRenderer={headerRenderer}
                                        cellRenderer={(dataKey === 'actions' || dataKey === 'disableAndEditAction') ? (crudActionCellRenderer) : (cellRenderer != null ? cellRenderer : (dataKey === 'id' ? simpleCellRenderer : editableCellRenderer))}
                                        dataKey={dataKey}
                                        {...other}
                                    />
                              )
                            })}
                        </Table>
                    )}
                </AutoSizer>

            </TableContainer>
            }
            {tableRows && tableRows.length > 0 && (pagination != null) && <TablePagination
                component="div"
                count={pagination.totalResults}
                page={pagination.page - 1}
                onPageChange={handleChangePage}
                rowsPerPage={pagination.maxPageSize}
                rowsPerPageOptions={[5, 8, 10, 12, 15, 18, 20, 25, 100]}
                onRowsPerPageChange={handleChangeRowsPerPage}
                showFirstButton={true}
                showLastButton={true}
            />}
        </>
  )
}

export default CrudMaterialTable

const DisableAction = () => {
  return (
      <>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18.4098 18.0903L15.5898 20.9103" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M18.4098 20.9103L15.5898 18.0903" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M12.1605 10.8702C12.0605 10.8602 11.9405 10.8602 11.8305 10.8702C9.45055 10.7902 7.56055 8.84024 7.56055 6.44024C7.56055 3.99024 9.54055 2.00024 12.0005 2.00024C14.4505 2.00024 16.4405 3.99024 16.4405 6.44024C16.4305 8.84024 14.5405 10.7902 12.1605 10.8702Z" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M12.0008 21.8102C10.1808 21.8102 8.37078 21.3502 6.99078 20.4302C4.57078 18.8102 4.57078 16.1702 6.99078 14.5602C9.74078 12.7202 14.2508 12.7202 17.0008 14.5602" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
      </>
  )
}
const ActivateAction = () => {
  return (
      <>
     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.9601 21.32C15.7701 21.32 15.5801 21.25 15.4301 21.1L13.9101 19.58C13.6201 19.29 13.6201 18.81 13.9101 18.52C14.2001 18.23 14.6801 18.23 14.9701 18.52L15.9601 19.51L18.4701 17C18.7601 16.71 19.2401 16.71 19.5301 17C19.8201 17.29 19.8201 17.77 19.5301 18.06L16.4901 21.1C16.3401 21.25 16.1501 21.32 15.9601 21.32Z" fill="#040815"/>
<path d="M12.1601 11.62C12.1301 11.62 12.1101 11.62 12.0801 11.62C12.0301 11.61 11.9601 11.61 11.9001 11.62C9.00013 11.53 6.81013 9.25 6.81013 6.44C6.80013 5.06 7.34013 3.76 8.32013 2.78C9.30013 1.8 10.6001 1.25 11.9901 1.25C14.8501 1.25 17.1801 3.58 17.1801 6.44C17.1801 9.25 14.9901 11.52 12.1901 11.62C12.1801 11.62 12.1701 11.62 12.1601 11.62ZM11.9901 2.75C11.0001 2.75 10.0801 3.14 9.38013 3.83C8.69013 4.53 8.31013 5.45 8.31013 6.43C8.31013 8.43 9.87013 10.05 11.8601 10.11C11.9201 10.1 12.0501 10.1 12.1801 10.11C14.1501 10.02 15.6801 8.41 15.6801 6.43C15.6801 4.41 14.0201 2.75 11.9901 2.75Z" fill="#040815"/>
<path d="M11.9902 22.5599C9.95016 22.5599 8.02016 22.0299 6.56016 21.0499C5.17016 20.1199 4.41016 18.8499 4.41016 17.4799C4.41016 16.1099 5.18016 14.8499 6.56016 13.9299C9.55016 11.9299 14.4102 11.9299 17.4002 13.9299C17.7402 14.1599 17.8402 14.6299 17.6102 14.9699C17.3802 15.3199 16.9102 15.4099 16.5702 15.1799C14.0802 13.5199 9.88016 13.5199 7.39016 15.1799C6.43016 15.8199 5.91016 16.6299 5.91016 17.4799C5.91016 18.3299 6.43016 19.1599 7.39016 19.7999C8.60016 20.6099 10.2302 21.0499 11.9802 21.0499C12.3902 21.0499 12.7302 21.3899 12.7302 21.7999C12.7302 22.2099 12.4002 22.5599 11.9902 22.5599Z" fill="#040815"/>
</svg>

      </>
  )
}
