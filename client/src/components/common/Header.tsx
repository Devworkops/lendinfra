import * as React from 'react'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Notifications from '@mui/icons-material/Notifications'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { useAuth } from '../../hooks/useAuth'
import { useEffect } from 'react'
import { Box, Button, styled, Typography, Tooltip } from '@mui/material'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import SideNavigation from '../common/SideNavigation'
import MButton from '../common/Mbutton'
import { type Company } from '../../interfaces/ICompany'
import useApi from '../../hooks/useApi'
import AddCompanyModal from '../company/AddCompanyModal'
import { Messages, Notification } from '../../interfaces/INotification'
import { WorkflowInstance } from '../../interfaces/IWorkflow'
import WorkflowRunDetail from '../datamanager/WorkflowRunDetail'
import DoneAllIcon from '@mui/icons-material/DoneAll';

const drawerWidth = 240
const perPage=5
interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

export default function Header() {
  const { auth, signout, switchCompany } = useAuth()
  const company = auth?.companyId
  const [getCompany, , ,] = useApi<Company>()
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [presentCompany, setPresentCompany] = React.useState<Company>()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [dropAnchorEl, setDropAnchorEl] = React.useState<null | HTMLElement>(null)
  const dropOpen = Boolean(dropAnchorEl)
  const [open, setOpen] = React.useState(true)
  const [pagination, setPagination] = React.useState<number>(perPage)
  const [getNotificationAndCount, , ,] = useApi<Notification>()
  const [markNotificationRead, , ,] = useApi<Notification>()
  const [getWorkflow] = useApi<WorkflowInstance[]>();
  const [dropAnchorNotification, setDropAnchorNotification] = React.useState<null | HTMLElement>(null)
  const dropNotificationOpen = Boolean(dropAnchorNotification)
  const [openNotification, setNotificationOpen] = React.useState(true)

  const { enqueueSnackbar } = useSnackbar()
  const [modalOpen, setModalOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification>()
  const [showWorkflow, setShowWorkflow] = React.useState<boolean>(false);
    const [selectedData, setSelectedData] = React.useState<WorkflowInstance>()

  const router = useRouter()

  useEffect(() => {
    if (auth != null) {
      getCompany(`api/company/user/${auth?.id}`).then((response) => {
        if (response.data.errors) {
          enqueueSnackbar(response.data.errors[0].message, {
            variant: 'error'
          })
        } else {
          setCompanies(response.data.companyList)
          setPresentCompany(response.data.presentCompany)
        }
      })
    }
  }, [auth])

  useEffect(()=>{
    if(!presentCompany?.id) return;
    let timerId: ReturnType<typeof setInterval>;
    function getNotifications(){
      getNotificationAndCount(`api/notification?company_id=${presentCompany?.id}&perPage=${pagination}`).then((response) => {
        if (response.data.errors) {
          enqueueSnackbar(response.data?.errors ? response.data.errors[0].message : 'Someting went wrong', {
            variant: 'error'
          })
        } else {
          setNotifications(response.data)
        }
      })
    }

    if (auth != null) {
      timerId =  setInterval(getNotifications, 5000)
      getNotifications()
    }

    return ()=>{
      clearInterval(timerId)
    }
  }, [auth, presentCompany?.id, pagination])

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleDropClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDropAnchorEl(event.currentTarget)
  }
  const handleNotificationDropClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDropAnchorNotification(event.currentTarget)
  }
  const handleDropClose = () => {
    setDropAnchorEl(null)
  }
  const handleNotificationDropClose = () => {
    setDropAnchorNotification(null)
    setPagination(perPage)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleMyProfile = () => {
    setAnchorEl(null)
    router.push('/profile')
  }

  const handleSignOut = () => {
    signout(async () => await router.push('sign-in'))
  }
  const handleSwitchCompany = (company: Company) => {
    if (company.id) {
      switchCompany(company.id, async () =>
        await router.push('/dashboard')
      )
      setPresentCompany(company)
      setDropAnchorEl(null)
    }
  }
  const openWorkflowResult = (notification: Messages) => {
    if (notification?.instatnce_id != undefined && notification?.instatnce_id != '') {
      let workflowBaseUrl = `api/workflow/instance/${notification?.instatnce_id}?company_id=${auth?.companyId}`
      getWorkflow(workflowBaseUrl).then((response) => {
        if (response?.data?.errors ) {
          enqueueSnackbar("Something went wrong", {
            variant: 'error'
          })
        } else {
          setSelectedData(response.data.WorkflowInstance)
          setShowWorkflow(true)
        }
      });
    }
  }

  const markRead = () => {(
      markNotificationRead(`api/notification/all/read?perPage=${pagination}&company_id=${auth?.companyId}`).then((response) => {
        if (response.data.errors ) {
          enqueueSnackbar("Something went wrong", {
            variant: 'error'
          })
        } else {
          setNotifications(response.data)
        }
      })
  )}

  const handleLogin = () => {
    router.push('/sign-in')
  }

  const handleLogoClick = () => {
    router.push('/')
  }

  const handleMyAccount = () => {
    setAnchorEl(null)
    router.push('/dashboard')
  }
  const handleDrawer = () => {
    setOpen(!open)
  }

  const handleModalOpen = () => {
    setModalOpen(true)
    setDropAnchorEl(null)
  }
  const handleLoadMore = () => {
    setPagination((prev)=>(prev + perPage))
  }

  const handleModalClose = () => {
    setModalOpen(false)
  }

  function Row(props: { row: Company }) {
    const { row } = props
    return (
      <>
        <MenuItem onClick={() => { handleSwitchCompany(row) }}>{row.companyName}</MenuItem>
      </>
    )
  }
  function formatDate(dateString:any){
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA'); // 'en-CA' locale outputs dates in yyyy-MM-dd format
  };

  function NotificationRow(props: { row: Messages }) {
    const { row } = props
    return (
        <MenuItem onClick={() => { openWorkflowResult(row)}} className='msg' style={{backgroundColor: `${row.is_read ? '' : '#2e958626'}`}}>
        <p>{row.activity}</p>
        <p style={{alignSelf: 'flex-start', fontWeight: 'bold', fontSize:'12px'}}>{formatDate(row.timestamp).replace(/-/g, '/')}</p>
        </MenuItem>
    )
  }

  // Either lookup a nice label for the subpath, or just titleize it
  const getDefaultTextGenerator = React.useCallback((subpath: string) => {
    subpath
  }, [])

  return (
    <>
      {(auth != null) && (
        <AppBar
          position="fixed"
          sx={{
            bgcolor: 'background.default'
          }}
        >
          <Toolbar>
            {auth && (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                sx={{ mr: 2 }}
              
              >
                <MenuIcon onClick={handleDrawer}/>
              </IconButton>
            )}
            <Box
              sx={{ flexGrow: 1, cursor: 'pointer  ' }}
              onClick={handleLogoClick}
            >
              <img src="/favicon.ico" alt="me" width="24" height="24" />
            </Box>
            {auth && (
              <Box sx={{ display: 'flex', padding: '3px' }}>
                <IconButton
                  id="notification-button"
                  aria-controls={openNotification ? 'notification-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={openNotification ? 'true' : undefined}
                  onClick={handleNotificationDropClick}
                  className='notification-icon' 
                >
                  <Notifications />
                  {notifications?.count && notifications?.count > 0 ?
                    <Typography
                      variant="caption"
                      color="error"
                      className='noti-count' // Apply styles for notification count
                    >
                      {notifications.count > 99 ? "99+" : notifications.count }
                    </Typography>
                  : <></>}
                </IconButton>

                <MButton
                  endIcon={<ArrowDropDownIcon ></ArrowDropDownIcon >}
                  id="basic-button"
                  aria-controls={open ? 'basic-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  onClick={handleDropClick}
                >
                  {presentCompany ? presentCompany.companyName : 'My Companies'}
                </MButton>
                <Tooltip title="Account">
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMyProfile}
                  >
                    <AccountCircle />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Logout">
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="sign out"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleSignOut}
                  >
                    <LogoutOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {auth == null && <Button onClick={handleLogin}>Login</Button>}
          </Toolbar>
        </AppBar>
      )}
      {(auth != null) && (<SideNavigation open={open} setOpen={setOpen}></SideNavigation>)}
      <Menu
        id="basic-menu"
        anchorEl={dropAnchorEl}
        open={dropOpen}
        onClose={handleDropClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}>
        {companies?.map((row) => (
          <Row key={row.companyName} row={row} />
        ))}
        <MenuItem onClick={handleModalOpen} style={{ paddingBottom: '0px', paddingRight: '0px' }}>
          <Typography color="primary">Add Company</Typography>
          <IconButton>
            <AddCircleIcon color="primary" sx={{ fontSize: 20 }} />
          </IconButton>
        </MenuItem>
      </Menu>

      <Menu
        id="notification-menu"
        anchorEl={dropAnchorNotification}
        open={dropNotificationOpen}
        onClose={handleNotificationDropClose}
        MenuListProps={{
          'aria-labelledby': 'notification-button'
        }}>
          {notifications?.count && notifications?.count > 0 ? (
         <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
         <div onClick={markRead} style={{ display: 'inline-flex', justifyContent:'end', marginRight: '10px', cursor:'pointer', gap: '5px'}}>
           <DoneAllIcon fontSize='small' color='primary'/>
           <Typography color="primary">
             Mark all as Read
           </Typography>
         </div>
       </div>
          ) : <></>}
          
        {notifications?.messages && notifications?.messages.length > 0 ? notifications?.messages?.map(row=>{
          return <NotificationRow key={row.activity} row={row} />
        }) :<Typography className='load-more' color="primary">No Notification Found</Typography>
}
        <>
        </>
        {pagination && notifications?.total_notification &&  (pagination < notifications?.total_notification) ? (
          <MenuItem  onClick={handleLoadMore} style={{ paddingBottom: '0px', paddingRight: '0px' }} className='load-more'>
            <Typography color="primary">Load More</Typography>
          </MenuItem>
        ) : <></>}
      </Menu>
      {modalOpen && <AddCompanyModal
        modalOpen={modalOpen}
        setDropAnchorEl={setDropAnchorEl}
        handleClose={handleModalClose}
      ></AddCompanyModal>}
      {showWorkflow && (selectedData != undefined) && <WorkflowRunDetail isOpen={showWorkflow} onClose={setShowWorkflow} objectName={selectedData?.workflow?.object} workflowInstanceId={selectedData?.id} recordId={selectedData?.recordId}></WorkflowRunDetail>}
    </>
  )
}
