import React, { useContext, useEffect } from 'react'
import { CriteriaContext } from './AddCriterias'
import { Button, Grid, Menu, MenuItem } from '@mui/material'
import { AutocompleteElement, SelectElement, TextFieldElement } from 'react-hook-form-mui'
import useFormHelper from '../../../hooks/useFormHelper'
import DeleteIcon from '@mui/icons-material/Delete'
import { type DataModel } from '../../../interfaces/IDataModel'
import { camelCaseToTitleCase } from '../../../utils/textFromatter'
import useApi from '../../../hooks/useApi'
import { type IResource } from '../../../interfaces/IResource'
import { useSnackbar } from 'notistack'
import AddNewResource from './ResourceForm'
import { Workflow } from '../../../interfaces/IWorkflow'
import { OperatorConstant } from '../../../config/constants/OperatorConstant'

export const Criteria = (props: {
    index: number,
    dataModels: DataModel[],
    workflowId: string,
    isResource?: boolean,
    record?: string,
    fieldToWatch?: any,
    isAssignment?: boolean,
    field?: any,
    type?:string,
}) => {
    const [parseError] = useFormHelper();
    const criteriaCtx = useContext(CriteriaContext);
    const [openResource, setOpenResource] = React.useState(false);
    const [resources, setResources] = React.useState<{ id: string, label: any, key: string, path: string, type: string }[]>([]);
    const [getResource, , ,] = useApi<IResource>();
    const { index, dataModels, workflowId, isResource, record, fieldToWatch, isAssignment, field, type } = props
    const { enqueueSnackbar } = useSnackbar();
    const deleteHandler = () => criteriaCtx.remove(index);
    const [value, setValue] = React.useState<{ id: string, label: any, key: string, path: string, type: string }>();
    const [getWorkflow, , ,] = useApi<Workflow>();
    const [getDataModelProperties, , ,] = useApi<{}>();
    const [workflowObject, setWorkflowObject] = React.useState("")
    const [dataModelProperties, setDataModelProperties] = React.useState({})

    const getProperties = (element: any, properties: any, basePath?: string) => {
        let attributes: {
            id: string, label: any, key: string, path: string, type: string
        }[] = [];
        if (properties) {
            Object.keys(properties).map((item) => {
                if (properties[item].type == 'object') {
                    attributes = [...attributes, ...getProperties(element, properties[item].properties, basePath != '' ? basePath + '.' + item : item)]
                }
                else {
                    attributes.push({ id: element.id, label: basePath != '' ? basePath + '.' + item : item + ' (' + properties[item].type + ')', key: element.name, path: basePath != '' ? `${basePath}.${item}`.split('.').slice(1).join('.') : item.split('.').slice(1).join('.'), type: properties[item].type })
                }
            })
        }
        return attributes
    }
    const getObjectAttributes = (workflowObject: string | undefined) => {
        let attributes: {
            id: string, label: any, key: string, path: string, type: string
        }[] = [];
        const dataModel: any[] = dataModels.filter(function (item) {
            return item.name === workflowObject || item.id === workflowObject;
        });
        dataModel.forEach(element => {
            if (element.properties && dataModelProperties) {
                attributes = [...attributes, ...getProperties(element, dataModelProperties, '')]
            }
        });
        return attributes
    }

    const onChange = (event: any, value: any) => {
        if (value !== null && value.label === '+ New Resource') {
            setOpenResource(true)
        }
        else {
            setValue(value);
        }

    }

    const closeResource = () => {
        setOpenResource(false)
    }

    useEffect(() => {
        if (field)
            setValue(field.variable)
    })

    useEffect(() => {
        if (record) {
            setWorkflowObject(record)
        }
        else {
            const response = getWorkflow(`api/workflow/` + workflowId).then((response) => {
                if (response.data.errors) {
                    enqueueSnackbar(response.data.errors[0].message, {
                        variant: 'error'
                    });
                }
                else {
                    setWorkflowObject(response.data.object)
                }
            })
        }
    }, [record])

    useEffect(() => {
        const response = getResource(`api/workflow/resource/all/` + workflowId).then((response) => {
            if (response.data.errors) {
                enqueueSnackbar(response.data.errors[0].message, {
                    variant: 'error'
                });
            }
            else {
                let results = response.data.map((response: { id: string, apiName: any; resourceType: string, dataType: string }) => ({ "id": response.id, "label": camelCaseToTitleCase(response.apiName), "key": response.resourceType, "path": response.apiName, "type": response.dataType }))
                setResources([{ "id": "New Resource", "label": "+ New Resource", "key": "", "path": "newResource", "type": "" }].concat(results));
            }
        })
    }, [openResource])

    useEffect(() => {
        if (workflowObject) {
            const response = getDataModelProperties(`api/dataModel/getProperties?dataModelName=` + workflowObject).then((response) => {
                if (response.data) {
                    if(type === 'update') {
                        const dmProperties = response.data;
                        const newDmProperties = {};
                        for(const key in dmProperties) {
                            if(!(key.includes('TrustLoop') || key.includes('Consent') ||key.includes('TransUnion'))) {
                                //@ts-ignore
                                newDmProperties[`${key}`] = dmProperties[key];
                            }
                        }
                        setDataModelProperties(newDmProperties)    
                    } else {
                        setDataModelProperties(response.data);
                    }
                }
                else {
                    enqueueSnackbar(response.data.errors[0].message, {
                        variant: 'error'
                    });
                }
            })
        }
    }, [workflowObject])

    const getOperator = (objectType: string) => {
        const stringList = ['string', 'text', 'record', 'picklist', 'mspicklist', 'record']
        const numberList = ['number', 'date', 'currency', 'datetime']
        objectType = objectType.toLowerCase()
        if (objectType.toLowerCase() == 'object')
            return OperatorConstant.object;
        if (objectType.toLowerCase() == 'array')
            return OperatorConstant.array;
        if (objectType.toLowerCase() == 'list')
            return OperatorConstant.list;
        if (objectType.toLowerCase() == 'boolean')
            return OperatorConstant.boolean;
        if (numberList.indexOf(objectType.toLowerCase()) != -1)
            return OperatorConstant.number;
        if (stringList.indexOf(objectType.toLowerCase()) != -1)
            return OperatorConstant.string;
        return [];
    }

    const getPropertyList = ( value: { id: string; label: any; key: string; path: string; type: string } ) => {
        const dataModel = dataModels.find(dataModel => dataModel.name === value.label.split('.')[0]);
        const propertyDataModel = dataModel?.properties;
        if(propertyDataModel) {
            const pathArray = value.path.split('.');
            const getListArray: (property: {[key: string]: any, type?:string, ref?:string, required?:boolean}, index: number, pathArray: string[]) => string[] = (property: {[key: string]: any, type?:string, ref?:string, required?:boolean}, index: number, pathArray: string[]) => {
                if(property.hasOwnProperty(pathArray[index])) {
                    if(property[pathArray[index]].type === 'object') {
                        return getListArray(property[pathArray[index]].properties, index + 1, pathArray);
                    } else if (property[pathArray[index]].type === 'list' ) {
                        const listArray: string[] = property[pathArray[index]].list;
                        return listArray;
                    }
                }
                return [];
            } 

            const listArray: string[] = getListArray(propertyDataModel, 0, pathArray);
            return listArray
        }   
    }

    return (
        <>
            <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex', flexDirection: 'row', marginTop: '10px', marginBottom: '10px', justifyContent: 'flex-start' }}>
                <AutocompleteElement
                    label='Select Resource'
                    required
                    name={(fieldToWatch ? `${fieldToWatch}` : `inputValues`) + `.${index}.variable`}
                    textFieldProps={{
                        size: 'small',
                    }}
                    autocompleteProps={{
                        disablePortal: true,
                        groupBy: ((option) => option.label.split(".")[0]),
                        onChange: (onChange),
                        value: value,
                        style: {
                            maxWidth: '30rem',
                        },
                        renderOption: (props, option) => (
                            <MenuItem {...props} style={{ lineHeight: '1rem', fontSize: '12px' }}>
                                {option.label}
                            </MenuItem>
                        ),
                        renderGroup: (params) => (
                            <div>
                                <MenuItem {...params} style={{ lineHeight: '1rem', color: '#637381', fontWeight: 600, fontSize: '0.875rem', padding: '8px 16px' }}>
                                    {params.group}
                                </MenuItem>
                                {params.children}
                            </div>
                        ),
                    }}
                    options={(isResource === true ?
                        [...resources, ...getObjectAttributes(workflowObject)] :
                        getObjectAttributes(workflowObject)).map(option => option)}
                />
                {isAssignment ? <SelectElement
                    fullWidth
                    options={[{ label: 'Equal', id: 'equal' }]}
                    sx={{ paddingRight: '5px', maxWidth: '100px', minWidth: '10rem' }}
                    required
                    label={'Operator'}
                    name={(fieldToWatch ? `${fieldToWatch}` : `inputValues`) + `.${index}.operator`}
                    parseError={parseError}
                    size="small"
                />
                    : <SelectElement
                        fullWidth
                        options={value?.type ? getOperator(value.type) : getOperator("String")}
                        sx={{ paddingRight: '5px', maxWidth: '100px', minWidth: '10rem' }}
                        required
                        label={'Operator'}
                        name={(fieldToWatch ? `${fieldToWatch}` : `inputValues`) + `.${index}.operator`}
                        parseError={parseError}
                        size="small"
                    />}
                {
                    value?.type === 'list' 
                    ? <SelectElement sx={{ maxWidth: '100px', minWidth: '10rem' }} required label={'Value'} name={(fieldToWatch ? `${fieldToWatch}` : `inputValues`) + `.${index}.value`} parseError={parseError} size="small" 
                    options={getPropertyList(value)?.map((item:string) => ({ id: item, label: item }))} 
                    />
                    : <TextFieldElement type={value?.type ? value.type : "text"} sx={{ maxWidth: '100px', minWidth: '10rem' }} required label={'Value'} name={(fieldToWatch ? `${fieldToWatch}` : `inputValues`) + `.${index}.value`} parseError={parseError} size="small" />
                }
                {type === 'update' &&  <TextFieldElement type="text" sx={{ maxWidth: '100px', minWidth: '10rem' }}  label={'Reason'} name={(fieldToWatch ? `${fieldToWatch}` : `inputValues`) + `.${index}.reason`} parseError={parseError} size="small" />  }
                <Button sx={{ maxWidth: '10px' }} startIcon={<DeleteIcon />} onClick={deleteHandler}></Button>
            </Grid>
            {openResource && <AddNewResource workflowId={workflowId} openResource={openResource} closeResource={closeResource} ></AddNewResource>}
        </>
    )
}
