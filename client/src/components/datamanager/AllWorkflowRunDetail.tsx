import React from 'react'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import MButton from '../common/Mbutton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ShowWorkflowInstances from '../dashboard/WorkflowInstance'

export interface AllWorkflowRunDetailProps {
    open: string | undefined
    setOpen: React.Dispatch<React.SetStateAction<string|undefined>>
    objectName: string
    recordId: string|undefined
}


export default function AllWorkflowRunDetail(props: AllWorkflowRunDetailProps) {
    const { open, setOpen, objectName , recordId} = props
    return (
        <>
            <AppBar
                position="static"
                color="inherit"
                sx={{ boxShadow: 'none', mb: 3 }}
            >
                <Toolbar sx={{ paddingLeft: '4px !important' }}>
                    <MButton
                        size="small"
                        variant="outlined"
                        onClick={() => { setOpen('List') }}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back
                    </MButton>
                    <Typography variant="h6" component="div" sx={{ paddingLeft: '20px', flexGrow: 1 }}>
                        {`${objectName}${' - ' + 'Workflows'}`}
                    </Typography>
                    {open!='workflows'&&<Button
                        size="small"
                        variant="outlined"
                        type="submit"
                        startIcon={open != 'Edit' ? <EditIcon /> : <SaveIcon />}
                    >
                        {open != 'Edit' ? 'Edit' : 'Save'}
                    </Button>}
                </Toolbar>
            </AppBar>
            <Box sx={{ width: '100%' }}>
                <ShowWorkflowInstances objectName={objectName} recordId={recordId}></ShowWorkflowInstances>
            </Box>
        </>
    )
}
