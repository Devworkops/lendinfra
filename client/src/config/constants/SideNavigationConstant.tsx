import Home from '@mui/icons-material/Home'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import SettingsIcon from '@mui/icons-material/Settings'
import SettingsInputCompositeIcon from '@mui/icons-material/SettingsInputComposite'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import StorageIcon from '@mui/icons-material/Storage'
import DatasetIcon from '@mui/icons-material/Dataset'
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import Notifications from '@mui/icons-material/Notifications'
import { CalendarIcon } from '@mui/x-date-pickers'
import { Webhook } from '@mui/icons-material'

export const SideNavConstants = {
  drawerWidth: 200,
  commonNavigationList: [
    {
      label: 'Home',
      pathName: '/',
      nestedLinks: [],
      icon: <Home />
    },
    {
      label: 'Accounts',
      pathName: '/accounts',
      nestedLinks: [
        // {
        //   label: 'Personal',
        //   pathName: '/accounts/individual',
        //   parent: 'Accounts',
        //   icon: <AccountBoxIcon />
        // },
        // {
        //   label: 'Business',
        //   pathName: '/accounts/business',
        //   parent: 'Accounts',
        //   icon: <AccountBoxIcon />
        // }   
      ],
      icon: <AccountBoxIcon />
    },
    {
      label: 'Applications',
      pathName: '/applications',
      nestedLinks: [],
      icon: <DatasetIcon />
    },
    {
      label: 'Contracts',
      pathName: '/contracts',
      nestedLinks: [],
      icon: <DatasetIcon />
    },
    {
      label: 'Workflows',
      pathName: '/flow',
      nestedLinks: [],
      icon: <DashboardCustomizeIcon />
    },
    {
      label: 'Settings',
      pathName: '/settings',
      icon: <SettingsIcon />,
      nestedLinks: [
        {
          label: 'Company',
          pathName: '/settings/company',
          parent: 'Settings',
          icon: <AddBusinessIcon />
        },
        {
          label: 'Users',
          pathName: '/settings/user',
          parent: 'Settings',
          icon: <ManageAccountsIcon />
        },
        {
          label: 'Integrations',
          pathName: '/integration',
          parent: 'Settings',
          icon: <SettingsInputCompositeIcon/>
        },
        {
          label: 'Data Models',
          pathName: '/settings/datamodels',
          parent: 'Settings',
          icon: <StorageIcon/>
        },
        {
          label: 'Notification',
          pathName: '/settings/notification',
          parent: 'Settings',
          icon: <Notifications/>
        },
        {
          label: 'Jobs Manager',
          pathName: '/settings/jobManager',
          parent: 'Settings',
          icon: <CalendarIcon/>
        },
        {
          label: 'Webhook Settings',
          pathName: '/settings/webhook',
          parent: 'Settings',
          icon: <Webhook/>
        }
      ]
    }
  ]
}
