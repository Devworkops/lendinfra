import React, { useEffect, useState } from 'react'
import { Box, Button, Checkbox, Dialog, DialogTitle, FormControlLabel, FormGroup, Grid, IconButton, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import useApi from '../../hooks/useApi'
import { useSnackbar } from 'notistack'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { type DataModel } from '../../interfaces/IDataModel'
import { Delete, DragIndicator, Edit, Visibility } from '@mui/icons-material'
import AddEditViewField from './AddEditViewField'

export interface ViewEditDataModelDialogProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    dataModel: DataModel
}

export interface ObjectType {
    key: string;
    type: string;
    required?: boolean;
    ref?: string;
    value?: ObjectType[];
    list?: string[];
}

const defaultObjectType = {
    key: '',
    type: '',
    required: false,
    ref: '',
    value: []
}

export default function ViewEditDataModel(props: ViewEditDataModelDialogProps) {
    const { open, setOpen } = props
    const [selectedField, setSelectedField] = useState<{ field: ObjectType | undefined, mode: string }>();
    const [dmProperties, setDmProperties] = useState<ObjectType[]>([]);
    const [, , updateDataModel,] = useApi<DataModel>()
    const { enqueueSnackbar } = useSnackbar()
    const { dataModel } = props;
    const [modalOpen, setModalOpen] = React.useState(false)
    const [deleteFields, setDeleteFields] = useState<{ item: ObjectType | undefined, mode: string }>()
    const [uniqueFields, setUniqueFields] = React.useState(dataModel.primaryKeys?.split(","))
    const [ draggedField, setDraggedField ] = useState<ObjectType | null>(null);
    const [ dragged, setDragged] = useState<boolean>(false);
    const onClose = () => {
        setDmProperties([])
        setOpen(false)
    }

    const handleModalOpen = () => {
        setModalOpen(true)
    }

    const handleModalClose = () => {
        setModalOpen(false)
    }


    const objectToProperties = (params: { [key: string]: any, type?: string, ref?: string, required?: boolean }) => {
        let properties: ObjectType[] = []
        if (params != undefined) {
            Object.entries(params).map(([key, value], index) => {
                if (value.type == 'object') {
                    let recursiveProp = objectToProperties(value.properties)
                    properties.push({ key, type: value.type, value: recursiveProp, required: value.required })
                }
                else if (value.type == 'array') {
                    let recursiveProp = objectToProperties(value.properties)
                    properties.push({ key, type: value.type, value: recursiveProp, required: value.required })
                }
                else if (value.type == 'reference') {
                    properties.push({ key, type: value.type, ref: value.ref, required: value.required })
                }
                else if (value.type === 'list') {
                    properties.push({ key, type: value.type, list: value.list, required: value.required })
                }
                else {
                    properties.push({ key, type: value.type, required: value.required })
                }
            })
        }
        return properties
    }


    useEffect(() => {
        if (open) {
            if (dataModel && dataModel.properties) {
                setDmProperties(objectToProperties(dataModel.properties))
            }
        }
    }, [open])

    function transformProperty(property: ObjectType, oldState: any, newState: any) {
        const newKey = property.key === oldState?.key ? newState.key : property.key;
        if (property.value != undefined && property.value?.length > 0) {
            // Recursively transform the 'value' attribute
            const newValue = {
                type: property.key === oldState?.key ? newState.type : property.type,
                required: property.key === oldState?.key ? newState.required : property.required,
                ref: property.key === oldState?.key ? newState.ref : property.ref,
                list: property.key === oldState?.key ? newState.list: property.list,
                properties: {}
            };
            if (oldState?.value?.length > 0 && newState.value?.length > 0) {
                newValue.properties = property.value.reduce((result, property, index) => {
                    return {
                        ...result, ...transformProperty(property,
                            oldState?.value.find((item: { key: string }) => item.key == property.key),
                            newState?.value.find((item: { key: string }) => item.key == property.key) ?
                                newState?.value.find((item: { key: string }) => item.key == property.key) : newState.value[index]
                        )
                    };
                }, {});
            }
            else {
                newValue.properties = property.value.reduce((result, property) => {
                    return { ...result, ...transformProperty(property, oldState, newState) };
                }, {});
            }
            return { [newKey]: newValue };
        }
        else {
            const newValue = {
                type: property.key === oldState?.key ? newState.type : property.type,
                required: property.key === oldState?.key ? newState.required : property.required,
                list: property.key === oldState?.key ? newState.list: property.list,
                ref: property.key === oldState?.key ? newState.ref : property.ref
            };
            return { [newKey]: newValue };
        }
    }

    const handleSubmit = async (oldState: ObjectType, newState: ObjectType, updatedDataModel: DataModel) => {
        let result
        // convert properties to object
        if (dmProperties) {
            // deleting property
            let newProperties = dmProperties
            if (newState.key == '') {
                newProperties = dmProperties.filter((item) => {
                    return item.key != oldState?.key
                })
            }
            //adding property
            else if (oldState?.key == '' || !oldState?.key) {
                newProperties = [...newProperties, newState]
            }

            if (newState.key === oldState?.key) {
                dmProperties.map((item, index) => {
                    if (item.key === newState.key) {
                        newProperties[index].value = newState.value;
                        if(newState.key === 'list') {
                            newProperties[index].list = newState.list;
                        }
                    }
                })
            }

            // converting
            let objectProperties: { [key: string]: any, type?: any } =
                newProperties.reduce((result, property) => {
                    return { ...result, ...transformProperty(property, oldState, newState) };
                }, {});

            const dmToSaveUpdate = {
                id: updatedDataModel?.id,
                name: updatedDataModel.name,
                prefix: updatedDataModel.prefix,
                label: updatedDataModel.label,
                description: updatedDataModel.description,
                company: updatedDataModel.company,
                createdBy: updatedDataModel.createdBy,
                type: updatedDataModel?.type,
                properties: objectProperties,
                required: updatedDataModel.required,
                isActive: updatedDataModel.isActive,
                primaryKeys: updatedDataModel.primaryKeys
            }

            result = await updateDataModel(`api/datamodel/${dataModel.id}`, dmToSaveUpdate)

            if (result && result.data.errors) {
                enqueueSnackbar(result.data.errors[0].message, {
                    variant: 'error'
                })
                setSelectedField({ field: undefined, mode: '' });
            } else {
                enqueueSnackbar('Data Model updated Successfully', {
                    variant: 'success'
                })
                if (oldState?.key == '') {
                    newProperties = newProperties.filter((item) => {
                        return item.key != oldState?.key
                    })
                    setDmProperties([...newProperties])
                }
                else if (newState.key == '') {
                    setDmProperties(newProperties)
                }
                else {
                    setDmProperties(newProperties.map(u => u.key == oldState?.key ? newState : u))
                }
                setSelectedField({ field: undefined, mode: '' });
            }
        }
    }

    const handleFieldChange = async (item: ObjectType, mode: string) => {
        if (mode == 'Delete') {
            handleModalOpen()
            setDeleteFields({ item, mode: 'Delete' })
        }
        else {
            setSelectedField({ field: item, mode: mode });
        }
    }

    const handleDragStart = (field: ObjectType) => {
        setDraggedField(field);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        setDragged(true);
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetField: ObjectType) => {
        e.preventDefault();
        if (draggedField) {
            setDmProperties((prevProperties) => {
                const newProperties = [...prevProperties];
                const draggedIndex = newProperties.findIndex(field => field.key === draggedField.key);
                const targetIndex = newProperties.findIndex(field => field.key === targetField.key);
    
                if (draggedIndex !== -1 && targetIndex !== -1) {
                    [newProperties[draggedIndex], newProperties[targetIndex]] = [newProperties[targetIndex], newProperties[draggedIndex]];
                }
                return newProperties;
            });
            setDraggedField(null);
        }
    };

    const handleDragChange = async () => {
        const properties = dmProperties.reduce((result, property) => {
            return { ...result, ...transformProperty(property, property, property) };
        } , {})
        const result = await updateDataModel(`api/datamodel/${dataModel.id}`, { ...dataModel, properties: properties })

        if (result && result.data.errors) {
            enqueueSnackbar(result.data.errors[0].message, {
                variant: 'error'
            })
        } else {
            enqueueSnackbar('Data Model order updated Successfully', {
                variant: 'success'
            })
        }
        setOpen(false);
        setDragged(false);
    }
    
    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth={'md'} >
                <DialogTitle sx={{ textAlign: 'center' }}>{'View Data Model'}</DialogTitle>
                <Box sx={{ width: '100%', paddingLeft: '20px' }}>
                    <Grid container spacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ paddingBottom: '20px', paddingTop: '20px' }} columns={12}>
                        {dmProperties.map((item, index) => (
                            <Grid container item xs={12} sm={12} md={12} key={index} draggable onDragStart={() => handleDragStart(item)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, item)}
                                style={{ border: draggedField === item ? '1px dashed black' : 'none' }}>
                                <Grid item xs={3} sm={3} md={3}>
                                    <TextField disabled fullWidth required label="Field name" value={item.key} size="small" />
                                </Grid>
                                <Grid item xs={3} sm={3} md={3}>
                                    <TextField disabled fullWidth required label="Type" value={item.type} size="small" />
                                </Grid>
                                <Grid item xs={2} sm={2} md={2}>
                                    <Select fullWidth disabled label="Required" size="small" value={item.required ? item.required : false}>
                                        <MenuItem value={'true'}>true</MenuItem>
                                        <MenuItem value={'false'}>false</MenuItem>
                                    </Select>
                                </Grid>
                                <Grid item xs={1} sm={1} md={1}>
                                    <FormGroup>
                                        <FormControlLabel label="Unique" control={<Checkbox disabled checked={uniqueFields?.includes(item.key)} />} />
                                    </FormGroup>
                                </Grid>
                                <Grid item xs={3} sm={3} md={3}>
                                    <IconButton onClick={() => handleFieldChange(item, 'Edit')}><Edit /></IconButton>
                                    {!(item.key === 'FirstName' || item.key === 'LastName') && <IconButton onClick={() => handleFieldChange(item, 'Delete')}><Delete /></IconButton>}
                                    {item.type == 'object' && <IconButton onClick={() => handleFieldChange(item, 'View')}><Visibility /></IconButton>}
                                    {item.type === 'list' && <IconButton onClick={() => handleFieldChange(item, 'View')}><Visibility /></IconButton>}
                                    <IconButton><DragIndicator /></IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Grid item xs={6} sm={6} md={6}>
                            <Button variant='contained' onClick={() => handleFieldChange({ key: '', type: '' }, 'Add')}>
                                Add new field
                            </Button>
                        </Grid>
                    </Grid>
                    {dragged && <Button variant='contained' onClick={() => handleDragChange()}>Save</Button>}
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                            <Button
                                color="inherit"
                                onClick={onClose}
                                sx={{ mr: 1 }}
                            >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Dialog>
            {modalOpen && <ConfirmDeleteModal
                modalOpen={modalOpen}
                handleClose={handleModalClose}
                onSubmit={() => {
                    if (deleteFields && deleteFields.item) {
                        handleSubmit(deleteFields.item, { key: '', type: '' }, dataModel)
                    }
                }}
            />}
            {selectedField && <AddEditViewField dataModel={dataModel} selectedField={selectedField} setSelectedField={setSelectedField} handleSubmit={handleSubmit} uniqueFields={uniqueFields} setUniqueFields={setUniqueFields} /> }
        </>
    )
}
