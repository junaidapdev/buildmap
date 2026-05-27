import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/useAuth';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const email = user?.email ?? 'Signed in';
  const avatarFallback = user?.email?.charAt(0).toUpperCase() ?? '?';

  async function handleSignOut(): Promise<void> {
    navigate(ROUTES.HOME, { replace: true });
    await signOut();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Open user menu"
        >
          <Avatar className="size-9">
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem
              aria-disabled="true"
              className="cursor-not-allowed text-muted-foreground"
              onSelect={(event) => event.preventDefault()}
            >
              <Settings aria-hidden="true" />
              Settings
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent side="left">Available in Chunk 29</TooltipContent>
        </Tooltip>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleSignOut()}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
