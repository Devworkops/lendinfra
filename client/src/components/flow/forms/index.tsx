import { type Node } from 'reactflow'
import { NodeType } from '../../../interfaces/IWorkflowstep';
import AssignmentForm from './AssignmentForm';
import { DataModel } from '../../../interfaces/IDataModel';
import ActionForm from './ActionForm';
import DecisionForm from './DecisionForm';
import UpdateRecordForm from './UpdateRecordForm';
import WaitForm from './WaitForm';
import NoteForm from './NoteForm';
import LendXPForm from './LendXPForm';

export const SelectedForm = (props: { selectedNodes: Node[], dataModels: DataModel[] }) => {

    const { selectedNodes, dataModels } = props
    const node = selectedNodes[0]
    const data = node?.data
    const key = data.label ? data.label : ''

    switch (key) {
        case NodeType.assignment:
            return <AssignmentForm open={true} workflowId={data.workflowId} dataModels={dataModels} ></AssignmentForm>
        case NodeType.action:
            return <ActionForm open={true} workflowId={data.workflowId} nodeId={node ? node.id : ''} source={data.stepData.dependsOn} defaultData={data.stepData} onEditNode={data.onEdit}></ActionForm>
        case NodeType.decision:
            return <DecisionForm open={true} workflowId={data.workflowId} nodeId={node ? node.id : ''} source={data.stepData.dependsOn} defaultData={data.stepData} onEditNode={data.onEdit} dataModels={dataModels}></DecisionForm>
        case NodeType.updateRecord:
            return <UpdateRecordForm open={true} workflowId={data.workflowId} nodeId={node ? node.id : ''} source={data.stepData.dependsOn} defaultData={data.stepData} onEditNode={data.onEdit} dataModels={dataModels}></UpdateRecordForm>
        case NodeType.wait:
            return <WaitForm open={true} workflowId={data.workflowId} nodeId={node ? node.id : ''} source={data.stepData.dependsOn} defaultData={data.stepData} onEditNode={data.onEdit}></WaitForm>
        case NodeType.note:
            return <NoteForm open={true} workflowId={data.workflowId} nodeId={node ? node.id : ''} source={data.stepData.dependsOn} defaultData={data.stepData} onEditNode={data.onEdit}></NoteForm>
        case NodeType.LendXP:
            return <LendXPForm open={true} workflowId={data.workflowId} dataModels={dataModels} nodeId={node ? node.id : ''} source={data.stepData.dependsOn} defaultData={data.stepData} onEditNode={data.onEdit}></LendXPForm>
        default:
            return <></>
    }

}