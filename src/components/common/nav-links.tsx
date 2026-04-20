import {
  LayoutDashboardIcon,
  HomeIcon,
  HammerIcon,
  InboxIcon,
  SendIcon,
  ClipboardSignatureIcon,
  UsersIcon,
  PlusIcon,
  SettingsIcon,
  KanbanSquareIcon,
  ServerCogIcon,
  UserIcon,
  SpeechIcon,
  ShieldCheckIcon,
  ClipboardListIcon,
  DollarSignIcon,
  PhoneIncomingIcon
} from 'lucide-react';
import { title } from 'process';
export const navLinks = [
  {
    title: 'Home',
    icon: <HomeIcon size={'20px'} className="text-foreground" />,
    path: '/',
    group: 1,
    lastOfGroup: true
  },
  // {
  //   title: 'Projects',
  //   icon: <KanbanSquareIcon size={'20px'} className="text-zinc-900 dark:text-zinc-300" />,
  //   path: '/projects',
  //   group: 1,
  //   lastOfGroup: true
  // },
  {
    title: 'Sales Leads',
    icon: <SpeechIcon size={'20px'} className="text-foreground" />,
    path: '/inbox',
    group: 2
  },
  // {
  //   title: 'Jobs',
  //   icon: <HammerIcon size={'20px'} className="text-zinc-900 dark:text-zinc-300" />,
  //   path: '/jobs',
  //   group: 2
  // },
  {
    title: 'Invoices',
    icon: <SendIcon size={'20px'} className="text-foreground" />,
    path: '/invoices',
    group: 2
  },
  {
    title: 'Quotes',
    icon: <ClipboardSignatureIcon size={'20px'} className="text-zinc-900 dark:text-zinc-300" />,
    path: '/quotes',
    group: 2
  },
  {
    title: 'Customers',
    icon: <UsersIcon size={'20px'} className="text-zinc-900 dark:text-zinc-300" />,
    path: '/customers',
    group: 2,
    lastOfGroup: true
  },
  {
    title: 'CRM',
    icon: <KanbanSquareIcon size={'20px'} className="text-foreground" />,
    path: '/crm',
    group: 3
  },
  {
    title: 'Leads',
    icon: <SpeechIcon size={'20px'} className="text-foreground" />,
    path: '/crm/leads',
    group: 3
  },
  {
    title: 'Claims',
    icon: <ShieldCheckIcon size={'20px'} className="text-foreground" />,
    path: '/crm/claims',
    group: 3
  },
  {
    title: 'Requests',
    icon: <ClipboardListIcon size={'20px'} className="text-foreground" />,
    path: '/crm/requests',
    group: 3
  },
  {
    title: 'Commissions',
    icon: <DollarSignIcon size={'20px'} className="text-foreground" />,
    path: '/crm/commissions',
    group: 3
  },
  {
    title: 'Call Center',
    icon: <PhoneIncomingIcon size={'20px'} className="text-foreground" />,
    path: '/crm/call-center',
    group: 3,
    lastOfGroup: true
  },
  {
    title: 'Settings',
    icon: <SettingsIcon size={'20px'} className="text-foreground" />,
    path: '/settings',
    group: 4,
    lastOfGroup: false
  }
  // {
  //   title: "Profile",
  //   icon: <UserIcon size={'20px'} className="text-zinc-900 dark:text-zinc-300"/>,
  //   path: "/profile",
  //   group: 3,
  //   lastOfGroup: true
  // }
  // {
  //   title: "Settings",
  //   icon: <SettingsIcon size={'20px'} className="text-zinc-900 dark:text-zinc-300"/>,
  //   path: "/settings",
  //   group: 3
  // }
];
