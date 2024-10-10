import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PageHeading from '../common/PageHeading'
import { OverviewCard } from '../common/OverviewCard'
import { Stack } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage'
import { useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import useApi from '../../hooks/useApi'
import ShowWorkflowInstances from './WorkflowInstance'

export default function Dashboard() {
  const [dashboardDetail, setDashboardDetail] = useState<{ 
    workflow: string, 
    activeWorkflow: string, 
    accounts: { 
      individualAccounts: string, 
      businessAccounts: string 
    }, 
    applications: {name: string, count: number}[], 
    instanceCount: string, 
    integrations: string 
  }>({ 
    workflow: '', 
    activeWorkflow: '', 
    accounts: { 
      individualAccounts: '', 
      businessAccounts: ''
    }, 
    applications: [], 
    instanceCount: '', 
    integrations: '' 
  });
  const { enqueueSnackbar } = useSnackbar()
  const [getDashboardDetail, ,] = useApi<{ 
    workflow: string, 
    activeWorkflow: string, 
    accounts: { 
      individualAccounts: string, 
      businessAccounts: string 
    }, 
    applications: {name: string, count: number}[], 
    instanceCount: string, 
    integrations: string 
  }>()

  useEffect(() => {
    // get the dashboard detail
    getDashboardDetail(`api/dashboard/`).then((response) => {
      if (response.data.errors) {
        enqueueSnackbar(response.data.errors[0].message, {
          variant: 'error'
        })
      } else {
        setDashboardDetail(response.data);
      }
    })
  }, [])

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PageHeading heading='Dashboard'></PageHeading>
        <Stack direction='row' spacing={4} alignItems='start'>
          <OverviewCard mainHeading='Workflows' data={dashboardDetail.workflow} secondaryHeading={`${dashboardDetail.activeWorkflow} Active, ${dashboardDetail.instanceCount} Instance In Progress`} icon={<DashboardIcon></DashboardIcon>} ></OverviewCard>
          <OverviewCard mainHeading='Accounts' data={dashboardDetail.accounts['businessAccounts'] + dashboardDetail.accounts['individualAccounts']} secondaryHeading={`Individual Accounts: ${dashboardDetail.accounts.individualAccounts}, Business Accounts: ${dashboardDetail.accounts.businessAccounts}`} icon={<StorageIcon></StorageIcon>} iconColor='text.primary'></OverviewCard>
          <OverviewCard mainHeading='Applications' data={`${dashboardDetail.applications.reduce((total, app) => (total + app.count), 0)}`} secondaryHeading={dashboardDetail.applications.map(app => `${app.name}: ${app.count}`).join(', ')} icon={<StorageIcon></StorageIcon>} iconColor='text.secondary'></OverviewCard>
        </Stack>
        <ShowWorkflowInstances objectName='' recordId=''></ShowWorkflowInstances>
      </Box>
    </Container>
  )
}
