import { Link, Typography } from "@mui/material";
import DialogScreen from "../common/DialogScreen";
import React from "react";
import AceEditor from "react-ace";

interface WorkflowLogProps {
    type: string;
    result: any;
    condition?: string;
    inputData?: any
}

const DisplayDetails = (props:{displayData:any, onClose:() =>void, displayAction:()=>void, linkText:string, input: any}) =>{
    const {displayData, onClose, displayAction, linkText, input} = props
    return (<div>
        {input?.label && 
        <>
        <Typography>Label: {input.stepData.label}</Typography>
        <Typography>Description: {input.stepData.description}</Typography>
        </>}
        {input?.result && 
        <>
        <Typography>Result: {input.result}</Typography>
        </>}
        <Link color='primary' onClick={displayAction}>{linkText}</Link>
        <DialogScreen open={displayData!=undefined} onClose={onClose} title={displayData ? displayData.key : ''} subTitle="" width='full' customHeight='100%'>
        { displayData && <AceEditor
            readOnly={true}
            mode="json5"
            theme="github"
            name="UNIQUE_ID_FOR_ACTIVITY_LOG_JSON_FORMATTER"
            value={JSON.stringify((displayData.value), undefined, 3)}
            editorProps={{ $blockScrolling: true }}
            wrapEnabled={true}
            width={'580px'}
        />
        }
        </DialogScreen></div>
        )
}

export const WorkflowLogDisplay: React.FC<WorkflowLogProps> = (props) => {
    const { type, result, inputData } = props
    const [stepConfig, setStepConfig] = React.useState<{ key: string, value: any } | undefined>();
    const [stepResult, setStepResult] = React.useState<{ key: string, value: any } | undefined>();
    const updateConfigDetail = () => {
        setStepConfig({ key: "Configuration", value: inputData.stepData })
    }
    const parseResult = (value: any) =>{
        let parsedValue = value;
        if (result.startsWith("[")){
            parsedValue = JSON.parse(value.replaceAll('\\', '').replace('["','').replace('"]',''))
        }
        if(result.startsWith("{"))
            parsedValue = JSON.parse(parsedValue);
        return parsedValue;
    }
    const updateResult = () => {
        setStepResult({ key: "Result", value: parseResult(result)})
    }
    return (<>
        {inputData.stepData && 
        <DisplayDetails displayData={stepConfig} displayAction={updateConfigDetail} onClose={() => setStepConfig(undefined)} linkText={'Configuration'} input={inputData}/>
        }
        {result && 
        <DisplayDetails displayData={stepResult} displayAction={updateResult} onClose={() => setStepResult(undefined)} linkText={'Result'} input={parseResult(result)}/>
        }
        </>)
}