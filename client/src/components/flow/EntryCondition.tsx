import { useContext, useEffect, useState } from 'react'
import { EntryConditionContext } from './AddEntryConditions'
import { Button, Grid } from '@mui/material'
import { AutocompleteElement, SelectElement, TextFieldElement } from 'react-hook-form-mui'
import useFormHelper from '../../hooks/useFormHelper'
import DeleteIcon from '@mui/icons-material/Delete'
import { OperatorConstant } from '../../config/constants/OperatorConstant'
import { type DataModel } from '../../interfaces/IDataModel'
import useApi from '../../hooks/useApi'
import React from 'react'
import { useSnackbar } from 'notistack'

export const EntryCondition = (props: { index: number, selectedDataModel: DataModel | null }) => {
  const [parseError] = useFormHelper()
  const entryConditionCtx = useContext(EntryConditionContext)
  const [value, setValue] = useState< {id: string, label: any, key: string, path:string, type:string}>();
  const { index, selectedDataModel } = props
  const deleteHandler = () => { entryConditionCtx.remove(index) }
  const [getDataModelProperties, , ,] = useApi<{}>();
  const [dataModelProperties,setDataModelProperties] = React.useState(undefined)
  const { enqueueSnackbar } = useSnackbar();
  const getOperator = (objectType: string) => {
    if (objectType.toLowerCase() == 'list') { return OperatorConstant.list }
    if (objectType.toLowerCase() == 'boolean') { return OperatorConstant.boolean }
    if (objectType.toLowerCase() == 'object') { return OperatorConstant.object }
    if (objectType.toLowerCase() == 'array') { return OperatorConstant.array }
    if (objectType.toLowerCase()  == 'number') { return OperatorConstant.number }
    if (objectType.toLowerCase() == 'string') { return OperatorConstant.string }
    return []
  }
  const onChange = (event: any, value: any) => {
    if (value !== null ){
        setValue(value);
    }
}

  const getProperties=(element:any, properties:any, basePath?:string)=>{
    let attributes: {
        id: string, label: any, key: string, path:string, type:string
    }[] = [];
    if(properties){
      Object.keys(properties).map((item) => {
          if (properties[item].type == 'object') {
              attributes = [...attributes, ...getProperties(element, properties[item].properties, basePath != '' ? basePath + '.' + item : item)]
          }
          else {
              attributes.push({ id: element.id, label: basePath != '' ? basePath + '.' + item : item+' ('+ properties[item].type +')', key: element.name, path: basePath != '' ? `${basePath}.${item}`.split('.').slice(1).join('.') : item.split('.').slice(1).join('.'), type: properties[item].type })
          }
      })
  }
    return attributes
}
const getObjectAttributes = () => {
    let attributes: {
        id: string, label: any, key: string, path:string, type:string
    }[] = [];
    
    if ((selectedDataModel != null) && (selectedDataModel.properties != null) && dataModelProperties) {
            attributes=[...attributes, ...getProperties(selectedDataModel, dataModelProperties, '')]
    }
    return attributes
}

useEffect(() => {
      const response = getDataModelProperties(`api/dataModel/getProperties?dataModelName=` + selectedDataModel?.name).then((response) => {
          if (response.data) {
              setDataModelProperties(response.data)  
          }
          else {
              enqueueSnackbar(response.data.errors[0].message, {
                  variant: 'error'
              });
          }
      })
}, [])

    const getPropertyList = ( value: { id: string; label: any; key: string; path: string; type: string } ) => {
        const propertyDataModel = selectedDataModel?.properties;
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
            return listArray;
        }
    }

    const inputFieldRenderer = (value: { id: string; label: any; key: string; path: string; type: string } | undefined) => {
        switch (value?.type) {
            case 'list':
                return <SelectElement sx={{ maxWidth: '100px', minWidth: '10rem' }} required label={'Value'} name={`workflow.filterConditions.${index}.value`} parseError={parseError} size="small" 
                options={getPropertyList(value)?.map((item:string) => ({ id: item, label: item }))} 
                />

            default:
                return <TextFieldElement type={value?.type ? value.type: "text"} sx={{ paddingRight: '5px' }} required label={'Value'} name={`workflow.filterConditions.${index}.value`} parseError={parseError} size="small" />
        }
    }

    return (
        <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex', flexDirection: 'row', paddingTop: '10px', justifyContent: 'space-between' }}>
            <AutocompleteElement
                label='Variable'
                name={`workflow.filterConditions.${index}.variable`}
                options={getObjectAttributes()}
                textFieldProps={{
                  size: 'small'
                }}
                required
                autocompleteProps={{
                  onChange: (onChange),
                  value: value,
                  groupBy: ((option) => option.label.split(".")[0]),
              }}
            />   
            <SelectElement fullWidth options={value?.type ? getOperator(value.type): getOperator("String")} sx={{ paddingRight: '5px', maxWidth: '150px' }} required label={'Operator'} name={`workflow.filterConditions.${index}.operator`} parseError={parseError} size="small" />
            {inputFieldRenderer(value)}
            <Button startIcon={<DeleteIcon />} onClick={deleteHandler}></Button>
        </Grid>
  )
}
