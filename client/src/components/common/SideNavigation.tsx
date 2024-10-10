import React, { useEffect } from 'react'
import {
  Collapse,
  type CSSObject,
  Divider,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  styled,
  type Theme,
  ListItemButton
} from '@mui/material'
import MuiDrawer from '@mui/material/Drawer'
import { ExpandLess, ExpandMore, Home } from '@mui/icons-material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useRouter } from 'next/router'
import { type UrlObject } from 'url'
import { useAuth } from '../../hooks/useAuth'
import theme from '../../config/theme/theme'
import Tooltip from '@mui/material/Tooltip'
import { SideNavConstants } from '../../config/constants/SideNavigationConstant'

const openedMixin = (theme: Theme): CSSObject => ({
  width: SideNavConstants.drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden',
  border: 'none'
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(5)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(6)} + 1px)`
  },
  border: 'none'
})

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  width: SideNavConstants.drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  }),
  '& .Mui-selected': {
    color: 'rgba(0, 134, 121, 1) !important',
    backgroundColor: '#fff !important',
    marginLeft: '4px'
  },
  '& .MuiListItemIcon-root': {
    color: 'inherit',
    minWidth: '35px'
  }
}))

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}))

export default function SideNavigation ({
  open,
  setOpen
}: {
  open: boolean | undefined
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { auth } = useAuth()
  const router = useRouter()

  const handleDrawerClose = () => {
    setOpen(!open)
  }

  const getParentLabel = () => {
    let label
    let item: any
    for (item of SideNavConstants.commonNavigationList) {
      if (item.pathName === router.pathname && item.nestedLinks.length <= 0) { label = item.label } else if (item.pathName === router.pathname) { label = item.nestedLinks[0].parent }
      if (item.nestedLinks) {
        const nestedItem = item.nestedLinks.find(
          (nestedLink: { pathName: string }) => {
            return nestedLink.pathName === router.pathname
          }
        )
        if (nestedItem) {
          label = nestedItem.parent
        }
      }
      if (label) break
    }
    return label
  }

  const [activeNavDetail, setActiveNavDetail] = React.useState({
    activeNav: router.pathname,
    activeDropDown: getParentLabel()
  })

  useEffect(() => {
    setActiveNavDetail({
      activeNav: router.pathname,
      activeDropDown: getParentLabel()
    })
  }, [router])

  const handleNavClick = (pathName: string | UrlObject) => {
    router.push(pathName)
  }

  const openDropDown = (links: any) => {
    setActiveNavDetail(
      (prevState) => {
        // Toggle the dropdown: if it's already open, close it; otherwise, open it
        const isCurrentlyOpen = prevState.activeDropDown === links.label;
        return {
          ...prevState,
          activeNav: router.pathname,
          activeDropDown: isCurrentlyOpen ? "" : links.label
        };
      }
    )
  }

  return (
    (auth != null) ? <Drawer
      variant="permanent"
      open={open}
    >
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'rtl'
            ? (
            <ChevronRightIcon />
              )
            : (
            <ChevronLeftIcon />
              )}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {SideNavConstants.commonNavigationList.map((links, i) => (
          <React.Fragment key={i}>
            <ListItemButton
              selected={router.pathname === '/'
                ? links.pathName === '/'
                : !!(activeNavDetail.activeNav.startsWith(links.pathName) && links.pathName.length > 1 && links.nestedLinks.length <= 0)
              }
              onClick={() => { links.nestedLinks.length > 0 ? openDropDown(links) : handleNavClick(links.pathName) }}
            >
              <Tooltip title={links.label} placement="right">
                <ListItemIcon color='inherit'> {links.icon}</ListItemIcon>
              </Tooltip>
              {open && <ListItemText
                style={{ paddingLeft: '0px' }}
                inset
                primary={links.label}
              />}
              {links.nestedLinks.length > 0 && (
                <>
                  {activeNavDetail.activeDropDown === links.label
                    ? (
                    <ExpandLess color="action" />
                      )
                    : (
                    <ExpandMore color="action" />
                      )}
                </>
              )}
            </ListItemButton>
            {links.nestedLinks.length > 0 && (
              <Collapse
                in={
                  activeNavDetail.activeDropDown === links.label
                }
                timeout="auto"
                unmountOnExit
              >
                {links.nestedLinks.map((item, index) => (
                   (item.label === "Jobs Manager" && auth?.roles != "ADMIN") ? '' :
                  <ListItemButton
                    selected={
                      activeNavDetail.activeNav == item.pathName
                    }
                    key={index}
                    onClick={() => { handleNavClick(item.pathName) }}
                    sx={open ? { paddingLeft: '30px' } : {}}
                  >
                    <Tooltip title={item.label} placement="right">
                      <ListItemIcon color='inherit'>{item.icon}</ListItemIcon>
                    </Tooltip>
                    {open && <ListItemText
                      sx={{ paddingLeft: '0px' }}
                      inset
                      primary={item.label}
                    />}
                  </ListItemButton>
                ))}
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>:<></>
  )
}
