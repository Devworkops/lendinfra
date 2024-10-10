
import React, { useEffect, useState } from "react";
import { Box, Button, Divider, Grid, InputAdornment, Typography } from '@mui/material'
import { DatePickerElement, FormContainer, SelectElement, TextFieldElement, useForm } from 'react-hook-form-mui'
import { DataRecord } from "../../interfaces/IDataRecord";
import useFormHelper from '../../hooks/useFormHelper'
import useApi from '../../hooks/useApi'
import { useSnackbar } from 'notistack'
import { useAuth } from '../../hooks/useAuth'
import { DataModel } from "../../interfaces/IDataModel";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { camelCaseToTitleCase } from '../../utils/textFromatter';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useRouter } from "next/router";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Reason } from "../../interfaces/IReason";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type IndividualAccount = DataRecord | DataRecord[]

export interface DetailsProps {
    data: DataRecord | undefined
    open: string | undefined
    setOpen: React.Dispatch<React.SetStateAction<string | undefined>>
    objectName: string,
    individualAccount?: IndividualAccount
}

interface Page {
    type: string
    pageNum: number
}

interface DataRecordObj { dataRecord: DataRecord }

interface LoadData {  objectName:  string,
    value: string,
    optionType: string 
}

interface OptionsData { 
    type: string,
    currentOptions: DataRecord[] 
}

interface Option {
    label: string,
    id: string
}

export default function Details(props: DetailsProps) {
    const { open, setOpen, data, objectName, individualAccount } = props
    const [getDataModels, , updateDataModel,] = useApi<DataModel>()
    const [,getReasons,,] = useApi<Reason>();
    const [reasons, setReasons ] = useState<Reason>()
    const [getDataRecords, addDataRecord, updateDataRecord,] = useApi<DataRecord>()
    const [dataModels, setDataModels] = React.useState<DataModel[]>([])
    const [isEditingField, setIsEditingField] = React.useState<string>('');
    const [selectedDataModel, setSelectedDataModel] = React.useState<DataModel | null>(null)
    const [booleanValue, setBooleanValue] = React.useState('');
    const [isLoadMore, setIsLoadMore] = React.useState(true);
    const [isLoadMoreNested, setisLoadMoreNested] = React.useState(true);
    const [page, setPage] = React.useState<Page[] | undefined>([]);
    const [options, setOptions] = React.useState<OptionsData[] | undefined>([]);
    const [nestedOptions, setNestedOptions] = React.useState<DataRecord[]>([]);
    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar()
    const { auth } = useAuth()
    const router = useRouter();
    const originalFieldValuesRef = React.useRef<{ [key: string]: any }>({});
    const [loadData, setLoadData] = React.useState<LoadData>({
        objectName: "",
        value: "",
        optionType: ""
    })

    const onClose = () => {
        setOpen('List')
        router.push(`/${router.pathname.split('/')[1]}`)
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
    // Watching specific fields
    const FacilityDuration = watch('dataRecord.fields.FacilityDuration');
    const FacilityStartDate = watch('dataRecord.fields.FacilityStartDate');
    const DailyRate = watch('dataRecord.fields.DailyRate');
    const Principal = watch('dataRecord.fields.FacilityAmount');
    

    function calculateARR(dailyRate:any, principal:any, daysOutstanding:any) {
        const dailyRateDecimal = dailyRate / 100;
        let outflow = principal
        let inflow = principal+(principal*daysOutstanding*dailyRateDecimal)
        let IRR = Math.pow((inflow/outflow), (1/daysOutstanding))-1
        let ARR = Math.pow((IRR+1), 365)-1;
        return ARR*100;
    }

    useEffect(() => {
    if (FacilityDuration && FacilityStartDate) {
        const startDate = new Date(FacilityStartDate);
        const calculatedEndDate = new Date(startDate.setMonth(startDate.getMonth() +  parseInt(FacilityDuration, 10)));
        setValue('dataRecord.fields.FacilityEndDate', calculatedEndDate)
    } else {
        setValue('dataRecord.fields.FacilityEndDate', '');
    }

    if (DailyRate ){
        const AnnualFlat = DailyRate*365+"%"
        setValue('dataRecord.fields.AnnualFlat', AnnualFlat);
        const daysOutstanding = 1;
        if (DailyRate && Principal ){
            const ARR = calculateARR(DailyRate, Principal, daysOutstanding);
            setValue('dataRecord.fields.APR', ARR.toFixed(2)+"%");
        } else {
            setValue('dataRecord.fields.APR',undefined);
        }
    } else {
        if (DailyRate == '') {
            setValue('dataRecord.fields.AnnualFlat',undefined);
            setValue('dataRecord.fields.APR',undefined);
        }
    }
  }, [FacilityDuration,FacilityStartDate,DailyRate,Principal, getValues]);

    useEffect(() => {
    if (!Array.isArray(page)) return;
    if (page?.length > 0 && page) {
        loadOptions(loadData.objectName, loadData.value, loadData.optionType);
    }
    }, [page]);

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

    const addAddress = async () => {
        if (data) {
            let maxNumericValue = 0;
            // Iterate through the object to find the maximum numeric value
            for (const key in data.fields) {
                if (data.fields.hasOwnProperty(key)) {
                    const numericValue = parseInt(key.replace('Address', '0'));
                    if (!isNaN(numericValue) && numericValue > maxNumericValue) {
                        maxNumericValue = numericValue;
                    }
                }
            }
            const nextKey = 'Address' + (maxNumericValue + 1);
            for (const key in data.fields.Address) {
                if (Object.prototype.hasOwnProperty.call(data.fields.Address, key)) {
                    if (!data.fields[nextKey]) data.fields[nextKey] = {}
                    data.fields[nextKey][key] = 'NULL';
                }
            }
            await updateDataRecord(`api/datarecord/${data?.id}`, data as DataRecord)

            if (selectedDataModel && selectedDataModel.properties) {
                selectedDataModel.properties[nextKey] = selectedDataModel.properties.Address
                await updateDataModel(`api/datamodel/${selectedDataModel.id}`, selectedDataModel)
            }
        }
    }

    const getRecordsName = (value='', ref=''): Option[] => {

        const records: Option[] = [];
        if(value && value === 'nested'){
            nestedOptions.forEach((element: any) => {
                records.push({
                    label: (element.fields.FirstName) ? element.recordId + ' ' + element.fields.FirstName + ' ' + element.fields.LastName
                    : element.recordId, id: element.id
                })
            })
        } else {
            options?.filter(item=>item.type === value)[0]?.currentOptions.forEach((element: any) => {
                records.push({
                    label: (element.fields.FirstName) ? element.recordId + ' ' + element.fields.FirstName + ' ' + element.fields.LastName
                    : element.recordId, id: element.id
                })
            })
        }
        if (individualAccount) {
            if (Array.isArray(individualAccount)) {
                individualAccount.forEach(account => {
                    
                    if (account?.objectName === ref) {     
                    records.push({
                        label:account?.objectName == "BusinessAccount" ? account.recordId+ ' ' + account.fields?.BusinessName : (account.fields?.FirstName ? account.recordId + ' ' + account.fields.FirstName + ' ' + account.fields.LastName : account.recordId),
                        id: account.id
                    });
                    }
              });
            } else {
              if (!records.find(record => record.id === individualAccount.id)) {
                records.push({
                  label: individualAccount.fields?.FirstName ? individualAccount.recordId + ' ' + individualAccount.fields.FirstName + ' ' + individualAccount.fields.LastName : individualAccount.recordId,
                  id: individualAccount.id
                });
              }
            }
        }
          
          return records;
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
                        transformedFields[key] = parseInt(fields[key]) || 0;
                        break;
                    case 'boolean':
                        transformedFields[key] = fields[key];
                        break;
                    case 'date':
                        transformedFields[key] = new Date(transformedFields[key]);
                        break;
                    case 'list':
                        transformedFields[key] = fields[key];
                        break;
                    case 'object':
                        transformedFields[key] = transformProperty(properties[key].properties, transformedFields[key]);
                        break;
                }
            }
        }
        return transformedFields
    }

    const commonInputProps = (key: string, baseKey?: string) => {
        const reasonKey = baseKey ? baseKey + '.' + key : key;
        const isReasonKey = reasons?.fields?.[`${reasonKey}`];
        let isValueEqual = false;
        if (isReasonKey) 
          isValueEqual = baseKey 
            ? reasons?.fields?.[`${reasonKey}`].value == formContext.getValues().dataRecord.fields[`${baseKey}`][`${key}`]
            : reasons?.fields?.[`${reasonKey}`].value == formContext.getValues().dataRecord.fields[`${key}`];

        return ({
        endAdornment: (
            <InputAdornment position="end">
                {open !== 'New' && (
                    <>
                        {isEditingField === key ? (
                            <>
                                <SaveIcon
                                    onClick={async () => {
                                        setIsEditingField('');
                                        handleSubmit(formContext.getValues());
                                    }}
                                    style={{ cursor: 'pointer', color: 'black' }}
                                />
                                &ensp;
                                <CancelIcon
                                    onClick={() => {
                                        formContext.setValue(
                                            `dataRecord.fields.${key}`,
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
                                        originalFieldValuesRef.current[key] = formContext.getValues(
                                            `dataRecord.fields.${key}`
                                        );
                                        setIsEditingField(key);
                                    }}
                                    style={{ cursor: 'pointer', color: '#EAEAEA' }}
                                />
                                &ensp;&ensp;
                            </>
                        )}
                        {isEditingField === '' 
                            && isReasonKey
                            && isValueEqual
                            && <InfoOutlinedIcon 
                                style={{ cursor: 'pointer', color: 'black' }}
                                    onClick={()=>{
                                        enqueueSnackbar(reasons?.fields?.[reasonKey]?.reason, {variant:'info'})
                                    }}    
                            />}
                    </>
                )}
            </InputAdornment>
        ),
    })};

    const loadOptions = async (ref: string, value='', optionType='') => {
        const pageNumber = page?.find((item) => item.type === value)?.pageNum;
        try {
            const response = await getDataRecords(`api/datarecord/object/all/${ref}?page=${pageNumber}&limit=10`);
            if (response.data.errors) {
                enqueueSnackbar(response.data.errors[0].message, { variant: 'error' });
            } else {
            if (optionType && optionType === 'nested'){
                setNestedOptions((prevOptions: any) => [...prevOptions, ...response.data.records]);
                if(nestedOptions.length === response.data.total ) setisLoadMoreNested(false);
                else setisLoadMoreNested(true);
            } else {
                setOptions((prev) => {
                    if (!Array.isArray(prev)) return [];
                    const existingTypeIndex = prev.findIndex(item => item.type === value);
                
                    if (existingTypeIndex !== -1) {
                        return prev.map((item, index) => 
                        index === existingTypeIndex
                            ? { ...item, currentOptions: [...item.currentOptions, ...response.data.records]}
                            : item
                        );
                    } else {
                        return [...prev, { type: value, currentOptions: response.data.records }];
                    }
                });
            }

            }
        } catch (error) {
            enqueueSnackbar('Failed to load data', { variant: 'error' });
        }
    };

    const handleLoadMore = async (objectName: string, value='', optionType='') => {
        setLoadData({
            objectName,
            value,
            optionType
        })
        updatePageHandler(value)
    };

    const updatePageHandler = (type: string) => {
        setPage((prev) => {
          if (!Array.isArray(prev)) return [];
      
          const existingTypeIndex = prev.findIndex(item => item.type === type);
      
          if (existingTypeIndex !== -1) {
            return prev.map((item, index) => 
              index === existingTypeIndex
                ? { ...item, pageNum: item.pageNum + 1 }
                : item
            );
          } else {
            return [...prev, { type, pageNum: 1 }];
          }
        });
      };

    const fetchReasons = async (recordId: string) => {
        const response = await getReasons(`api/reasons`, {primaryKey: recordId, objectName: data?.objectName})
        if(response.status === 200) {
            setReasons(response.data)
        }
    }

    function RecursiveFieldRendering(props: { fields: any, base: string, isDisabled: string ,baseKey: string}) {
        const [parseError] = useFormHelper()
        const { fields, base, isDisabled, baseKey } = props;
        const disableRequired = !base.includes('Address')
        return <Grid container rowSpacing={2} columnSpacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }} columns={12}>
            {(fields != null) && (fields.properties != null) && Object.keys(fields.properties).map((key) => (
                <Grid item xs={6} sm={6} md={6}>
                    {(fields.properties!= null && fields.properties[key].type !== 'object' && fields.properties[key].type !== 'array')
                        ?
                        <>{fields.properties[key].type == 'reference' &&
                                <>
                                {fields.properties[key].type.length == 1 ?
                                    <SelectElement 
                                        fullWidth 
                                        label={camelCaseToTitleCase(key)} 
                                        name={`${base}.${key}`} 
                                        parseError={parseError} 
                                        size="small" 
                                        options={isLoadMore ? [...getRecordsName(), { recordId: 'load_more', label: 'Load More' }] : getRecordsName()} 
                                        required={fields.properties[key].required ? fields.properties[key].required : false} 
                                        disabled={isDisabled ==='New' ? false : isEditingField !== key} 
                                        InputProps={commonInputProps(key, baseKey)}
                                        onClick={(event) => {
                                            if((event.target as HTMLElement)['localName'] === 'div' && fields && fields.properties && key !== isEditingField && formContext.getValues(`dataRecord.fields.${key}`))
                                                referenceFieldRedirect(`dataRecord.fields.${key}`, fields.properties[key].ref)
                                        }}
                                        onChange={(event) => {
                                            if (event.target.value === 'load_more') {
                                                handleLoadMore(selectedDataModel?.properties?.[key].ref,key);
                                            }
                                        }}/> :
                                        <>
                                            {fields.properties[key].type == "reference" ? 
                                            <SelectElement 
                                            fullWidth 
                                            label={camelCaseToTitleCase(key)} 
                                            name={`${base}.${key}`} 
                                            parseError={parseError} 
                                            size="small" 
                                            options={isLoadMoreNested ? [...getRecordsName('nested','IndividualAccount'), { recordId: 'load_more', label: 'Load More' }] : getRecordsName('nested','IndividualAccount')} 
                                            required={fields.properties[key].required ? fields.properties[key].required : false} 
                                            disabled={isDisabled ==='New' ? false : isEditingField !== key} 
                                            InputProps={commonInputProps(key, baseKey)}
                                            onClick={(event) => {
                                                if(fields.properties)
                                                if((event.target as HTMLElement)['localName'] === 'div' && fields && fields.properties && key !== isEditingField )
                                                    referenceFieldRedirect(`${base}.${key}`, 'IndividualAccount')
                                            }} 
                                            onChange={(event) => {
                                                if (event.recordId === 'load_more') {
                                                    handleLoadMore('IndividualAccount', key, 'nested');
                                                }
                                            }}/>
                                            :                                            
                                            <SelectElement 
                                                fullWidth 
                                                label={camelCaseToTitleCase(key)} 
                                                name={`${base}.${key}`} 
                                                parseError={parseError} 
                                                size="small" 
                                                options={isLoadMore ? [...getRecordsName(), { recordId: 'load_more', label: 'Load More' }] : getRecordsName()} 
                                                required={fields.properties[key].required ? fields.properties[key].required : false} 
                                                disabled={isDisabled ==='New' ? false : isEditingField !== key} 
                                                InputProps={commonInputProps(key, baseKey)}
                                                onClick={(event) => {
                                                    if(fields.properties)
                                                    if((event.target as HTMLElement)['localName'] === 'div' && fields && fields.properties && key !== isEditingField && formContext.getValues(`dataRecord.fields.${key}`))
                                                        referenceFieldRedirect(`dataRecord.fields.${key}`, fields.properties[key].ref)
                                                }} 
                                                onChange={(event) => {
                                                    if (event.target.value === 'load_more') {
                                                        handleLoadMore(fields?.properties?.[key].ref,key);
                                                    }
                                                }}/>
                                            }
                                        </>
                                }</>}
                            {(fields.properties[key].type == 'string' || fields.properties[key].type == 'number' || fields.properties[key].type == 'decimal') &&
                                <TextFieldElement type={fields.properties[key].type} disabled={isDisabled ==='New' ? false : isEditingField !== key} fullWidth label={camelCaseToTitleCase(key)} name={`${base}.${key}`} parseError={parseError} size="small" required={fields.properties[key].required && disableRequired ? fields.properties[key].required : false} InputProps={commonInputProps(key, baseKey)}/>
                            }
                            {fields.properties[key].type == 'date' &&
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Grid container alignItems="center" >
                                        <Grid item xs={6}>
                                            <DatePickerElement timezone="Asia/Kolkata" disabled={open === 'New' ? false : isEditingField !== key} label={camelCaseToTitleCase(key)} name={`${base}.${key}`} parseError={parseError} required={fields.properties[key].required ? fields.properties[key].required : false} />
                                        </Grid>
                                        <Grid item xs={6 }>
                                            {open !== 'New' && 
                                            (<>{isEditingField === key ? (
                                                        <>
                                                            <SaveIcon
                                                                onClick={async () => {
                                                                    setIsEditingField('');
                                                                    handleSubmit(formContext.getValues());
                                                                }}
                                                                style={{ cursor: 'pointer', color: 'black' }}
                                                            />&ensp;
                                                            <CancelIcon onClick={() => {
                                                                formContext.setValue(
                                                                    `dataRecord.fields.${key}`,
                                                                    originalFieldValuesRef.current[key]
                                                                );
                                                                setIsEditingField('');
                                                            }}
                                                            style={{ cursor: 'pointer', color: 'grey' }}/>&ensp;&ensp;
                                                        </>
                                                    ) : (
                                                    <><EditIcon onClick={() => {
                                                            originalFieldValuesRef.current[key] = formContext.getValues(
                                                                `dataRecord.fields.${key}`
                                                            );
                                                            setIsEditingField(key);
                                                        }}
                                                        style={{ cursor: 'pointer',color: '#EAEAEA' }}/>&ensp;&ensp;</>
                                                )}</>
                                            )}
                                        </Grid>
                                    </Grid>
                                </LocalizationProvider>
                            }
                            {fields.properties[key].type == 'boolean' &&
                                <SelectElement fullWidth label={camelCaseToTitleCase(key)} disabled={isDisabled ==='New' ? false : isEditingField !== key} name={`${base}.${key}`} parseError={parseError} size="small" options={[{ "id": "true", "label": "Yes" }, { "id": "false", "label": "No" }]} required={fields.properties[key].required ? fields.properties[key].required : false} InputProps={commonInputProps(key, baseKey)}/>
                            }
                            {
                                fields.properties[key].type == 'list' &&
                                <SelectElement fullWidth label={camelCaseToTitleCase(key)} disabled={isDisabled ==='New' ? false : isEditingField !== key} name={`${base}.${key}`} parseError={parseError} size="small" options={fields.properties[key].list.map((item:string) => ({ id: item, label: item }))} required={fields.properties[key].required ? fields.properties[key].required : false} InputProps={commonInputProps(key, baseKey)}/>
                            }
                        </>
                        : <>
                        {fields.properties[key].properties && !Object.values(fields.properties[key].properties).every((prop: any) => prop.type === 'array') &&
                            <>
                                <Typography variant='h6'>{camelCaseToTitleCase(key)}</Typography>
                                <RecursiveFieldRendering fields={fields.properties[key]} base={base + '.' + key} baseKey={`${baseKey+'.'+key}`} isDisabled={isDisabled}></RecursiveFieldRendering>
                            </>}
                        </>
                    }
                </Grid>
            ))} </Grid>
    }

    useEffect(() => {
        getDataModelsFunction();
    }, [])

    useEffect(()=>{
        if(data?.id)
            fetchReasons(data.id);
    },[data, objectName, data?.id])

    useEffect(() => {
        const datamodel = dataModels.find((obj) => {
            return obj.name === objectName
        })

        if (datamodel != null) { setSelectedDataModel(datamodel) }
    }, [objectName, dataModels])

    const handleSubmit = async (data: DataRecordObj) => {
        data.dataRecord.dataModel = selectedDataModel?.id ? selectedDataModel.id : ''
        const transformedFields = transformProperty(selectedDataModel?.properties, data.dataRecord.fields)
        data.dataRecord.fields = transformedFields
        let result
        let checkIfLoadMore = true;
        if (open == 'New') {
            result = await addDataRecord('api/datarecord/new', data.dataRecord)
        }
        else if (data.dataRecord.id != undefined) {
            for(const key in selectedDataModel?.properties){
                if(selectedDataModel.properties[key].type ==='reference' && data?.dataRecord?.fields[key]?.recordId === 'load_more'){
                    checkIfLoadMore = false;
                }
            } 
            if(checkIfLoadMore)
                result = await updateDataRecord(`api/datarecord/${data.dataRecord.id}`, data.dataRecord)
        }

        if (result && result.data.errors) {
            enqueueSnackbar(result.data.errors[0].message, {
                variant: 'error'
            })
            setSelectedDataModel(null)
        } else {
            if(!checkIfLoadMore) enqueueSnackbar('Please select the record')
            else enqueueSnackbar(open == 'New' ? `Record addedd Successfully` : 'Record updated Successfully', {
                variant: 'success'
            })
        }
    }

    const getType = (ref: string) => {
        let type = 'none'; 
        switch (ref) {
            case 'IndividualAccount':
                return 'accounts'        
            case 'Application':
                return 'applications'    
            case 'Contract':
                return 'contracts'    
            default:
                return 'none';
        }
    }
    
    const referenceFieldRedirect = (keyPath: any, ref: string) => {
        const type = getType(ref);
        if(type === 'none') {
            alert('Page not found!');
            return;
        }
        router.push(`/${type}/${formContext.getValues(keyPath)}`)
    }

    const isAllowedReferenceType = (ref: string) => (ref !== 'Consent' && ref !== 'TransUnion' && ref !== 'TrustLoop');

    return (
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
            {   objectName == 'Consent' && <Button
                size="small"
                variant="outlined"
                onClick={() => {setOpen('List') }}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
            }
            <Box sx={{ width: '100%' }}>
                <React.Fragment>
                    <Grid container spacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }} columns={12}>
                        {(selectedDataModel != null) && (selectedDataModel.properties != null) && Object.keys(selectedDataModel.properties).map((key) => (
                            
                            <>
                                {(selectedDataModel.properties != null && selectedDataModel.properties[key].type !== 'object' && selectedDataModel.properties[key].type !== 'array')
                                    ?
                                    <Grid item xs={6} sm={6} md={6}>
                                        {selectedDataModel.properties[key].type == 'reference' && isAllowedReferenceType(selectedDataModel.properties[key].ref) &&
                                            <>                                           
                                            {selectedDataModel.properties[key].type.length == 1 ?
                                                <SelectElement 
                                                disabled={open ==='New' ? false : isEditingField !== key} 
                                                fullWidth label={camelCaseToTitleCase(key)} 
                                                name={`dataRecord.fields.${key}`} 
                                                parseError={parseError} 
                                                size="small" 
                                                options={isLoadMore ? [...getRecordsName(), { recordId: 'load_more', label: 'Load More' }] : getRecordsName()} 
                                                required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false} 
                                                InputProps={commonInputProps(key)}                                           
                                                onClick={(event) => {
                                                    if((event.target as HTMLElement)['localName'] === 'div' && selectedDataModel && selectedDataModel.properties && key !== isEditingField && formContext.getValues(`dataRecord.fields.${key}`))
                                                        referenceFieldRedirect(`dataRecord.fields.${key}`, selectedDataModel.properties[key].ref)
                                                }}
                                                onChange={(event) => {
                                                    if (event.target.value === 'load_more') {
                                                        handleLoadMore(selectedDataModel?.properties?.[key].ref,key);
                                                    }
                                                }}/>
                                                :
                                                <SelectElement 
                                                id={`dataRecord.fields.${key}`} 
                                                disabled={open ==='New' ? false : isEditingField !== key} 
                                                fullWidth 
                                                label={camelCaseToTitleCase(key)} 
                                                name={`dataRecord.fields.${key}`} 
                                                parseError={parseError} size="small" 
                                                options={isLoadMore ? [...getRecordsName(key, selectedDataModel?.properties?.[key].ref), { recordId: 'load_more', label: 'Load More' }] : getRecordsName(key, selectedDataModel?.properties?.[key].ref)} 
                                                required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false} 
                                                InputProps={commonInputProps(key)}                                             
                                                onClick={(event) => {
                                                    if((event.target as HTMLElement)['localName'] === 'div' && selectedDataModel && selectedDataModel.properties && key !== isEditingField && formContext.getValues(`dataRecord.fields.${key}`))
                                                        referenceFieldRedirect(`dataRecord.fields.${key}`, selectedDataModel.properties[key].ref)
                                                }}
                                                onChange={(event) => {
                                                    if (event.recordId === 'load_more') {                                                 
                                                        handleLoadMore(selectedDataModel?.properties?.[key].ref, key);
                                                    }
                                                }}/>
                                            }</>}
                                        {(selectedDataModel.properties[key].type == 'string' || selectedDataModel.properties[key].type == 'number' || selectedDataModel.properties[key].type == 'decimal') &&
                                            <TextFieldElement type={selectedDataModel.properties[key].type} disabled={open ==='New' ? false : isEditingField !== key} fullWidth label={camelCaseToTitleCase(key)} name={`dataRecord.fields.${key}`} parseError={parseError} size="small" required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false} 
                                            InputProps={commonInputProps(key)}/>
                                        }
                                        {selectedDataModel.properties[key].type == 'date' &&
                                            <LocalizationProvider dateAdapter={AdapterDateFns} >
                                                <Grid container alignItems="center">
                                                    <Grid item xs={6}>
                                                        <DatePickerElement timezone="Asia/Kolkata" disabled={open === 'New' ? false : isEditingField !== key} label={camelCaseToTitleCase(key)} name={`dataRecord.fields.${key}`} parseError={parseError} required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false} />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        {open !== 'New' && 
                                                        (<>{isEditingField === key ? (
                                                                    <>
                                                                        <SaveIcon
                                                                            onClick={async () => {
                                                                                setIsEditingField('');
                                                                                handleSubmit(formContext.getValues());
                                                                            }}
                                                                            style={{ cursor: 'pointer',color: 'black' }}
                                                                        />&ensp;
                                                                        <CancelIcon onClick={() => {
                                                                            formContext.setValue(
                                                                                `dataRecord.fields.${key}`,
                                                                                originalFieldValuesRef.current[key]
                                                                            );
                                                                            setIsEditingField('');
                                                                        }}
                                                                        style={{ cursor: 'pointer',color: 'grey' }}/>&ensp;&ensp;
                                                                    </>
                                                                ) : (
                                                                <><EditIcon onClick={() => {
                                                                        originalFieldValuesRef.current[key] = formContext.getValues(
                                                                            `dataRecord.fields.${key}`
                                                                        );
                                                                        setIsEditingField(key);
                                                                    }}
                                                                    style={{ cursor: 'pointer' ,color: '#EAEAEA' }}/>&ensp;&ensp;</>
                                                            )}</>
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </LocalizationProvider>
                                        }
                                        {
                                            selectedDataModel.properties[key].type == 'boolean' &&
                                            <SelectElement fullWidth label={camelCaseToTitleCase(key)} disabled={open ==='New' ? false : isEditingField !== key} name={`dataRecord.fields.${key}`} parseError={parseError} size="small" options={[{ "id": true, "label": "Yes" }, { "id": false, "label": "No" }]} value={booleanValue} onChange={event => setBooleanDropdownValue(event)} required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false} 
                                            InputProps={commonInputProps(key)}/>
                                        }
                                        {
                                            selectedDataModel.properties[key].type == 'list' &&
                                            <SelectElement fullWidth label={camelCaseToTitleCase(key)} disabled={open ==='New' ? false : isEditingField !== key} name={`dataRecord.fields.${key}`} parseError={parseError} size="small" options={selectedDataModel.properties[key].list.map((item:string) => ({ id: item, label: item }))} required={selectedDataModel.properties[key].required ? selectedDataModel.properties[key].required : false} 
                                            InputProps={commonInputProps(key)}/>
                                        }
                                    </Grid >
                                    : <></>
                                }
                            </>
                        ))}
                        {
                            (open != 'List' && selectedDataModel != null) && (selectedDataModel.properties != null) && Object.keys(selectedDataModel.properties).map((key) => (
                                <>
                                    {(selectedDataModel.properties != null && selectedDataModel.properties[key].type == 'object' && !Object.values(selectedDataModel.properties[key].properties).every((prop: any) => prop.type === 'array'))
                                        ? <Grid item xs={12} sm={12} md={12}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant='h6'>{camelCaseToTitleCase(key)}</Typography>
                                                {key === 'Address' && <Button onClick={async () => addAddress()}>+ Add Address</Button>}
                                            </div>
                                            <Divider></Divider>
                                            <RecursiveFieldRendering fields={selectedDataModel.properties[key]} base={`dataRecord.fields.${key}`} isDisabled={open ? open : ''} baseKey={`${key}`}></RecursiveFieldRendering>
                                            <Divider></Divider>
                                        </Grid>
                                        : <></>
                                    }
                                </>
                            ))
                        }
                    </Grid >
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
                </React.Fragment >
            </Box >
        </FormContainer >
    )
}