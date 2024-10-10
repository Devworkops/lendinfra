
import React, { useEffect, useMemo } from "react";
import { Box, Button, Divider, Grid, Toolbar, Typography } from '@mui/material'
import { DatePickerElement, FormContainer, SelectElement, TextFieldElement, useForm } from 'react-hook-form-mui'
import { DataRecord } from "../../interfaces/IDataRecord";
import useFormHelper from '../../hooks/useFormHelper'
import useApi from '../../hooks/useApi'
import { useSnackbar } from 'notistack'
import { useAuth } from '../../hooks/useAuth'
import { DataModel } from "../../interfaces/IDataModel";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { camelCaseToTitleCase } from '../../utils/textFromatter';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MButton from "../common/Mbutton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from "next/router";


export interface DetailsProps {
    data: DataRecord | undefined
    open: string | undefined
    setOpen: React.Dispatch<React.SetStateAction<string | undefined>>
    objectName: string
}

interface DataRecordObj { dataRecord: DataRecord }
interface Data1 { contract: DataRecord, transaction: DataRecord[] }
export default function TransactionDetails(props: DetailsProps) {
    const { open, setOpen, data, objectName } = props
    const [getDataModels] = useApi<DataModel[]>()
    const [getDataRecords, addDataRecord, updateDataRecord,] = useApi<DataRecord>()
    const [dataModels, setDataModels] = React.useState<DataModel[]>([])
    const [dataRecords, setDataRecords] = React.useState<DataRecord[]>([])
    const [selectedDataModel, setSelectedDataModel] = React.useState<DataModel | null>(null)
    const [booleanValue, setBooleanValue] = React.useState('');
    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar()
    const { auth } = useAuth()
    const [getContractData, , ,] = useApi<DataRecord>()
    const [isDisplayfields, setFields] = React.useState<boolean>(false)
    const [dataRecord, setDataRecord] = React.useState<Data1>()
    const router = useRouter();
    let { id: contractId } = router.query;

    const onClose = () => {
        setOpen('List')
    }

    const setBooleanDropdownValue = (event: any) => {
        setBooleanValue(event)
    }

    const formContext = useForm<DataRecordObj>({
        defaultValues: {
            dataRecord: {
                id: open != 'New' ? data?.id : undefined,
                objectName: open != 'New' ? data?.objectName : objectName,
                uniqueId: open != 'New' ? data?.uniqueId : '',
                dataModel: open != 'New' ? data?.dataModel : '',
                company: auth?.companyId,
                createdBy: auth?.id,
                fields: open != 'New' ? data?.fields : {},
                isActive: true
            }
        }
    })

    const { watch, setValue, getValues } = formContext;
    const moneyIn = watch('dataRecord.fields.MoneyIn');
    const moneyOut = watch('dataRecord.fields.MoneyOut');  
    const ContractId = watch('dataRecord.fields.ContractId');  

    useEffect(()=>{
        if(open === 'View') return;
        if(contractId) setValue('dataRecord.fields.ContractId',contractId)
    }, [contractId])

    useEffect(() => {
        if(open === 'View') return;
        if(!ContractId) return;
        let ContractRecordBaseUrl = `api/contract/Detail?companyId=${auth?.companyId}&contractId=${ContractId}`
        getContractData(ContractRecordBaseUrl).then((response) => {
            if (response.data.errors) {
                enqueueSnackbar(response.data.errors[0].message, {
                    variant: 'error'
                })
            } else {
                if (response && response?.data?.contract) {
                    setFields(true)
                    setDataRecord(response.data)
                    const [startingBalance, endingBalance, facilityAvailable, principalOutstanding, interest] = calculateTransactionValue(response?.data)                        
                    setValue('dataRecord.fields.EndingBalance',endingBalance )
                    setValue('dataRecord.fields.FacilityAvailable',facilityAvailable )
                    setValue('dataRecord.fields.StartingBalance',startingBalance )
                    setValue('dataRecord.fields.TotalOutstanding',principalOutstanding)
                    setValue('dataRecord.fields.Interest',interest.toFixed(2).replace(/\.00$/, ""))
                }
            }                
        })
    }, [ContractId]);

    function calculateTransactionValue(data: Data1): number[] {
        if (data?.transaction?.length > 0) {
          let facilityAmount: number = data?.contract.fields.FacilityAmount;
          let principalOutstanding: number = 0;
          let startingBalance: number = 0;
          let endingBalance: number = 0;
          let facilityAvailable: number = 0;
          let interest: number = 0;
          data?.transaction.forEach(item => {
            if (item.fields.Type === "Withdrawal") {
              principalOutstanding = principalOutstanding + Number(item.fields.MoneyOut || 0)
            } else if (item.fields.Type === "Deposit") {
              if (Number(item.fields.MoneyIn) <= interest) {
                principalOutstanding = principalOutstanding;
                interest = interest - Number(item.fields.MoneyIn)
              } else {
                principalOutstanding = principalOutstanding - (Number(item.fields.MoneyIn || 0) - interest)
                interest = 0;
              }
            } else if (item.fields.Type === "Interest") {
              interest = interest + Number(item.fields.Interest || 0)
            } else {
              endingBalance = facilityAmount;
              startingBalance = facilityAmount;
              facilityAvailable = facilityAmount;
            }
          })
          startingBalance = facilityAmount - principalOutstanding
          endingBalance = facilityAmount - principalOutstanding
          facilityAvailable = facilityAmount - principalOutstanding
      
          return [startingBalance, endingBalance, facilityAvailable, principalOutstanding, interest]
        } else return [0, 0, 0, 0, 0]
      }

  let [initialFacilityAvaValue, initialOutstandingValue, interestValue] = useMemo(()=>{
    if(dataRecord) {
        const [,,facilityAvailable, principalOutstanding, interest] = calculateTransactionValue(dataRecord)
        return [facilityAvailable, principalOutstanding, interest]
    }else return [0, 0, 0]
  }, [dataRecord])


  useEffect(()=>{
    if(!isDisplayfields) return;
    let timerId: ReturnType<typeof setTimeout>;
    if(moneyIn) {
        enqueueSnackbar('Please choose one field from MoneyIn/MoneyOut', { variant: 'error' }); 
        setValue('dataRecord.fields.MoneyOut', undefined)
        return;
    }
    setValue('dataRecord.fields.Type', 'Withdrawal')
    
    if(initialFacilityAvaValue < moneyOut) enqueueSnackbar('You are trying to withdrawal out of facility available', { variant: 'error' })

        timerId = setTimeout(()=>{
            let availableFacilityAmt = initialFacilityAvaValue - Number(moneyOut)
            let availabelOutstandingAmt  = initialOutstandingValue + Number(moneyOut)
            setValue('dataRecord.fields.FacilityAvailable',availableFacilityAmt)
            setValue('dataRecord.fields.TotalOutstanding',availabelOutstandingAmt)
            setValue('dataRecord.fields.EndingBalance',availableFacilityAmt)
        }, 500)
  
    return ()=>{
        clearTimeout(timerId)
    }
  },[moneyOut])

  useEffect(()=>{
    if(!isDisplayfields) return;    
    let timerId: ReturnType<typeof setTimeout>;
    let deductAmt: number = 0;
    let availabelOutstandingAmt: number = 0;
    let interest: number = 0;
   
    if(moneyOut){
        enqueueSnackbar('Please choose one field from MoneyIn/MoneyOut', { variant: 'error' }); 
        setValue('dataRecord.fields.MoneyIn', undefined)
        return
    }
        setValue('dataRecord.fields.Type', 'Deposit')
        const moneyin = Math.abs(Number(moneyIn) || 0)
        timerId = setTimeout(()=>{
        deductAmt = Math.abs(moneyin - Number(interestValue || 0))
        let availableFacilityAmt: number = 0;
            if(moneyin <= Number(interestValue)){
                availabelOutstandingAmt = initialOutstandingValue;
                interest = Number(interestValue) - moneyin;
                availableFacilityAmt = initialFacilityAvaValue
            }else {
                availabelOutstandingAmt = (initialOutstandingValue - (moneyin - Number(interestValue)))
                interest = 0;
                 availableFacilityAmt = (initialFacilityAvaValue + deductAmt)
            }
            setValue('dataRecord.fields.Interest',interest.toFixed(2).replace(/\.00$/, ""))
            setValue('dataRecord.fields.FacilityAvailable',availableFacilityAmt.toFixed(2).replace(/\.00$/, ""))
            setValue('dataRecord.fields.EndingBalance',availableFacilityAmt.toFixed(2).replace(/\.00$/, ""))
            setValue('dataRecord.fields.TotalOutstanding',availabelOutstandingAmt.toFixed(2).replace(/\.00$/, ""))
    }, 500)
    
    return ()=>{
        clearTimeout(timerId)
    }
  },[moneyIn])

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
    const getDataRecordsFunction = async () => {
        let DataRecordBaseUrl = `api/datarecord/all/${auth?.companyId}`
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
            }
        }
    }

    const getRecordsName = (objectName: undefined) => {
        const records: Array<{
            label: string
            id: string
        }> = []
        const selectedDataRecords = dataRecords.filter(function (item) {
            return item.objectName === objectName;
        });

        selectedDataRecords.forEach(element => {
            records.push({ label: (element.fields.FirstName) ? element.recordId + ' ' + element.fields.FirstName + ' ' + element.fields.LastName 
            : element.recordId , id: element.id })
        })
        return records
    }

    function transformProperty(properties: any, fields: any) {
        const transformedFields = fields
        for (const key in properties) {
            if (properties.hasOwnProperty(key)) {
                const type = properties[key]?.type;
                switch (type) {
                    case 'string':
                        transformedFields[key] = fields[key]
                        break;
                    case 'reference':
                        transformedFields[key] = fields[key]
                        break;
                    case 'number':
                        transformedFields[key] = parseInt(fields[key]);
                        break;
                    case 'boolean':
                        transformedFields[key] = fields[key];
                        break;
                    case 'date':
                        transformedFields[key] = new Date(transformedFields[key]);
                        break;
                    case 'object':
                        transformedFields[key] = transformProperty(properties[key].properties, transformedFields[key]);
                        break;
                }
            }
        }
        return transformedFields
    }

    function RecursiveFieldRendering(props: { fields: any, base: string, isDisabled: string }) {
        const [parseError] = useFormHelper()
        const { fields, base, isDisabled } = props;
        return <Grid container rowSpacing={2} columnSpacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }} columns={12}>
            {(fields != null) && (fields.properties != null) && Object.keys(fields.properties).map((key) => (
                <Grid item xs={6} sm={6} md={6}>
                    {(fields.properties[key].type !== 'object')
                        ?
                        <>
                            {fields.properties[key].type == 'reference' &&
                                <>{fields.properties[key].type.length == 1 ?
                                    <SelectElement fullWidth label={camelCaseToTitleCase(key)} name={`${base}.${key}`} parseError={parseError} size="small" options={getRecordsName(fields.properties[key].ref)} required={fields.properties[key].required ? fields.properties[key].required : false} disabled={isDisabled == 'View'}/> :
                                    <SelectElement fullWidth label={camelCaseToTitleCase(key)} name={`${base}.${key}`} parseError={parseError} size="small" options={getRecordsName(fields.properties[key].ref)} required={fields.properties[key].required ? fields.properties[key].required : false} disabled={isDisabled == 'View'}/>
                                }</>}
                            {(fields.properties[key].type == 'string' || fields.properties[key].type == 'number' || fields.properties[key].type == 'decimal') &&
                                <TextFieldElement type={fields.properties[key].type} disabled={isDisabled == 'View'} fullWidth label={camelCaseToTitleCase(key)} name={`${base}.${key}`} parseError={parseError} size="small" required={fields.properties[key].required ? fields.properties[key].required : false}/>
                            }
                            {fields.properties[key].type == 'date' &&
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePickerElement timezone="Asia/Kolkata" disabled={isDisabled == 'View'} label={fields.properties[key].type != "date" ? camelCaseToTitleCase(key) : ''} name={`${base}.${key}`} parseError={parseError} required={fields.properties[key].required ? fields.properties[key].required : false}/>
                                </LocalizationProvider>
                            }
                            {fields.properties[key].type == 'boolean' &&
                                <SelectElement fullWidth label={camelCaseToTitleCase(key)} disabled={isDisabled == 'View'} name={`dataRecord.fields.${key}`} parseError={parseError} size="small" options={[{ "id": "true", "label": "Yes" }, { "id": "false", "label": "No" }]} required={fields.properties[key].required ? fields.properties[key].required : false}/>
                            }
                        </>
                        : <>
                            <Typography variant='h6'>{camelCaseToTitleCase(key)}</Typography>
                            <RecursiveFieldRendering fields={fields.properties[key]} base={base + '.' + key} isDisabled={isDisabled}></RecursiveFieldRendering>
                        </>
                    }
                </Grid>
            ))} </Grid>
    }

    useEffect(() => {
        getDataModelsFunction();
        getDataRecordsFunction();
    }, [])

    useEffect(() => {
        const datamodel = dataModels.find((obj) => {
            return obj.name === objectName
        })

        if (datamodel != null) { setSelectedDataModel(datamodel) }
    }, [objectName, dataModels])

    const handleSubmit = async (data: DataRecordObj) => {
        if (open == 'View') {
            setOpen('Edit')
            return;
        }
        data.dataRecord.dataModel = selectedDataModel?.id ? selectedDataModel.id : ''
        const transformedFields = transformProperty(selectedDataModel?.properties, data.dataRecord.fields)
        data.dataRecord.fields = transformedFields
        let result
        if (open == 'New') {
            result = await addDataRecord('api/datarecord/new', data.dataRecord)
        }
        else if (data.dataRecord.id != undefined) {
            result = await updateDataRecord(`api/datarecord/${data.dataRecord.id}`, data.dataRecord)
        }


        if (result && result.data.errors) {
            enqueueSnackbar(result.data.errors[0].message, {
                variant: 'error'
            })
            setSelectedDataModel(null)
            setOpen('List')
        } else {
            enqueueSnackbar(open == 'New' ? `Record addedd Successfully` : 'Record updated Successfully', {
                variant: 'success'
            })
            setOpen('List')
        }
    }

    return (
        <>
            <Toolbar sx={{ paddingLeft: '4px !important' }}>
              <MButton
                size="small"
                variant="outlined"
                onClick={() => {setOpen('List') }}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </MButton>
              <Typography variant="h6" component="div" sx={{ paddingLeft: '20px', flexGrow: 1 }}>
                {`${objectName}${data ? ' - ' + data.recordId : ''}`}
              </Typography>
            </Toolbar>

            <FormContainer formContext={formContext} onSuccess={handleSubmit}>
                {/* {open != 'New' && <Button
                    sx={{ left: '95%' }}
                    size="small"
                    variant="outlined"
                    type="submit"
                    startIcon={open != 'Edit' ? <EditIcon /> : <SaveIcon />}
                >
                    {open != 'Edit' ? 'Edit' : 'Save'}
                </Button>} */}
                <Box sx={{ width: '100%' }}>
                    <React.Fragment>
                        <Grid container spacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }} columns={12}>
                            {(selectedDataModel != null) && (selectedDataModel.properties != null) && Object.keys(selectedDataModel.properties).map((key) => (
                                <>
                                    {(selectedDataModel.properties != null && selectedDataModel.properties[key].type !== 'object')
                                        ?
                                        <Grid item xs={6} sm={6} md={6}>
                                            {selectedDataModel.properties[key].type == 'reference' &&
                                                <>{selectedDataModel.properties[key].type.length == 1 ?
                                                    <SelectElement disabled={open == 'View'} fullWidth label={camelCaseToTitleCase(key)} name={`dataRecord.fields.${key}`} parseError={parseError} size="small" options={getRecordsName(selectedDataModel.properties[key].ref)} required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false}/>
                                                    :
                                                    <SelectElement disabled={open == 'View'} fullWidth label={camelCaseToTitleCase(key)} name={`dataRecord.fields.${key}`} parseError={parseError} size="small" options={getRecordsName(selectedDataModel.properties[key].ref)} required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false}/>
                                                }</>
                                            }
                                            {(selectedDataModel.properties[key].type == 'string' || selectedDataModel.properties[key].type == 'number'  || selectedDataModel.properties[key].type == 'decimal') &&
                                                <TextFieldElement type={selectedDataModel.properties[key].type} disabled={open == 'View'} fullWidth label={camelCaseToTitleCase(key)} name={`dataRecord.fields.${key}`} parseError={parseError} size="small" required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false}/>
                                            }
                                            {selectedDataModel.properties[key].type == 'date' &&
                                            <LocalizationProvider dateAdapter={AdapterDateFns} >
                                                <DatePickerElement timezone="Asia/Kolkata" disabled={open == 'View'} label={camelCaseToTitleCase(key)} name={`dataRecord.fields.${key}`} parseError={parseError} required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false}/>
                                                </LocalizationProvider>
                                            }
                                            
                                            {selectedDataModel.properties[key].type == 'boolean' &&
                                                <SelectElement fullWidth label={camelCaseToTitleCase(key)} disabled={open == 'View'} name={`dataRecord.fields.${key}`} parseError={parseError} size="small" options={[{ "id": "true", "label": "Yes" }, { "id": "false", "label": "No" }]} value={booleanValue} onChange={event => setBooleanDropdownValue(event)} required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false}/>
                                            }
                                        </Grid>
                                        : <></>
                                    }
                                </>
                            ))}
                            {(open != 'List' && selectedDataModel != null) && (selectedDataModel.properties != null) && Object.keys(selectedDataModel.properties).map((key) => (
                                <>
                                    {(selectedDataModel.properties != null && selectedDataModel.properties[key].type == 'object')
                                        ? <Grid item xs={12} sm={12} md={12}>
                                            <Typography variant='h6'>{camelCaseToTitleCase(key)}</Typography>
                                            <Divider></Divider>
                                            <RecursiveFieldRendering fields={selectedDataModel.properties[key]} base={`dataRecord.fields.${key}`} isDisabled={open ? open : ''} ></RecursiveFieldRendering>
                                            <Divider></Divider>
                                        </Grid>
                                        : <></>
                                    }
                                </>
                            ))}
                        </Grid>
                        {open == 'New' &&
                            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, pb: 2 }}>
                                <Button
                                    color="inherit"
                                    onClick={onClose}
                                    sx={{ mr: 1 }}
                                >
                                    Cancel
                                </Button>
                                <Box sx={{ flex: '1 1 auto' }} />
                                <Button type="submit" variant='contained'>
                                    Submit
                                </Button>
                            </Box>}
                    </React.Fragment>
                </Box>
            </FormContainer>
        </>
    )
}