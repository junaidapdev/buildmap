import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download } from '@/features/projects/overview/icons';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { PanelCard } from '@/features/projects/overview/PanelCard';

export function ExportShortcutPanel() {
  return (
    <PanelCard
      icon={<Download aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={OVERVIEW_MESSAGES.EXPORT_TITLE}
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{OVERVIEW_MESSAGES.EXPORT_BODY}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Wrapper keeps the tooltip reachable while the underlying button is disabled. */}
            <span className="inline-block">
              <Button aria-disabled="true" disabled size="sm" variant="outline">
                {OVERVIEW_MESSAGES.EXPORT_CTA}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{OVERVIEW_MESSAGES.EXPORT_PENDING_TOOLTIP}</TooltipContent>
        </Tooltip>
      </div>
    </PanelCard>
  );
}
