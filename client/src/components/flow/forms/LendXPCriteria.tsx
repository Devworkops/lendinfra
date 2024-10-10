import React, { useContext, useEffect } from 'react'
import { CriteriaContext } from './AddCriterias'
import { Button, Grid, Menu, MenuItem, Typography } from '@mui/material'
import { AutocompleteElement, SelectElement, TextFieldElement, useFieldArray, useFormContext } from 'react-hook-form-mui'
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

export const LendXPCriteria = (props: {
    dataModels: DataModel[],
    workflowId: string,
    isResource?: boolean,
    record?: string,
    fieldToWatch?: any,
    isAssignment?: boolean,
    type?: string,
}) => {
    const [parseError] = useFormHelper();
    const { control,watch, setValue, getValues  } = useFormContext();
    const { fields } = useFieldArray({
        control,
        name: 'inputValues'
      })
    const criteriaCtx = useContext(CriteriaContext);
    const [openResource, setOpenResource] = React.useState(false);
    const [resources, setResources] = React.useState<{ id: string, label: any, key: string, path: string, type: string }[]>([]);
    const [getResource, , ,] = useApi<IResource>();
    const { dataModels, workflowId, isResource, record, fieldToWatch, isAssignment, type } = props
    const { enqueueSnackbar } = useSnackbar();
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

    const onChangeHandler = (value: any, index: number) => {
        setValue(`inputValues.${index}.variable`, value);
    };

    const watchFieldArray = watch('inputValues')
    const controlledFields = fields.map((field: any, index: number) => {
        return {
          ...field,
          ...watchFieldArray[index]
        }
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
                    if (type === 'update') {
                        const dmProperties = response.data;
                        const newDmProperties = {};
                        for (const key in dmProperties) {
                            if (!(key.includes('TrustLoop') || key.includes('Consent') || key.includes('TransUnion'))) {
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

    return (
        <>
            {controlledFields && controlledFields?.map((field: any, idx: number) => (
                <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '10px 0 10px 2rem' }}>
                    <Typography variant="body1" sx={{ minWidth: '10rem', marginRight: '1rem' }}>
                        {field?.fieldName}
                    </Typography>
                    <AutocompleteElement
                        label='Select Resource'
                        required
                        name={`inputValues.${idx}.variable`}
                        textFieldProps={{
                            size: 'small',
                        }}
                        autocompleteProps={{
                            disablePortal: true,
                            groupBy: ((option) => option.label.split(".")[0]),
                            onChange: (_, value) => onChangeHandler(value, idx),
                            value: field.variable,
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
                </Grid>

            ))}
        </>
    )
}
