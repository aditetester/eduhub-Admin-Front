export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    heading: "Dashboard",
    children: [
      {
        name: "Overview",
        icon: "solar:widget-add-line-duotone",
        id: uniqueId(),
        url: "/",
      },
    ],
  },
  {
    heading: "Academic Management",
    children: [
      {
        name: "Boards",
        icon: "solar:notebook-bookmark-bold-duotone",
        id: uniqueId(),
        url: "/ui/table"
      },
      {
        name: "Standards",
        icon: "solar:layers-minimalistic-bold-duotone",
        id: uniqueId(),
        url: "/ui/standards",
      },
      {
        name: "Subjects",
        icon: "solar:notebook-bold-duotone",
        id: uniqueId(),
        url: "/ui/subjects",
      },
    ],
  },
  {
    heading: "Content Management",
    children: [
      {
        name: "Resources",
        icon: "solar:ruler-pen-bold-duotone",
        id: uniqueId(),
        url: "/ui/resources",
      },
    ],
  },
  {
    heading: "User Management",
    children: [
      {
        name: "Students",
        icon: "solar:users-group-rounded-bold-duotone",
        id: uniqueId(),
        url: "/ui/students",
      },
      
    ],
  },
  {
    heading: "Analytics",
    children: [
    
      {
        name: "Purchases",
        icon: "solar:dollar-minimalistic-bold-duotone",
        id: uniqueId(),
        url: "/ui/purchases",
      },
    ],
  },
];

export default SidebarContent;
