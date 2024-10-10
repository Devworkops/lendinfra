
import React, { useEffect } from "react";
import moment from 'moment'
import { Box, Button, Grid, TableCell } from '@mui/material'
import { FormContainer, TextFieldElement, useForm } from 'react-hook-form-mui'
import { DataRecord } from "../../interfaces/IDataRecord";
import useFormHelper from '../../hooks/useFormHelper'
import useApi from '../../hooks/useApi'
import { useSnackbar } from 'notistack'
import { useAuth } from '../../hooks/useAuth'
import { DataModel } from "../../interfaces/IDataModel";
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { Note } from "../../interfaces/INote";
import CrudMaterialTable, { ColumnData } from "../common/CrudMaterialTable";
import { TableCellRenderer } from "react-virtualized";

export interface Pagination {
    page: number
    maxPageSize: number
    totalResults: number
}

export interface NotesProps {
    data: DataRecord | undefined
    open: string | undefined
    setNotesCount: any
}

interface NoteObject { note: Note }

export default function Notes(props: NotesProps) {
    const { open, data, setNotesCount } = props
    const [getDataModels] = useApi<DataModel[]>()
    const [dataModels, setDataModels] = React.useState<DataModel[]>([])
    const [notes, setNotes] = React.useState<Note[]>([])
    const [comment, setComment] = React.useState('')
    const [add, setAdd] = React.useState(false)
    const [getNote, addNote, ,] = useApi<Note>()
    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar()
    const { auth } = useAuth()

    const [filterQuery, setFilterQuery] = React.useState({
        reference: 'datarecord',
        referenceId: '',
        recordId: '',
        startDate: '',
        endDate: ''
    })

    const [pagination, setPagination] = React.useState<Pagination>({
        page: 1,
        maxPageSize: 100,
        totalResults: 0
    })

    const noteFormContext = useForm<NoteObject>({
        defaultValues: {
            note: {
                id: '',
                comment: '',
                reference: '',
                referenceId: '',
                recordId: '',
                company: auth?.companyId,
                createdBy: '',
                isActive: true
            }
        }
    })

    const getDataModelsFunction = async () => {
        let DataModelBaseUrl = `api/DataModel/all/${auth?.companyId}`
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
            }
        }
    }
    const fieldsRenderer: TableCellRenderer = ({ rowData, dataKey }) => {
        switch (dataKey) {
            case 'comment':
                return (
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rowData.comment}</TableCell>
                )
            case 'createdby':
                return (
                    <TableCell>{auth?.email}</TableCell>)
            case 'createdat':
                return (
                    <TableCell>{moment.utc(rowData.createdAt).format('DD/MM/YYYY HH:mm')}</TableCell>)
        }
    }

    const columns: ColumnData[] = [
        {
            dataKey: 'comment',
            label: 'Comment',
            width: 500,
            cellRenderer: fieldsRenderer
        },
        {
            dataKey: 'createdby',
            label: 'Created By',
            width: 175,
            cellRenderer: fieldsRenderer
        },
        {
            dataKey: 'createdat',
            label: 'Created At',
            width: 175,
            cellRenderer: fieldsRenderer
        }
    ]


    function handlePageChange(pagination: Pagination) {
        updateNotes(filterQuery, pagination)
    }

    useEffect(() => {
        getDataModelsFunction();
    }, [])


    useEffect(() => {
        if (open == 'View') {
            updateNotes(filterQuery, pagination)
        }
    }, [add])

    const updateNotes = async (query: any, pagination: Pagination) => {
        let noteUrl = `api/note/all/${auth?.companyId}`

        const { page, maxPageSize } = pagination
        noteUrl += `?pageToken=${page}&maxPageSize=${maxPageSize}`

        if (query) {
            const { reference, referenceId, recordId, startDate, endDate } = query
            let filterQuery = `&reference=${reference}&referenceId=${data?.dataModel}&recordId=${data?.id}`

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
                setNotes(results as Note[])
                setNotesCount(totalResults)
                setPagination({
                    page,
                    maxPageSize,
                    totalResults
                })
            }
        }
    }

    const handleAddNote = () => {
        setAdd(true)
    }
    const saveNote = async () => {
        if (data && comment) {
            const noteToSave: Note = {
                "comment": comment,
                "reference": "datarecord",
                "referenceId": data?.dataModel,
                "recordId": data?.id,
                "company": data?.company,
                "createdBy": data?.createdBy
            }

            let result = await addNote('api/note/new', noteToSave)

            if (result && result.data.errors) {
                enqueueSnackbar(result.data.errors[0].message, {
                    variant: 'error'
                })
            } else {
                enqueueSnackbar(`Comment addedd Successfully`, {
                    variant: 'success'
                })
                setComment('')
                setAdd(false)
            }
        }
    }

    const updateComment = (event: { target: { value: React.SetStateAction<string> } }) => {
        setComment(event?.target.value)
    }

    return (
        <FormContainer formContext={noteFormContext}>
            {(open == 'View' && !add) &&
                <Box sx={{ flexGrow: 'auto' }}>
                    <Button
                        sx={{ left: '94%' }}
                        size="small"
                        variant="outlined"
                        onClick={handleAddNote}
                        startIcon={<AddIcon />}
                    >
                        Add Note
                    </Button>
                    <CrudMaterialTable
                        key={notes.length}
                        tableRows={notes}
                        columns={columns}
                        isReadOnly={false}
                        pagination={{
                            ...pagination,
                            onPageChange: handlePageChange
                        }}
                        tableHeight="calc(80vh - 140px)"
                    ></CrudMaterialTable>
                </Box>}
            {add &&
                <>
                    <Button
                        sx={{ left: '95%', mb: '20px' }}
                        size="small"
                        variant="outlined"
                        onClick={saveNote}
                        startIcon={<SaveIcon />}
                    >
                        Save
                    </Button>

                    <Grid item xs={3} sm={3} md={3}>
                        <TextFieldElement multiline={true} type={'string'} fullWidth label={'Comment'} name={`comment`}
                            parseError={parseError} size="small" onChange={updateComment} />
                    </Grid>
                </>
            }
        </FormContainer>
    )
}