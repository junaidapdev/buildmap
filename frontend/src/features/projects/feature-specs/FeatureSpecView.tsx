import { CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';

import type { FeatureSpecContent, FeatureSpecSectionKey } from '@shared/schemas/feature-spec';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { useDirtyGuard } from '@/features/projects/_shared/edit/useDirtyGuard';
import {
  FEATURE_SPEC_SECTION_LABELS,
  FEATURE_SPEC_SECTION_ORDER,
} from '@/features/projects/feature-specs/doc-config';
import { FeatureSpecSectionEditor } from '@/features/projects/feature-specs/edit/FeatureSpecSectionEditor';
import { FEATURE_SPEC_MESSAGES } from '@/features/projects/feature-specs/messages';
import { useApproveFeatureSpec } from '@/features/projects/feature-specs/useApproveFeatureSpec';
import type { FeatureSpecRow } from '@/features/projects/feature-specs/useExistingFeatureSpec';
import { useGenerateFeatureSpec } from '@/features/projects/feature-specs/useGenerateFeatureSpec';
import { useDownloadMarkdown } from '@/hooks/useDownloadMarkdown';
import { formatRelativeTime } from '@/lib/relative-time';
import { FILENAMES } from '@shared/export/filenames';

type FeatureSpecViewProps = {
  spec: FeatureSpecRow;
  chunk: Pick<ChunkRow, 'ref' | 'title'>;
  chunkId: string;
};

/**
 * Spec tab body. Layout mirrors the PRD page:
 *  - Doc toolbar with version + last-updated + (when approved) green Approved pill on the left;
 *    Approve / Regenerate all / Export on the right.
 *  - Sections list — numbered cards, brand-soft when the whole spec is approved, with per-section
 *    icon-only Edit + Regenerate actions in each card's header.
 *  - "Approved → next" guidance banner at the bottom; only rendered when the spec is final.
 */
export function FeatureSpecView({ spec, chunk, chunkId }: FeatureSpecViewProps) {
  const approve = useApproveFeatureSpec(chunkId);
  const generate = useGenerateFeatureSpec(chunkId);
  const downloadMarkdown = useDownloadMarkdown();
  const content = spec.content_json;
  const isApproved = spec.is_final;
  const canDownload = spec.content.trim().length > 0;
  const busy = approve.isPending || generate.isPending;

  const [dirtyMap, setDirtyMap] = useState<Partial<Record<FeatureSpecSectionKey, boolean>>>({});
  const anyDirty = Object.values(dirtyMap).some(Boolean);
  useDirtyGuard(anyDirty);

  const handleDirtyChange = useCallback((sectionKey: FeatureSpecSectionKey, dirty: boolean) => {
    setDirtyMap((previous) =>
      previous[sectionKey] === dirty ? previous : { ...previous, [sectionKey]: dirty },
    );
  }, []);

  // Saving invalidates the spec query, so the refetched row updates this view; nothing to do here.
  const handleSaved = useCallback((_content: FeatureSpecContent) => {}, []);

  return (
    <article className="space-y-6">
      {/*
        Doc toolbar. Same shape as PrdView / ArchitectureView. Left: version, last-updated,
        Approved pill. Right: Approve / Regenerate all / Export. Per-section Edit + Regenerate
        live inside each FeatureSpecSection (icon-only ghost buttons in the section header).
      */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{FEATURE_SPEC_MESSAGES.VERSION_LABEL(spec.version)}</Badge>
          {isApproved && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-soft-border bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-text">
              <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
              {FEATURE_SPEC_MESSAGES.APPROVED_BADGE}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {FEATURE_SPEC_MESSAGES.LAST_UPDATED_PREFIX}{' '}
            {formatRelativeTime(spec.updated_at, FEATURE_SPEC_MESSAGES.UPDATED_JUST_NOW)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isApproved && (
            <Button
              aria-busy={approve.isPending}
              disabled={busy}
              onClick={() => approve.mutate()}
              size="sm"
            >
              {approve.isPending
                ? FEATURE_SPEC_MESSAGES.APPROVE_BUTTON_BUSY
                : FEATURE_SPEC_MESSAGES.APPROVE_BUTTON}
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                aria-busy={generate.isPending}
                disabled={busy}
                size="sm"
                variant="outline"
              >
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                {generate.isPending
                  ? FEATURE_SPEC_MESSAGES.REGENERATE_BUSY
                  : FEATURE_SPEC_MESSAGES.REGENERATE_HEADER_BUTTON}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
                <AlertDialogDescription>
                  {FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_BODY}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_CANCEL}
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => generate.mutate()}>
                  {FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            disabled={!canDownload}
            onClick={() =>
              downloadMarkdown({
                filename: FILENAMES.featureSpec(chunk.ref, chunk.title),
                content: spec.content,
              })
            }
            size="sm"
            variant="outline"
          >
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
            {FEATURE_SPEC_MESSAGES.EXPORT_HEADER_BUTTON}
          </Button>
        </div>
      </div>

      {approve.isError && (
        <p className="text-sm text-destructive">{FEATURE_SPEC_MESSAGES.APPROVE_FAILED}</p>
      )}

      <div className="space-y-4">
        {FEATURE_SPEC_SECTION_ORDER.map((sectionKey, index) => (
          <FeatureSpecSectionEditor
            chunkId={chunkId}
            isApproved={isApproved}
            key={sectionKey}
            label={FEATURE_SPEC_SECTION_LABELS[sectionKey]}
            number={index + 1}
            onDirtyChange={handleDirtyChange}
            onSaved={handleSaved}
            sectionKey={sectionKey}
            specContent={content}
          />
        ))}
      </div>

      {isApproved && (
        <div className="border-t border-border-subtle pt-6">
          <Alert className="border-green-600/40 text-green-700 dark:border-green-500/40 dark:text-green-500 [&>svg]:text-green-600 dark:[&>svg]:text-green-500">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            <AlertTitle>{FEATURE_SPEC_MESSAGES.APPROVED_BANNER}</AlertTitle>
            <AlertDescription>{FEATURE_SPEC_MESSAGES.REGENERATE_HINT}</AlertDescription>
          </Alert>
        </div>
      )}
    </article>
  );
}
