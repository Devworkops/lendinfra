import * as React from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { Divider, Fade, ListItemIcon, ListSubheader, Paper, Popper, Typography } from '@mui/material'
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'
import DensitySmallIcon from '@mui/icons-material/DensitySmall'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import LoopIcon from '@mui/icons-material/Loop'
import FindInPageIcon from '@mui/icons-material/FindInPage';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EditNoteIcon from '@mui/icons-material/EditNote';
import NoteIcon from '@mui/icons-material/NoteAdd';
import AccountIcon from '@mui/icons-material/AccountBalanceSharp';
import AddNewAssignment from './forms/AssignmentForm'
import { type EdgeProps } from 'reactflow'
import AddNewDecision from './forms/DecisionForm'
import AddNewLoop from './forms/LoopForm'
import AddNewAction from './forms/ActionForm'
import { type Workflowstep, NodeType } from '../../interfaces/IWorkflowstep'
import useApi from '../../hooks/useApi'
import { type DataModel } from '../../interfaces/IDataModel'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Delete } from '@mui/icons-material'
import AddCreateRecord from './forms/CreateRecordForm'
import AddUpdateRecord from './forms/UpdateRecordForm'
import AddGetRecord from './forms/GetRecordForm'
import AddDeleteRecord from './forms/DeleteRecordForm'
import PendingIcon from '@mui/icons-material/Pending';
import AddNewWait from './forms/WaitForm'
import AddNote from './forms/NoteForm'
import LendXPForm from './forms/LendXPForm'

export interface SimpleDialogProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  anchorEl: any
  edgeProps: EdgeProps
}

export default function AddElement (props: SimpleDialogProps) {
  const { edgeProps, open, setOpen, anchorEl } = props

  const assignmentFormRef = React.useRef<any>()
  const decisionFormRef = React.useRef<any>()
  const loopFormRef = React.useRef<any>()
  const actionFormRef = React.useRef<any>()
  const createRecordFormRef = React.useRef<any>()
  const getRecordFormRef = React.useRef<any>()
  const updateRecordFormRef = React.useRef<any>()
  const addNoteFormRef = React.useRef<any>()
  const addLendXPFormRef = React.useRef<any>()
  const deleteRecordFormRef = React.useRef<any>()
  const waitFormRef = React.useRef<any>()
  const { enqueueSnackbar } = useSnackbar()

  const onCreateNewNode = (nodeType: string, data: Workflowstep, source?: string) => {
    edgeProps.data.onChange(nodeType, data, edgeProps)
    //   edgeProps.data.onChange(nodeType, data, edgeProps)
      setOpen(false)
  }

  const [getDataModels] = useApi<DataModel[]>()

  const [DataModels, setDataModels] = useState<DataModel[]>([])
  const { auth } = useAuth()

  const updateData = async () => {
    const DataModelBaseUrl = `api/DataModel/all/${auth?.companyId}`

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

  useEffect(() => {
    updateData()
  }, [])

  return (
        <Popper placement="auto-end"
            disablePortal={false}
            modifiers={[
              {
                name: 'flip',
                enabled: true,
                options: {
                  altBoundary: true,
                  rootBoundary: 'document',
                  padding: 8
                }
              },
              {
                name: 'preventOverflow',
                enabled: true,
                options: {
                  altAxis: true,
                  altBoundary: true,
                  tether: true,
                  rootBoundary: 'document',
                  padding: 8
                }
              },
              {
                name: 'arrow',
                enabled: false
              }
            ]} open={open} anchorEl={anchorEl} transition >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                    <Paper sx={{ minWidth: '200px' }}>
                        <Typography sx={{ p: 2, justifyContent: 'center', display: 'flex' }}>Add Element</Typography>
                        <Divider></Divider>
                        <List
                            sx={{ width: '100%', bgcolor: 'background.paper' }}
                            aria-labelledby="nested-list-subheader"
                            subheader={
                                <ListSubheader component="div" id="nested-list-subheader">
                                    Logic
                                </ListSubheader>
                            }
                        >
                            {/* Will implement assignment node based on requirement */}
                            {/* <ListItemButton onClick={() => assignmentFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <DensitySmallIcon />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.assignment} />
                            </ListItemButton>
                            <AddNewAssignment workflowId={edgeProps.data.workflowId} ref={assignmentFormRef} open={false} onCreateAssignmentNode={onCreateNewNode} source={edgeProps.source} dataModels={DataModels}/> */}
                            <ListItemButton onClick={() => decisionFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <AccountTreeIcon />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.decision} />
                            </ListItemButton>
                            <AddNewDecision workflowId={edgeProps.data.workflowId} ref={decisionFormRef} open={false} onCreateDecisionNode={onCreateNewNode} source={edgeProps.source} dataModels={DataModels}/>
                            {/* Will implement loop node based on requirement */}
                            {/* <ListItemButton onClick={() => loopFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <LoopIcon />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.loop} />
                            </ListItemButton>
                            <AddNewLoop workflowId={edgeProps.data.workflowId} ref={loopFormRef} open={false} onCreateLoopNode={onCreateNewNode} source={edgeProps.source}/> */}
                        </List>
                        <Divider></Divider>
                        <List
                            sx={{ width: '100%', bgcolor: 'background.paper' }}
                            component="nav"
                            aria-labelledby="nested-list-subheader"
                            subheader={
                                <ListSubheader component="div" id="nested-list-subheader">
                                    Interaction
                                </ListSubheader>
                            }
                        >
                            <ListItemButton onClick={() => actionFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <OfflineBoltIcon />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.action} />
                            </ListItemButton>
                            <AddNewAction workflowId={edgeProps.data.workflowId} ref={actionFormRef} open={false} onCreateActionNode={onCreateNewNode} source={edgeProps.source}/>

                            <ListItemButton onClick={() => addLendXPFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <AccountIcon/>
                                </ListItemIcon>
                                <ListItemText primary={NodeType.LendXP} />
                            </ListItemButton>
                            <LendXPForm workflowId={edgeProps.data.workflowId} ref={addLendXPFormRef} open={false}  onCreateLendXPNode={onCreateNewNode} source={edgeProps.source} dataModels={DataModels}/>

                            <ListItemButton onClick={() => waitFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <PendingIcon />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.wait} />
                            </ListItemButton>
                            <AddNewWait workflowId={edgeProps.data.workflowId} ref={waitFormRef} open={false} onCreateWaitNode={onCreateNewNode} source={edgeProps.source}/>
                        </List>
                        <Divider></Divider>
                        <List
                            sx={{ width: '100%', bgcolor: 'background.paper' }}
                            aria-labelledby="nested-list-subheader"
                            subheader={
                                <ListSubheader component="div" id="nested-list-subheader">
                                    Data
                                </ListSubheader>
                            }
                        >
                            {/* Will implement create node based on requirement */}
                            {/* <ListItemButton onClick={() => createRecordFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <NoteAddIcon />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.createRecord} />
                            </ListItemButton>
                            <AddCreateRecord workflowId={edgeProps.data.workflowId} ref={createRecordFormRef} open={false} onCreateRecordNode={onCreateNewNode} source={edgeProps.source} dataModels={DataModels}/> 
                            <ListItemButton onClick={() => getRecordFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <FindInPageIcon />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.getRecord} />
                            </ListItemButton>
                            <AddGetRecord workflowId={edgeProps.data.workflowId} ref={getRecordFormRef} open={false} onGetRecordNode={onCreateNewNode} source={edgeProps.source} dataModels={DataModels}/> */}
                            <ListItemButton onClick={() => updateRecordFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <EditNoteIcon />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.updateRecord} />
                            </ListItemButton>
                            <AddUpdateRecord workflowId={edgeProps.data.workflowId} ref={updateRecordFormRef} open={false} onUpdateRecordNode={onCreateNewNode} source={edgeProps.source} dataModels={DataModels}/>
                            
                            {/* Will implement Note node */}
                            <ListItemButton onClick={() => addNoteFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <NoteIcon />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.createNote} />
                            </ListItemButton>
                            <AddNote workflowId={edgeProps.data.workflowId} ref={addNoteFormRef} open={false}  onCreateNoteNode={onCreateNewNode} source={edgeProps.source}/>
                            {/* Will implement delete node based on requirement */}
                            {/* <ListItemButton onClick={() => deleteRecordFormRef.current.openForm()}>
                                <ListItemIcon>
                                    <Delete />
                                </ListItemIcon>
                                <ListItemText primary={NodeType.deleteRecord} />
                            </ListItemButton>
                            <AddDeleteRecord workflowId={edgeProps.data.workflowId} ref={deleteRecordFormRef} open={false} onDeleteRecordNode={onCreateNewNode} source={edgeProps.source} dataModels={DataModels}/> */}
                        </List>
                    </Paper>
                </Fade>
            )}
        </Popper>
  )
}
