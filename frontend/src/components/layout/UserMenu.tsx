import { LogOut, Settings } from 'lucide-react';
import { type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/useAuth';

/**
 * Derives a stable, deterministic muted hue from the email's first character so two users with
 * different addresses get visually distinct (but always tonal, not garish) avatar backgrounds.
 * Uses oklch so chroma stays consistent across hues — the avatar should read as a tinted muted
 * neutral, never a saturated color.
 */
function avatarStyleFor(email: string | undefined): CSSProperties {
  const seed = email ? email.charCodeAt(0) * 7 : 0;
  const hue = (seed * 37) % 360;
  return {
    background: `oklch(0.88 0.05 ${hue})`,
    color: `oklch(0.30 0.10 ${hue})`,
  };
}

/**
 * User dropdown in the topbar. Trigger is a 32px avatar tinted by the user's email; the menu
 * shows the current email, a link to settings, and a sign-out item that routes to `/`
 * (Chunk 30 behavior preserved).
 */
export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const email = user?.email ?? 'Signed in';
  const avatarFallback = user?.email?.charAt(0).toUpperCase() ?? '?';

  async function handleSignOut(): Promise<void> {
    await signOut();
    // Chunk 30: post-sign-out redirects land on the public landing page (`/`).
    navigate(ROUTES.HOME, { replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open user menu"
          className="h-8 w-8 rounded-full"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Avatar className="size-8">
            <AvatarFallback
              className="text-[11px] font-semibold tracking-tight"
              style={avatarStyleFor(user?.email ?? undefined)}
            >
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={ROUTES.USER_SETTINGS}>
            <Settings aria-hidden="true" className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleSignOut()}>
          <LogOut aria-hidden="true" className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
