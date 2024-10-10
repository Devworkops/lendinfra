import AllWorkflow from '../../components/flow'
import * as React from 'react'
import {
  Box,
  Tabs,
  Tab
} from "@mui/material";
import ShowWorkflowInstances from '../../components/dashboard/WorkflowInstance';

export default function Flow() {
  const TabPanel = ({ children, value, index }: any) => (
    <div hidden={value !== index} role="tabpanel" id={`tabpanel-${index}`}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );

  const [value, setValue] = React.useState(0);
  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <Tabs value={value} onChange={handleChange} aria-label="tabs example">
        <Tab label="Workflows" />
        <Tab label="Workflows Run" />
        <Tab label="Archives" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <AllWorkflow active={true}></AllWorkflow>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ShowWorkflowInstances objectName='' recordId=''></ShowWorkflowInstances>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AllWorkflow active={false}></AllWorkflow>
      </TabPanel>
    </div>
  )
}
