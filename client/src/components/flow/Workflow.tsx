import { useCallback, useEffect, useRef, useState } from 'react'
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  type Edge,
  MarkerType,
  type Connection,
  updateEdge,
  type EdgeProps,
  ReactFlowProvider,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  Panel,
  useReactFlow,
  useOnSelectionChange,
  type Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import AddNodeEdge from './edges/AddNodeEdge';
import StartNode from './nodes/StartNode'
import EndNode from './nodes/EndNode';
import AssignmentNode from './nodes/AssignmentNode';
import DecisionNode from './nodes/DecisionNode';
import { NodeType } from '../../interfaces/IWorkflowstep';
import LoopNode from './nodes/LoopNode';
import ActionNode from './nodes/ActionNode';
import useApi from '../../hooks/useApi';
import { Workflow } from '../../interfaces/IWorkflow';
import { useSnackbar } from 'notistack';
import { Button } from '@mui/material';
import { DataModel } from '../../interfaces/IDataModel';
import { useAuth } from '../../hooks/useAuth';
import CreateRecordNode from './nodes/CreateRecordNode';
import UpdateRecordNode from './nodes/UpdateRecordNode';
import GetRecordNode from './nodes/GetRecordNode';
import DeleteRecordNode from './nodes/DeleteRecordNode';
import WaitNode from './nodes/WaitNode'
import { SelectedForm } from './forms';
import NoteNode from './nodes/NoteNode';
import LendXPNode from './nodes/LendXPNode';

const edgeTypes = {
  buttonedge: AddNodeEdge
}

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  assignmentNode: AssignmentNode,
  decisionNode: DecisionNode,
  loopNode: LoopNode,
  actionNode: ActionNode,
  createRecordNode: CreateRecordNode,
  getRecordNode: GetRecordNode,
  updateRecordNode: UpdateRecordNode,
  deleteRecordNode: DeleteRecordNode,
  waitNode: WaitNode,
  noteNode: NoteNode,
  lendxpNode: LendXPNode
}

const getNodeId = () => `randomnode_${+new Date()}`
const getEdgeId = () => `randomedge_${+new Date()}`

const WrokFlow = (props: { flowId: any }) => {
  const [workflowConfig, setWorkflowConfig] = useState<Workflow>();
  const [getWorkflow, saveWorkflow, updateWorkflow] = useApi<Workflow>();
  const { setViewport } = useReactFlow();
  const { enqueueSnackbar } = useSnackbar();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editNode, setEditNode] = useState(false)

  // Selected Node
  const [selectedNodes, setSelectedNodes] = useState<Node<any, string | undefined>[]>([]);

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes([...nodes])
    }
  });

  const [getDataModels] = useApi<DataModel[]>()
  const [DataModels, setDataModels] = useState<DataModel[]>([])
  const { auth } = useAuth()
  const updateData = async () => {
    let DataModelBaseUrl = `api/DataModel/all/${auth?.companyId}`

    const [datmodelRes] = await Promise.allSettled([
      getDataModels(DataModelBaseUrl),
    ])

    if (datmodelRes.status === "fulfilled") {
      const workflowData = datmodelRes.value.data
      if (workflowData.errors) {
        const [{ message }, ..._] = workflowData.errors
        enqueueSnackbar(message, { variant: "error" })
      } else {
        const { results, totalResults } = workflowData
        setDataModels(results as DataModel[])
      }
    }
  };
  const [autoLayout, setAutoLayout] = useState(true);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoLayout(event.target.checked)
  }

  const [reactFlowInstance, setReactFlowInstance] = useState<any | null>(null);
  const reactFlowWrapper = useRef<any | null>(null);

  const onDrop = useCallback(
    (event: { preventDefault: () => void, dataTransfer: { getData: (arg0: string) => any }, clientX: number, clientY: number }) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/plain')
      const nodeId = getNodeId()

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return
      }
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      })
      switch (type) {
        case NodeType.assignment:
          const newNode = {
            id: nodeId,
            type: 'assignmentNode',
            data: { label: 'Assignment', workflowId: props.flowId, dataModels: DataModels },
            position: position,
            className: 'square',
          }
          setNodes((nds) => nds.concat(newNode));
          break;

        case NodeType.decision:
          const newDecisionNode = {
            id: nodeId,
            type: 'decisionNode',
            data: { label: 'Decision', workflowId: props.flowId, dataModels: DataModels },
            position: position,
            className: 'diamond',
          }
          setNodes((nds) => nds.concat(newDecisionNode))
          break

        case NodeType.createRecord:
          const newCreateRecordNode = {
            id: nodeId,
            type: 'createRecordNode',
            data: { label: 'Create Record', workflowId: props.flowId, dataModels: DataModels },
            position: position,
            className: 'createRecord',
          }
          setNodes((nds) => nds.concat(newCreateRecordNode))
          break

        case NodeType.updateRecord:
          const newUpdateRecordNode = {
            id: nodeId,
            type: 'updateRecordNode',
            data: { label: 'Update Record', workflowId: props.flowId, dataModels: DataModels },
            position: position,
            className: 'updateRecord',
          }
          setNodes((nds) => nds.concat(newUpdateRecordNode))
          break
        default:
          break;
      }
    },
    [reactFlowInstance]
  )

  const onDragOver = useCallback((event: { preventDefault: () => void, dataTransfer: { dropEffect: string } }) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onNodesDelete = useCallback(
    (deleted: any[]) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter((edge: Edge<any>) => !connectedEdges.includes(edge));
          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: getEdgeId(),
              source,
              target,
              data: connectedEdges[0].data && connectedEdges[0].data,
              type: connectedEdges[0].data != undefined ? 'buttonedge' : 'DefaultEdge',
              markerEnd: {
                type: connectedEdges[0].data != undefined ? MarkerType.ArrowClosed : '',
              },
              sourceHandle: connectedEdges[0].sourceHandle != undefined ? connectedEdges[0].sourceHandle : ''
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [nodes, edges]
  );

  useEffect(() => {
    if (props.flowId !== undefined) {
      const response = getWorkflow(`api/workflow/${props.flowId}`).then((response) => {
        if (response.data.errors) {
          enqueueSnackbar(response.data.errors[0].message, {
            variant: 'error'
          })
        } else {
          setWorkflowConfig(response.data)
        }
      })
    }
    updateData()
  }, [])

  useEffect(() => {
    if (workflowConfig) {
      if (!workflowConfig.config) {
        let edgeLabel = ''
        switch (workflowConfig.type) {
          case 'Record-Triggered Flow':
            edgeLabel = 'Record triggered'
            break
          case 'Platform Event—Triggered Flow':
            edgeLabel = 'Platform triggered'
            break
          case 'Schedule-Triggered Flow':
            edgeLabel = 'Schedule triggered'
            break
          case 'Autolaunched Flow':
            edgeLabel = 'Autolaunched'
            break
          default:
            edgeLabel = ''
            break
        }
        setNodes([
          {
            id: 'start',
            type: 'startNode',
            data: { onEdit: onEditNode, label: 'Start', workflowId: props.flowId },
            position: { x: window.innerWidth / 6, y: 0 },
            className: 'circle',
            style: {
              background: 'white',
              color: 'white'
            }
          },
          {
            id: 'end',
            type: 'endNode',
            data: { onEdit: onEditNode, label: 'End', workflowId: props.flowId },
            position: { x: window.innerWidth / 6, y: window.innerHeight / 3 },
            className: 'circle',
            style: {
              background: 'white',
              color: 'white'
            }
          }
        ])

        setEdges([
          {
            id: 'edge-button',
            source: 'start',
            target: 'end',
            type: 'buttonedge',
            markerEnd: {
              type: MarkerType.ArrowClosed
            },
            data: { onChange: onCreateNode, label: edgeLabel, workflowId: props.flowId, isAutoLayout: autoLayout },
          },
        ]);
      }
      else {
        let storedConfig = workflowConfig?.config
        if (storedConfig) {
          const flow = storedConfig;

          if (flow) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            if (flow.nodes) {
              const updatedNodes = flow.nodes.map((element: any) => ({
                ...element,
                data: { ...element.data, onEdit: onEditNode }
              }));
              setNodes(updatedNodes);
            }
            else {
              setNodes([]);
            }
            if (flow.edges) {
              const updatedEdges = flow.edges.map((element: any) => ({
                ...element,
                data: { ...element.data, onChange: onCreateNode }
              }));
              setEdges(updatedEdges);
            }
            else {
              setEdges([]);
            }
            setViewport({ x, y, zoom });
          }
        }
      }
    }
  }, [workflowConfig, autoLayout])


  const onCreateNode = useCallback(async (nodeType: string, data: any, edgeProps: EdgeProps) => {
    const nodeId = getNodeId()
    const edgeId = getEdgeId()

    const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd } = edgeProps
    switch (nodeType) {
      case NodeType.assignment:
        const newNode = {
          id: nodeId,
          type: 'assignmentNode',
          data: { onEdit: onEditNode, label: 'Assignment', workflowId: props.flowId, stepData: data },
          // position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'square'
        }

        const newEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'Assign' }
        }

        setNodes((nds) => nds.concat(newNode))

        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )

        // Append new edge
        setEdges((eds) => eds.concat(newEdge))
        break
      case NodeType.decision:
        const newDecisionNode = {
          id: nodeId,
          type: 'decisionNode',
          data: { onEdit: onEditNode, label: 'Decision', workflowId: props.flowId, stepData: data },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'diamond'
        }

       
        const newDecisionEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: '', edgeType: 'decisionLeft' },
          sourceHandle: 'source_leftDecision'
        }

        const newDecisionEndEdge = {
          id: getEdgeId() + "end",
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'Default Outcome', edgeType: 'decisionRight' },sourceHandle: 'source_rightDecision'
        }

        setNodes((nds) => nds.concat(newDecisionNode))
        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )

        // Append new edge
        setEdges((eds) => eds.concat(newDecisionEdge))
        setEdges((eds) => eds.concat(newDecisionEndEdge))

        break
      case NodeType.action:
        const newActionNode = {
          id: nodeId,
          type: 'actionNode',
          data: { onEdit: onEditNode, label: 'Action', workflowId: props.flowId, stepData: data },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'action'
        }

        const newActionEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: '', edgeType: 'actionLeft' },
          sourceHandle: 'source_leftAction'
        }

        const newActionEndEdge = {
          id: getEdgeId() + "end",
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'Default Outcome', edgeType: 'actionRight' },sourceHandle: 'source_rightAction'
        }

        setNodes((nds) => nds.concat(newActionNode))
        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )
        // Append new edge
        setEdges((eds) => eds.concat(newActionEdge))
        setEdges((eds) => eds.concat(newActionEndEdge))

        break
      case NodeType.createRecord:
        const newCreateRecordNode = {
          id: nodeId,
          type: 'createRecordNode',
          data: { onEdit: onEditNode, label: 'Create Record', workflowId: props.flowId, stepData: data },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'dataRecord'
        }

        const newCreateRecordEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'Create Record' }
        }

        await setNodes((nds) => nds.concat(newCreateRecordNode))

        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )

        // Append new edge
        await setEdges((eds) => eds.concat(newCreateRecordEdge))
        break
      case NodeType.updateRecord:
        const newUpdateRecordNode = {
          id: nodeId,
          type: 'updateRecordNode',
          data: { onEdit: onEditNode, label: 'Update Record', workflowId: props.flowId, stepData: data },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'dataRecord'
        }

        const newUpdateRecordEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'Update Record' }
        }

        await setNodes((nds) => nds.concat(newUpdateRecordNode))

        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )

        // Append new edge
        await setEdges((eds) => eds.concat(newUpdateRecordEdge))
        break
      case NodeType.getRecord:
        const newGetRecordNode = {
          id: nodeId,
          type: 'getRecordNode',
          data: { onEdit: onEditNode, label: 'Get Record', workflowId: props.flowId, stepData: data },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'dataRecord'
        }

        const newGetRecordEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'Get Record' }
        }

        await setNodes((nds) => nds.concat(newGetRecordNode))

        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )

        // Append new edge
        await setEdges((eds) => eds.concat(newGetRecordEdge))
        break
      case NodeType.deleteRecord:
        const newDeleteRecordNode = {
          id: nodeId,
          type: 'deleteRecordNode',
          data: { onEdit: onEditNode, label: 'Delete Record', workflowId: props.flowId, stepData: data },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'dataRecord'
        }

        const newDeleteRecordEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'Delete Record' }
        }

        await setNodes((nds) => nds.concat(newDeleteRecordNode))

        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )

        // Append new edge
        await setEdges((eds) => eds.concat(newDeleteRecordEdge))
        break
      case NodeType.wait:
        const newWaitdNode = {
          id: nodeId,
          type: 'waitNode',
          data: { onEdit: onEditNode, label: 'Wait', workflowId: props.flowId, stepData: data },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'wait'
        }

        const newWaitEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'Wait' }
        }

        await setNodes((nds) => nds.concat(newWaitdNode))

        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )

        // Append new edge
        await setEdges((eds) => eds.concat(newWaitEdge))
        break

        case NodeType.note:
        const newNoteNode = {
          id: nodeId,
          type: 'noteNode',
          data: { onEdit: onEditNode, label: 'Note', workflowId: props.flowId, stepData: data },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'note'
        }

        const newNoteEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'Note' }
        }

        await setNodes((nds) => nds.concat(newNoteNode))

        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )

        // Append new edge
        await setEdges((eds) => eds.concat(newNoteEdge))
        break

        case NodeType.LendXP:
        const newLendXPNode = {
          id: nodeId,
          type: 'lendxpNode',
          data: { onEdit: onEditNode, label: 'LendXP', workflowId: props.flowId, stepData: data },
          position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
          className: 'LendXP'
        }

        const newLendXPEdge = {
          id: edgeId,
          source: nodeId,
          target: edgeProps.target,
          type: 'buttonedge',
          markerEnd: {
            type: MarkerType.ArrowClosed
          },
          data: { onChange: onCreateNode, workflowId: props.flowId, isAutoLayout: autoLayout, label: 'LendXP' }
        }

        await setNodes((nds) => nds.concat(newLendXPNode))

        // update target handle for source node
        setEdges((eds) => {
          eds.map((edge) => {
            if (edge.id == edgeProps.id) {
              edge.target = nodeId
            }
            return edge
          })
          return eds
        }
        )

        // Append new edge
        await setEdges((eds) => eds.concat(newLendXPEdge))
        break

      default:
        break
    }
  }, [setNodes, setEdges])

  const onEditNode = useCallback(async (data: any, nodeId: string) => {
    if (nodes) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            node.data = {
              ...node.data,
              stepData: data,
            };
          }
          return node;
        })
      );
    }
  }, [setNodes, setEdges])

  const onConnect = useCallback((params: Edge<any> | Connection) => { setEdges((eds) => addEdge(params, eds)) }, [])

  // gets called after end of edge gets dragged to another source or target
  const onEdgeUpdate = useCallback(
    (oldEdge: Edge<any>, newConnection: Connection) => { setEdges((els) => updateEdge(oldEdge, newConnection, els)) },
    []
  )

  const onSave = () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      if (workflowConfig && flow) {
        const response = updateWorkflow(`api/workflow/${props.flowId}`, { ...workflowConfig, config: { ...flow } }).then((response) => {
          if (response.data.errors) {
            enqueueSnackbar(response.data.errors[0].message, {
              variant: 'error'
            });
          }
          else {
            enqueueSnackbar('Saved Succesfully', {
              variant: 'success'
            });
            setWorkflowConfig({ ...workflowConfig, config: flow });
          }
        })
      }
    }
  }

  const onRestore = () => {
    let storedConfig = workflowConfig?.config
    if (storedConfig) {
      const flow = storedConfig;

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;

        if (flow.nodes) {
          const updatedNodes = flow.nodes.map((element: any) => ({
            ...element,
            data: { ...element.data, onEdit: onEditNode }
          }));
          setNodes(updatedNodes);
        }
        else {
          setNodes([]);
        }

        if (flow.edges) {
          const updatedEdges = flow.edges.map((element: any) => ({
            ...element,
            data: { ...element.data, onChange: onCreateNode }
          }));
          setEdges(updatedEdges);
        }
        else {
          setEdges([]);
        }
        setViewport({ x, y, zoom });
      }
    }
  };

  function isNodeStartEnd(selectedNodes: any) {
    if (selectedNodes[0] && (selectedNodes[0].type == 'startNode' || selectedNodes[0].type == 'endNode')) {
      return true
    }
    return false;
  }

  return (
    <>
      <div className="dndflow">
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            onNodesDelete={onNodesDelete}
            snapToGrid={true}
            edgeTypes={edgeTypes}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="top-right"
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            deleteKeyCode={isNodeStartEnd(selectedNodes) ? null : ['Delete', 'Backspace']}
            onClick={() => setEditNode(true)}
          >
            <Panel position="top-right" className='panel-buttons'>
              <Button onClick={onSave} variant='contained' sx={{ marginRight: '5px' }}>Save</Button>
              <Button onClick={onRestore} variant='contained' sx={{ marginRight: '5px' }} >Restore</Button>
              {/* Will enable drag & drop if required */}
              {/* <FormControlLabel
                control={
                  <Switch
                    checked={autoLayout}
                    onChange={handleChange}
                    aria-label="layout switch"
                  />
                }
                label={autoLayout ? 'Auto-Layout' : 'Free-Flow'}
              /> */}
            </Panel>
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        {/* Will enable drag & drop if required */}
        {/* {!autoLayout && <Sidebar />} */}
        {editNode && selectedNodes && selectedNodes.length > 0 && <SelectedForm selectedNodes={selectedNodes} dataModels={DataModels}></SelectedForm>}
      </div></>

  );
};

export default (props: { flowId: any }) => (
  <ReactFlowProvider>
    <WrokFlow flowId={props.flowId} />
  </ReactFlowProvider>
);
