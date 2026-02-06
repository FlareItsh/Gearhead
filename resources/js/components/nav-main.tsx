import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { type NavItem } from '@/types'
import { router, usePage } from '@inertiajs/react'

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage()
  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={page.url.startsWith(
                typeof item.href === 'string' ? item.href : item.href.url,
              )}
              tooltip={{ children: item.title }}
              onClick={() =>
                router.visit(typeof item.href === 'string' ? item.href : item.href.url, {
                  preserveState: true,
                  preserveScroll: false,
                })
              }
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
