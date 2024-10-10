import React, { useContext, useEffect } from 'react'
import FormDialog from '../common/FormDialog'
import { useFieldArray, useForm, UseFormReturn, useWatch } from 'react-hook-form'
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Grid } from '@mui/material'
import { SelectElement, TextFieldElement, useFormContext } from 'react-hook-form-mui'
import useFormHelper from '../../hooks/useFormHelper'
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import theme from '../../config/theme/theme'
import useApi from '../../hooks/useApi'
import { useSnackbar } from 'notistack'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { DataModel } from '../../interfaces/IDataModel'

export interface AddEditViewFieldDialogProps {
    selectedField: { field: ObjectType | undefined, mode: string }
    setSelectedField: React.Dispatch<React.SetStateAction<{ field: ObjectType | undefined, mode: string } | undefined>>
    handleSubmit: (oldState: ObjectType, newState: ObjectType, dataModel: DataModel) => Promise<void>
    dataModel: DataModel,
    uniqueFields: any, setUniqueFields: any
}

export interface ObjectType {
    key: string;
    type: string;
    required?: boolean;
    value?: ObjectType[];
    list?:string[];
    listValue?: string;
}

export default function AddEditViewField(props: AddEditViewFieldDialogProps) {

    const { selectedField, setSelectedField, handleSubmit, dataModel, uniqueFields, setUniqueFields } = props
    const [ReferenceTypes, setReferenceTypes] = React.useState<{ label: string, id: string }[]>([])
    const [ listItems, setListItems ] = React.useState<string[]>([]);
    const [ objectLists, setObjectLists ] = React.useState<Map<string, string[]>>(new Map());
    const { enqueueSnackbar } = useSnackbar()
    const [getReferenceType, ,] = useApi<{ label: string, id: string }>();
    const onClose = () => {
        setSelectedField(undefined)
    }
    const formContext = useForm<{ property: ObjectType }>({
        defaultValues: { property: selectedField.field }
    })

    const dmDetail = useWatch({
        control: formContext.control,
        name: 'property'
    })

    React.useEffect(() => {
        if(selectedField.field?.type === 'list' && selectedField.field.list && selectedField.field.list.length > 0) {
            setListItems(selectedField.field.list);
        } else {
            setListItems([]);
        }

        if(selectedField.field?.type === 'object') {
            selectedField.field.value?.map((item: ObjectType) => {
                if(item.type === 'list') {
                    let newList = objectLists;
                    newList.set(item.key, item.list ?? []);
                    setObjectLists(newList);
                }
            })
        }

        // get the reference type
        getReferenceType(`api/dataModel/reference`).then((response) => {
            if (response.data.errors) {
                enqueueSnackbar(response.data.errors[0].message, {
                    variant: 'error'
                })
            } else {
                setReferenceTypes(response.data.map((item: { id: any }) => {
                    return {
                        "label": item.id,
                        "id": item.id
                    }
                }))
            }
        });
        if (selectedField.field)
            formContext.setValue("property", selectedField.field)
    }, [selectedField])

    const handleSave = () => {
        const updatedDataModel: DataModel = {
            id: dataModel?.id,
            name: dataModel.name,
            prefix: dataModel.prefix,
            label: dataModel.label,
            description: dataModel.description,
            company: dataModel.company,
            createdBy: dataModel.createdBy,
            type: dataModel?.type,
            properties: dataModel.properties,
            required: dataModel.required,
            isActive: dataModel.isActive,
            primaryKeys: uniqueFields?.join(",")
        }

        if(selectedField.field?.type === 'list' || dmDetail.type === 'list')
            dmDetail.list = listItems;
        
        if(selectedField.field?.type === 'object' || dmDetail.type === 'object') {
            dmDetail.value?.map((field) => {
                field.list = objectLists.get(field.key);
            })
        }   
        
        if (selectedField.field)
            handleSubmit(selectedField.field, dmDetail, updatedDataModel);
    }

    const listItemDeleteHandler = (itemToDelete: string, key?: string) => {
        if(key){
            const list : string[] = objectLists?.get(key)?.filter(item=> item !== itemToDelete) ?? [];
            let newObjectLists = new Map(objectLists);
            newObjectLists.set(key, list);
            setObjectLists(newObjectLists)
        } else {
            const updatedList = listItems.filter((item:string) => item !== itemToDelete);
            setListItems(updatedList);    
        }
    }

    return <FormDialog isOpen={selectedField.mode != ''} onClose={onClose} data={formContext} showButtons={false}
        handleSubmit={handleSave} title={`${selectedField.mode} Field`} maxWidth='md'>
        <Box sx={{ width: '100%' }}>
            <React.Fragment>
                <AddEditViewFieldDetail objectLists={objectLists} setListItems={setListItems} setObjectLists={setObjectLists} dmDetail={dmDetail} listItemDeleteHandler={listItemDeleteHandler} open={selectedField.mode} base='' isExpanded={true} ReferenceTypes={ReferenceTypes} formContext={formContext} uniqueFields={uniqueFields} setUniqueFields={setUniqueFields}></AddEditViewFieldDetail>
                {listItems && listItems.length > 0 && <Box sx={{ p: 2 }}>
                    {listItems.map((item, index) => (
                        <Button 
                            onClick={() => listItemDeleteHandler(item)} 
                            disabled={selectedField.mode === 'View'}
                            sx={{margin: '5px'}} 
                            variant="outlined" 
                            color="secondary" 
                            key={index}>
                                {item}
                        </Button>
                    ))}
                </Box>}
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                        color="inherit"
                        onClick={onClose}
                        sx={{ mr: 1 }}
                    >
                        Cancel
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    {(selectedField.mode == 'Edit' || selectedField.mode == 'Add') &&
                        <Button type="submit">
                            Save
                        </Button>
                    }
                </Box>
            </React.Fragment>
        </Box>
    </FormDialog>
}

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
    '&:before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, .05)'
            : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(1),
}));


function AddEditViewFieldDetail(props: {
    objectLists: Map<string, string[]>, setObjectLists: React.Dispatch<React.SetStateAction<Map<string, string[]>>>, setListItems:React.Dispatch<React.SetStateAction<string[]>>, dmDetail: ObjectType, open: string, listItemDeleteHandler:(itemToDelete: string, key?: string) => void, base: string, isExpanded: boolean, ReferenceTypes: { label: string, id: string }[], formContext: UseFormReturn<{
        property: ObjectType;
    }, any>, uniqueFields: any, setUniqueFields: any
}) {


    const { open, dmDetail, objectLists ,setListItems ,setObjectLists, listItemDeleteHandler, base, isExpanded, ReferenceTypes, formContext, uniqueFields, setUniqueFields } = props
    const [expanded, setExpanded] = React.useState<boolean>(isExpanded);
    const [parseError] = useFormHelper()

    const { control } = formContext
    const { fields, append, remove } = useFieldArray({
        control,
        name: `property.value`
    })

    const addAttributeHandler = () => {
        append({
            key: '',
            type: ''
        });
        setExpanded(true)
    }
    const deleteHandler = (index: number, fieldKey: string) => { 
        // For deleting fields
        remove(index);

        // For deleting list items from list data type
        let newObjectLists = new Map(objectLists);
        newObjectLists.delete(fieldKey);
        setObjectLists(newObjectLists);
    }

    const getFieldType = () => {
        const objects: Array<{
            label: string
            id: string
        }> = []
        objects.push({ label: 'String', id: 'string' })
        objects.push({ label: 'Object', id: 'object' })
        objects.push({ label: 'Number', id: 'number' })
        objects.push({ label: 'Decimal', id: 'decimal' })
        objects.push({ label: 'Boolean', id: 'boolean' })
        objects.push({ label: 'Array', id: 'array' })
        objects.push({ label: 'Date', id: 'date' })
        objects.push({ label: 'List', id: 'list' })
        if (base == '')
            objects.push({ label: 'Reference', id: 'reference' })
        return objects
    }
    const getRequiredType = () => {
        const objects: Array<{
            label: string
            id: boolean
        }> = []
        objects.push({ label: 'True', id: true })
        objects.push({ label: 'False', id: false })
        return objects
    }

    const getBaseValue = (value: string) => {
        return value.slice(0, -1);
    }

    const getPropertyType = () => {
        return formContext.getValues('property.type')
    }

    const isPropertyRequired = () => {
        return formContext.getValues('property.required')
    }

    const updateUniqueField = (key: string) => {
        //remove
        if (uniqueFields?.includes(key)) {
            setUniqueFields(uniqueFields?.filter((item: string) => item != key))
        }
        //add
        else {
            setUniqueFields(uniqueFields?.concat(key))
        }
    }

    const addListHandler = (key: string, type?: string, index?: number) => {
        const newItem: string | undefined = formContext.getValues(`property.listValue`);
        if (newItem) {
            //@ts-ignore
            formContext.setValue(`property.${`value[${index}]`}.listValue`, '');
            
            // Referring to the parent field type as this has to be run in object fields only
            if(type === 'object') {
                const list : string[] = objectLists.get(key) ?? [];
                if (!list.includes(newItem)) {
                    let newLists = objectLists;
                    newLists.set(key, [...list, newItem]);
                    setObjectLists(newLists)
                }
            } else {
                setListItems(prev => [...prev, newItem]);
            }
        }
    };
    
    const objectFiledRenderer = (field: any, index: any, mode: string) => {
        // @ts-ignore
        const fieldType: string | undefined = formContext.getValues(`property.value[${index}].type`);
        // @ts-ignore
        const fieldKey: string = formContext.getValues(`property.value[${index}].key`);

        return (<Grid container spacing={2} columns={12} sx={{ paddingBottom: '20px' }} key={field.id}>
                <Grid item xs={3} sm={3} md={3}>
                    <TextFieldElement disabled={open == 'View'} fullWidth required label={'Field name'} name={`property.value[${index}].key`} parseError={parseError} size="small" />
                </Grid>
                <Grid item xs={3} sm={3} md={3}>
                    <SelectElement disabled={open == 'View'} fullWidth required label={'Type'} name={`property.${`value[${index}]`}.type`} parseError={parseError} size="small" options={getFieldType()} />
                </Grid>
                <Grid item xs={3} sm={3} md={3}>
                    <SelectElement disabled={open == 'View'} fullWidth label={'Mark required'} name={`property.${`value[${index}]`}.required`} parseError={parseError} size="small" options={getRequiredType()} />
                </Grid>
                {fieldType === 'list' && open !== 'View' && (
                <Grid item xs={3} sm={3} md={3}>
                    <TextFieldElement fullWidth label={'List Value'} name={`property.${getBaseValue(base)}.listValue`} parseError={parseError} size="small" />
                    <Button onClick={() => addListHandler(fieldKey, 'object', index)} size={'small'}>Add Item</Button>
                </Grid>
                )}
                {fieldType === 'list' && <Box sx={{ p: 2 }}>
                    {fieldKey && objectLists && objectLists.get(fieldKey) && objectLists.get(fieldKey)?.map((item, index) => (
                        <Button 
                            onClick={() => listItemDeleteHandler(item, fieldKey)} 
                            disabled={mode === 'View'}
                            sx={{margin: '5px'}} 
                            variant="outlined" 
                            color="secondary" 
                            key={index}>
                                {item}
                        </Button>
                    ))}
                </Box>}
                {open != 'View' && <Button sx={{ maxWidth: '10px' }} startIcon={<DeleteIcon />} onClick={() => deleteHandler(index, fieldKey)}></Button>}
            </Grid>);
    }

    return (

        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={dmDetail.type == 'object' ? { border: `1px solid ${theme.palette.divider}` } : {}}>
            {dmDetail.type == 'object' ?
                <>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Grid container spacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ paddingBottom: '20px', paddingTop: '20px' }} columns={12}>
                            <Grid item xs={5} sm={5} md={5} key={'fieldname'}>
                                <TextFieldElement disabled={open == 'View'} fullWidth required label={'Field name'} name={`property.${getBaseValue(base)}.key`} parseError={parseError} size="small" />
                            </Grid>
                            <Grid item xs={4} sm={4} md={4} key={'type'}>
                                <SelectElement disabled={open == 'View'} fullWidth required label={'Type'} name={`property.${getBaseValue(base)}.type`} parseError={parseError} size="small" options={getFieldType()} />
                            </Grid>
                            <Grid item xs={3} sm={3} md={3} key={'unique'}>
                                {isPropertyRequired() && <FormGroup>
                                    <FormControlLabel label="Unique" control={<Checkbox disabled={open == 'View'} checked={uniqueFields?.includes(dmDetail.key)} onChange={(event) => updateUniqueField(dmDetail.key)} />} />
                                </FormGroup>}
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    {fields.map((field, index) => objectFiledRenderer(field, index, open))}
                    {open != 'View' && <Button onClick={addAttributeHandler} size={'small'} startIcon={<AddIcon />}> Add attribute</Button>}
                </>
                :
                <Grid container spacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ paddingBottom: '20px', paddingTop: '20px' }} columns={12}>
                    <Grid item xs={3} sm={3} md={3}>
                        <TextFieldElement disabled={open == 'View'} fullWidth required label={'Field name'} name={`property.${getBaseValue(base)}.key`} parseError={parseError} size="small" />
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                        <SelectElement disabled={open == 'View'} fullWidth required label={'Type'} name={`property.${getBaseValue(base)}.type`} parseError={parseError} size="small" options={getFieldType()} />
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                        <SelectElement disabled={open == 'View'} fullWidth label={'Mark required'} name={`property.${getBaseValue(base)}.required`} parseError={parseError} size="small" options={getRequiredType()} />
                    </Grid>
                    {(open === 'Edit' || open === 'Add') && dmDetail?.type === 'list' && <Grid item xs={3} sm={3} md={3}>
                        <TextFieldElement fullWidth label={'List Value'} name={`property.${getBaseValue(base)}.listValue`} parseError={parseError} size="small" />
                        <Button onClick={() => addListHandler('InvalidKey')} size={'small'}>Add Item</Button>
                    </Grid>}
                    {isPropertyRequired() && <Grid item xs={3} sm={3} md={3} key={'unique'}>
                        <FormGroup>
                            <FormControlLabel label="Unique" control={<Checkbox disabled={open == 'View'} checked={uniqueFields?.includes(dmDetail.key)} onChange={() => updateUniqueField(dmDetail.key)} />} />
                        </FormGroup>
                    </Grid>}
                    {base == '' && getPropertyType() == 'reference' && < Grid item xs={12} sm={6} md={12} key={'reference'}>
                        <SelectElement disabled={open == 'View'} fullWidth required label={'Reference'} name={`property.${getBaseValue(base)}.ref`} parseError={parseError} size="small" options={ReferenceTypes} />
                    </Grid>}
                </Grid>
            }
        </Accordion >
    )
}