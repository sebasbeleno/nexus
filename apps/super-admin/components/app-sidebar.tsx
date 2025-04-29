"use client"

import * as React from "react"
import {
  Bot,
  Frame,
  GalleryVerticalEnd,
  SquareTerminal,
  Users,
  Settings,
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
}

export function AppSidebar({ ...props }: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  
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
    navMain: [
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
      {
        title: "Organizaciones",
        url: "/organizations",
        icon: Bot,
        isActive: (pathname ?? "").startsWith("/organizations"),
        items: [
          {
            title: "Todas las organizaciones",
            url: "/organizations",
            isActive: pathname === "/organizations",
          },
          {
            title: "Editar",
            url: "/organizations/[name]/edit",
            isActive: (pathname ?? "").includes("/organizations/") && (pathname ?? "").endsWith("/edit"),
          },
          {
            title: "Usuarios",
            url: "/organizations/[name]/users",
            isActive: (pathname ?? "").includes("/organizations/") && (pathname ?? "").includes("/users"),
          },
        ],
      },
      {
        title: "Usuarios",
        url: "/users",
        icon: Users,
        isActive: pathname?.startsWith("/users") ?? false,
        items: [
          {
            title: "Todos los usuarios",
            url: "/users",
            isActive: pathname === "/users",
          },
          {
            title: "Editar usuario",
            url: "/users/[id]/edit",
            isActive: (pathname ?? "").includes("/users/") && (pathname ?? "").endsWith("/edit"),
          },
        ],
      },
      {
        title: "Configuración",
        url: "/settings",
        icon: Settings,
        isActive: pathname?.startsWith("/settings") ?? false,
      },
    ],
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
        <NavProjects projects={data.organizations} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.user} theme={theme} setTheme={setTheme} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
