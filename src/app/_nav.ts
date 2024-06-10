import { INavData } from "@coreui/angular";

export const navItems: INavData[] = [
  {
    name: "USSD Module",
    url: "/overview",
    icon: "icon-speedometer",
    children: [
      {
        name: "Overview",
        url: "/overview",
        icon: "icon-star",
      },
      {
        name: "Ussd Setup",
        url: "/ussd/ussd-setup",
        icon: "icon-screen-smartphone",
      },
      {
        name: "Ussd Adapter",
        url: "/ussd/ussd-adapter",
        icon: "icon-screen-smartphone",
      },
      {
        name: "Ussd Simulator",
        url: "/ussd/ussd-simulator",
        icon: "icon-screen-smartphone",
      },
      {
        name: "Ussd Testing",
        url: "/ussd/ussd-testing",
        icon: "icon-screen-smartphone",
      },
    ],
  },
  {
    name: "Configurations",
    url: "/overview",
    icon: "icon-speedometer",
    children: [
      {
        name: "Pages",
        url: "/ussd/ussd-pages",
        icon: "icon-star",
      },
      {
        name: "Prompts",
        url: "/ussd/ussd-prompts",
        icon: "icon-star",
      },
      {
        name: "Meta-Data Info",
        url: "/ussd/ussd-metadata",
        icon: "icon-star",
      },
      {
        name: "Server Environments",
        url: "/ussd/ussd-environments",
        icon: "icon-screen-smartphone",
      },
      {
        name: "API Endpoints",
        url: "/ussd/ussd-endpoints",
        icon: "icon-screen-smartphone",
      },
    ],
  },
  {
    name: "User Management",
    url: "/ussd/list-users",
    icon: "icon-speedometer",
    children: [
      {
        name: "Users",
        url: "/ussd/list-users",
        icon: "icon-screen-smartphone",
      },
      // {
      //   name: "Register",
      //   url: "/auth/register",
      //   icon: "icon-screen-smartphone",
      // },
    ],
  },
  // {
  //   name: "Redis db Mngt",
  //   url: "/ussd/redis-db-mngt",
  //   icon: "icon-speedometer",
  //   children: [
  //     {
  //       name: "Redis db Mngt",
  //       url: "/ussd/redis-db-mngt",
  //       icon: "icon-screen-smartphone",
  //     }
  //   ]
  // },

  // {
  //   name: 'USSD Module',
  //   url: '/ussd/projects',
  //   icon: 'icon-puzzle',
  // },

  // {
  //   title: true,
  //   name: 'Collections',
  //   icon: 'money'
  // },
];
