
import React, { useEffect } from "react";
import moment from 'moment'
import { Accordion, AccordionDetails, AccordionSummary, Box, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from '@mui/material'
import { FormContainer, SelectElement, TextFieldElement, useForm } from 'react-hook-form-mui'
import { DataRecord } from "../../interfaces/IDataRecord";
import useFormHelper from '../../hooks/useFormHelper'
import useApi from '../../hooks/useApi'
import { useSnackbar } from 'notistack'
import { useAuth } from '../../hooks/useAuth'
import { DataModel } from "../../interfaces/IDataModel";
import CloseIcon from '@mui/icons-material/Close';
import { camelCaseToTitleCase } from '../../utils/textFromatter'
import CrudMaterialTable, { ColumnData } from "../common/CrudMaterialTable";
import { TableCellRenderer } from "react-virtualized";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DialogScreen from "../common/DialogScreen";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CreditReport from "./CreditReport";

export interface Pagination {
    page: number
    maxPageSize: number
    totalResults: number
}

export interface ReportsProps {
    open: string | undefined
    report: string
    data: DataRecord | undefined
}

export default function Reports(props: ReportsProps) {
    const { data, open, report } = props
    const [getDataModels] = useApi<DataModel[]>()
    const [getDataRecords, , ,] = useApi<DataRecord>()
    const [dataModels, setDataModels] = React.useState<DataModel[]>([])
    const [dataRecords, setDataRecords] = React.useState<DataRecord[]>([])
    const [selectedDataModel, setSelectedDataModel] = React.useState<DataModel | null>(null)
    const [selectedDataRecord, setSelectedDataRecord] = React.useState<DataRecord | undefined>(undefined)
    const [booleanValue, setBooleanValue] = React.useState('');
    const [creditRecords, setCreditRecords] = React.useState<DataRecord[]>([])
    const [analyticsRecords, setAnalyticsRecords] = React.useState<DataRecord[]>([])
    const [viewReport, setViewReport] = React.useState(false);
    const [ isEditingField, setIsEditingField ] = React.useState('');
    const [, ,updateData, ] = useApi<DataRecord>()
    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar()
    const { auth } = useAuth()
    const originalFieldValuesRef = React.useRef<{ [key: string]: any }>({});
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

    const getDataRecordsFunction = async (pagination: Pagination) => {
        let DataRecordBaseUrl = `api/datarecord/all/${auth?.companyId}`

        const { page, maxPageSize } = pagination
        DataRecordBaseUrl += `?pageToken=${page}&maxPageSize=${maxPageSize}`

        const [datarecordRes] = await Promise.allSettled([
            getDataRecords(DataRecordBaseUrl)
        ])

        if (datarecordRes.status === 'fulfilled') {
            const workflowData = datarecordRes.value.data
            if (workflowData.errors) {
                const [{ message }, ..._] = workflowData.errors
                enqueueSnackbar(message, { variant: 'error' })
            } else {
                const { results, totalResults } = workflowData
                setDataRecords(results as DataRecord[])
                setCreditRecords(results.filter((record: { objectName: string, fields: any }) => { return (record.objectName === 'TransUnion' && record.fields?.creditReport?.account === data?.id) }) as DataRecord[])
                setAnalyticsRecords(results.filter((record: { objectName: string, fields: any }) => { return (record.objectName === 'TrustLoop' && record.fields?.account === data?.id) }) as DataRecord[])
                setPagination({
                    page,
                    maxPageSize,
                    totalResults
                })
            }
        }
    }

    useEffect(() => {
        getDataModelsFunction();
        getDataRecordsFunction(pagination);
    }, [])

    const [pagination, setPagination] = React.useState<Pagination>({
        page: 1,
        maxPageSize: 100,
        totalResults: 0
    })

    function handlePageChange(pagination: Pagination) {
        getDataRecordsFunction(pagination)
    }

    const tuContext = useForm({
        defaultValues: {
            TransUnion: data?.fields['TransUnion']
        }
    })

    const formContext = useForm<DataRecord>({
        defaultValues: {
            id: '',
            objectName: report === 'credit' ? 'TransUnion' : 'TrustLoop',
            uniqueId: '',
            dataModel: '',
            company: auth?.companyId,
            createdBy: '',
            fields: { key: '', type: '' }
        }
    })

    const fieldsRenderer: TableCellRenderer = ({ rowData, dataKey }) => {
        switch (dataKey) {
            case 'createdat':
                return (
                    <TableCell>{moment.utc(rowData.createdAt).format('DD/MM/YYYY HH:mm')}</TableCell>)
            case 'creditscore':
                return (
                    <TableCell>{rowData.fields.creditReport.creditScore}</TableCell>)
            case 'lastsyncedat':
                return (
                    <TableCell>{rowData.fields.creditReport.lastSyncedDate}</TableCell>)
            case 'viewreport':
                return (
                    <TableCell><a href="#" onClick={() => { onOpenReport(rowData.objectName, rowData.id) }}>View Report</a></TableCell>)
        }
    }

    const creditReportColumns: ColumnData[] = [
        {
            dataKey: 'creditscore',
            label: 'Credit Score',
            width: 175,
            cellRenderer: fieldsRenderer
        },
        {
            dataKey: 'lastsyncedat',
            label: 'Last Synced',
            width: 175,
            cellRenderer: fieldsRenderer
        },
        {
            dataKey: 'createdat',
            label: 'Created At',
            width: 175,
            cellRenderer: fieldsRenderer
        },
        {
            dataKey: 'viewreport',
            label: '',
            width: 175,
            cellRenderer: fieldsRenderer
        }
    ]

    const analyticsReportColumns: ColumnData[] = [
        {
            dataKey: 'createdat',
            label: 'Created At',
            width: 175,
            cellRenderer: fieldsRenderer
        },
        {
            dataKey: 'viewreport',
            label: '',
            width: 175,
            cellRenderer: fieldsRenderer
        }
    ]

    const getRecordsName = (objectName: undefined) => {
        const records: Array<{
            label: string
            id: string
        }> = []
        const selectedDataRecords = dataRecords.filter(function (item) {
            return item.objectName === objectName;
        });

        selectedDataRecords.forEach(element => {
            records.push({ label: element.recordId, id: element.id })
        })
        return records
    }
    const onOpenReport = (objectName: string, recordId: any) => {
        if (objectName === 'TransUnion') {
            const record = creditRecords.find(obj => obj.id === recordId)
            if (record != null) {
                record.fields.creditReport.lastSyncedDate = formatDate(record.fields.creditReport.lastSyncedDate)
                formContext.reset(record)
                setSelectedDataRecord(record)
            }
            const datamodel = dataModels.find((obj) => {
                return obj.name === 'TransUnion'
            })
            if (datamodel != null) { setSelectedDataModel(datamodel) }
        }
        if (objectName === 'TrustLoop') {
            const record = analyticsRecords.find(obj => obj.id === recordId)
            if (record != null) {
                formContext.reset(record)
                setSelectedDataRecord(record)
            }
            const datamodel = dataModels.find((obj) => {
                return obj.name === 'TrustLoop'
            })
            if (datamodel != null) { setSelectedDataModel(datamodel) }
        }

        setViewReport(true)
    }

    const onCloseReport = () => {
        const datamodel = dataModels.find((obj) => {
            return obj.name === data?.objectName
        })
        if (datamodel != null) { setSelectedDataModel(datamodel) }
        setViewReport(false)
    }

    const setBooleanDropdownValue = (event: any) => {
        setBooleanValue(event)
    }

    const formatDate = (dateTimeString: string | number | Date) => {
        const date = new Date(dateTimeString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function RecursiveArrayRendering(props: { model: any, base: any, isDisabled: string }) {
        const { model, base } = props;
        const [_, basekey, secondkey, thirdkey] = `${base}`.split(".");
        return <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                    <TableBody>
                        {Object.keys(model.properties).map((header: any, index: number) => (
                            <TableRow key={`${base}.[${index}].${header}`}>
                                <TableCell key={index + "header"} sx={{ fontWeight: 'bold' }}>{header}</TableCell>
                                {thirdkey === undefined ?
                                    selectedDataRecord?.fields[basekey][secondkey]?.map((item: any, keyindex: number) => (
                                        model.properties[header].type != 'array' ?
                                            <TableCell key={basekey + secondkey + keyindex + "cell"}>
                                                {`${item[header]}`}
                                            </TableCell>
                                            : <></>
                                        // <RecursiveArrayRendering model={model.properties[header]} base={base + '.' + header} isDisabled={isDisabled}></RecursiveArrayRendering>
                                    ))
                                    : selectedDataRecord?.fields[basekey][secondkey][thirdkey]?.map((item: any, keyindex: number) => (
                                        model.properties[header].type != 'array' ?
                                            <TableCell key={basekey + secondkey + thirdkey + keyindex + "cell"}>
                                                {`${item[header]}`}
                                            </TableCell>
                                            : <></>
                                        // <RecursiveArrayRendering model={model.properties[header]} base={base + '.' + header} isDisabled={isDisabled}></RecursiveArrayRendering>
                                    ))
                                }
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    }

    function RecursiveFieldRendering(props: { model: any, base: any, isDisabled: string }) {
        const [parseError] = useFormHelper()
        const { model, base, isDisabled } = props;
        return <Grid container rowSpacing={2} columnSpacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }} columns={12}>
            {(model != null) && (model.properties != null) && Object.keys(model.properties).map((key: any) => (
                <Grid item xs={12} sm={12} md={12}>
                    {(model.properties[key].type !== 'object')
                        ?
                        <>
                            {model.properties[key].type == 'reference' &&
                                <>{model.properties[key].type.length == 1 ?
                                    <SelectElement fullWidth label={camelCaseToTitleCase(key)} name={`${base}.${key}`} parseError={parseError} size="small" options={getRecordsName(model.properties[key].ref)} disabled={isDisabled == 'View'} /> :
                                    <SelectElement fullWidth label={camelCaseToTitleCase(key)} name={`${base}.${key}`} parseError={parseError} size="small" options={getRecordsName(model.properties[key].ref)} disabled={isDisabled == 'View'} />
                                }</>}
                            {(model.properties[key].type == 'string' || model.properties[key].type == 'number' || model.properties[key].type == 'date') &&
                                <TextFieldElement type={model.properties[key].type} disabled={isDisabled == 'View'} fullWidth label={camelCaseToTitleCase(key)} name={`${base}.${key}`} parseError={parseError} size="small" />
                            }
                            {model.properties[key].type == 'boolean' &&
                                <SelectElement fullWidth label={camelCaseToTitleCase(key)} name={`fields.${key}`} parseError={parseError} size="small" options={[{ "id": "true", "label": "Yes" }, { "id": "false", "label": "No" }]} />
                            }
                            {model.properties[key].type == 'array' &&
                                <><Typography variant="h6" gutterBottom>{key}</Typography>
                                    <RecursiveArrayRendering model={model.properties[key]} base={base + '.' + key} isDisabled={isDisabled}></RecursiveArrayRendering>
                                </>
                            }
                        </>
                        : <Grid item xs={12} sm={12} md={12}>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="report-object"
                                    id="report-object-header"
                                >
                                    <Typography variant='h6' color="#039485">{camelCaseToTitleCase(key)}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <RecursiveFieldRendering model={model.properties[key]} base={base + '.' + key} isDisabled={isDisabled}></RecursiveFieldRendering>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    }
                </Grid>
            ))} </Grid>
    }
    
    const handleSubmit = async (formData: { TransUnion: any; }) => {
        if (data) {
			const updatedData: DataRecord = {
				...data,
				fields: {
					...data.fields,
					TransUnion: formData.TransUnion
				}
			};
			const result = await updateData(`api/dataRecord/${updatedData.id}`, updatedData);
			if (result && result.data.errors) {
				enqueueSnackbar(result.data.errors[0].message, {
					variant: 'error'
				})
			} else {
				enqueueSnackbar(`${isEditingField} id updated Successfully`, {
					variant: 'success'
				})
			}
		}
    }

    const commonInputProps = (key: string) => ({
        endAdornment: (
            <InputAdornment position="end">
                <>
                    {isEditingField === key ? (
                        <>
                            <SaveIcon
                                onClick={async () => {
                                    handleSubmit(tuContext.getValues());
                                    setIsEditingField('');
                                }}
                                style={{ cursor: 'pointer', color: 'black' }}
                            />
                            &ensp;
                            <CancelIcon
                                onClick={() => {
                                    tuContext.setValue(
                                        `TransUnion`,
                                        originalFieldValuesRef.current[key]
                                    );
                                    setIsEditingField('');
                                }}
                                style={{ cursor: 'pointer', color: 'grey' }}
                            />
                            &ensp;&ensp;
                        </>
                    ) : (
                        <>
                            <EditIcon
                                onClick={() => {
                                    originalFieldValuesRef.current[key] = tuContext.getValues(
                                        `TransUnion`
                                    );
                                    setIsEditingField(key);
                                }}
                                style={{ cursor: 'pointer', color: '#EAEAEA' }}
                            />
                            &ensp;&ensp;
                        </>
                    )}
                </>
            </InputAdornment>
        ),
    });

    return (
        <>
        <FormContainer formContext={tuContext} onSuccess={handleSubmit}>
            <SelectElement 
                name={`TransUnion`}
                label="TransUnion"
                parseError={parseError}
                disabled={isEditingField!== 'TransUnion'}
                InputProps={{sx: { minWidth: 150 }, ...commonInputProps('TransUnion')}}
                options={getRecordsName(dataModels?.find(dm => dm.id === data?.dataModel)?.properties?.['TransUnion']?.ref)}
            />
        </FormContainer>
        <FormContainer formContext={formContext}>
            {(open == 'View' && (report === 'credit' ? creditRecords.length > 0 : (report === 'analytics' ? analyticsRecords.length > 0 : false))) ?
                <Box sx={{ flexGrow: 'auto' }}>
                    <CrudMaterialTable
                        key={report === 'credit' ? creditRecords.length : (report === 'analytics' ? analyticsRecords.length : 0)}
                        tableRows={report === 'credit' ? creditRecords : (report === 'analytics' ? analyticsRecords : 0)}
                        columns={report === 'credit' ? creditReportColumns : (report === 'analytics' ? analyticsReportColumns : [])}
                        isReadOnly={false}
                        pagination={{
                            ...pagination,
                            onPageChange: handlePageChange
                        }}
                        tableHeight="calc(80vh - 140px)"
                    ></CrudMaterialTable>
                </Box> : <Typography>No Records</Typography>}
            {viewReport && <DialogScreen open={viewReport} onClose={onCloseReport} title="Report" subTitle="" width="100%" customHeight="100%">
                <Grid container spacing={2} p={2} columns={12}>
                    {(selectedDataModel != null) && (selectedDataModel.properties != null) && Object.keys(selectedDataModel.properties).map((key) => (
                        <>
                            {(selectedDataModel.properties != null && selectedDataModel.properties[key].type !== 'object')
                                ?
                                <Grid item xs={6} sm={6} md={6}>
                                    {selectedDataModel.properties[key].type == 'reference' &&
                                        <>{selectedDataModel.properties[key].type.length == 1 ?
                                            <SelectElement fullWidth label={camelCaseToTitleCase(key)} name={`fields.${key}`} parseError={parseError} size="small" options={getRecordsName(selectedDataModel.properties[key].ref)} />
                                            // will try again
                                            // <>
                                            // <label>{camelCaseToTitleCase(key)}</label>
                                            // <select multiple value={multipleValue} onChange={(event) => {setMultipleDropdownValue(event)}}>
                                            //   {getRecordsName(selectedDataModel.properties[key].ref).map((item) => (
                                            //     <option value={item.id}>{item.label}</option>
                                            //   ))}
                                            // </select>
                                            // </>

                                            :
                                            <SelectElement fullWidth label={camelCaseToTitleCase(key)} name={`fields.${key}`} parseError={parseError} size="small" options={getRecordsName(selectedDataModel.properties[key].ref)} />
                                        }</>}
                                    {(selectedDataModel.properties[key].type == 'string' || selectedDataModel.properties[key].type == 'number' || selectedDataModel.properties[key].type == 'date') &&
                                        <TextFieldElement type={selectedDataModel.properties[key].type} disabled={open == 'View'} fullWidth label={selectedDataModel.properties[key].type != "date" ? camelCaseToTitleCase(key) : ''} name={`fields.${key}`} parseError={parseError} size="small" />
                                    }
                                    {selectedDataModel.properties[key].type == 'boolean' &&
                                        <SelectElement fullWidth label={camelCaseToTitleCase(key)} name={`fields.${key}`} parseError={parseError} size="small" options={[{ "id": "true", "label": "Yes" }, { "id": "false", "label": "No" }]} value={booleanValue} onChange={event => setBooleanDropdownValue(event)} />
                                    }
                                    {selectedDataModel.properties[key].type == 'array' &&
                                        <>
                                            <Typography variant="h6" gutterBottom>{key}</Typography>
                                            <RecursiveArrayRendering model={selectedDataModel.properties[key]} base={`fields.${key}`} isDisabled={open ? open : ''}></RecursiveArrayRendering>
                                        </>
                                    }
                                </Grid>
                                : <></>
                            }
                        </>
                    ))}
                    {(open != 'List' && selectedDataModel != null) && (selectedDataModel.properties != null) && Object.keys(selectedDataModel.properties).map((key, index) => (
                        <>
                            {(selectedDataModel.properties != null && selectedDataModel.properties[key].type == 'object' && selectedDataRecord?.objectName !== "TransUnion")
                                ?
                                <Accordion>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="report-object"
                                        id="report-object-header"
                                    >
                                        <Typography variant='h6' color="#039485">{camelCaseToTitleCase(key)}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <RecursiveFieldRendering model={selectedDataModel.properties[key]} base={`fields.${key}`} isDisabled={open ? open : ''}></RecursiveFieldRendering>
                                    </AccordionDetails>
                                </Accordion>
                                : <>
                                    <CreditReport data={selectedDataRecord} open={open} report={"credit"}/>
                                </>
                            }
                        </>
                    ))}
                </Grid>
            </DialogScreen>}
        </FormContainer>
        </>
    )
}
