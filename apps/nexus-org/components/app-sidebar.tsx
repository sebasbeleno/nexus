"use client"

import * as React from "react"
import {
  Bot,
  Frame,
  GalleryVerticalEnd,
  SquareTerminal,
  Users,
  Settings,
  LayoutDashboard, // Added
  ClipboardList, // Added
  BarChart2, // Added
  Building, // Added
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { User } from "@supabase/supabase-js"
import { useTheme } from "next-themes"

interface AppSidebarProps {
  user: User,
  isAdmin?: boolean; // Added isAdmin prop
}

export function AppSidebar({ isAdmin = false, ...props }: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()

  // Define base navigation items
  const baseNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: pathname === "/dashboard" || pathname === "/",
      items: [
        {
          title: "Inicio",
          url: "/dashboard",
          isActive: pathname === "/dashboard",
        },
      ],
    },
    // ... other non-admin items if any
  ]

  // Define admin-specific navigation items
  const adminNavItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: pathname === "/admin",
    },
    {
      title: "Manage surveys",
      url: "/admin/surveys",
      icon: ClipboardList,
      isActive: pathname?.startsWith("/admin/surveys"),
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart2,
      isActive: pathname?.startsWith("/admin/analytics"),
    },
    {
      title: "Manage users",
      url: "/admin/users",
      icon: Users,
      isActive: pathname?.startsWith("/admin/users"),
    },
    {
      title: "Organizations",
      url: "/admin/organizations",
      icon: Building,
      isActive: pathname?.startsWith("/admin/organizations"),
    },
    {
      title: "User Settings",
      url: "/admin/settings",
      icon: Settings,
      isActive: pathname?.startsWith("/admin/settings"),
    },
  ]

  // Combine items based on isAdmin prop
  const navMainItems = isAdmin ? adminNavItems : baseNavItems


  // This is updated data with proper routes
  const data = {
    user: {
      name: "Sebastian",
      email: "seebasbeleno15@gmail.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Sensia",
        logo: GalleryVerticalEnd,
      },
    ],
    navMain: navMainItems, // Use combined items
    organizations: [
      {
        name: "Alcaldia de Medellin",
        url: "#",
        icon: Frame,
      },
    ],
  }
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* Conditionally render NavProjects or other sections if needed */}
        {/* <NavProjects projects={data.organizations} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.user} theme={theme} setTheme={setTheme} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
