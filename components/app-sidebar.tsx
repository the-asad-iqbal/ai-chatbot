'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { PanelLeft } from 'lucide-react';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, isMobile, open, setOpen } = useSidebar();

  return (
    <Sidebar className="group-data-[side=right]:border-l-0 rounded-l-md">
      <SidebarHeader className='rounded-r-md'>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-10 h-fit"
                  onClick={() => {
                    setOpen(!open)
                    isMobile && setOpenMobile(false);
                  }}
                >
                  <PanelLeft size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Toggle Sidebar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="w-10 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter className='rounded-r-md'>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
