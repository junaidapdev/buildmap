import { CheckCircle2, FileText } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAiErrorCopy } from '@/features/_shared/ai-error-copy';
import { ContextDocActions } from '@/features/projects/context-files/ContextDocActions';
import { ContextDocEditor } from '@/features/projects/context-files/ContextDocEditor';
import { ContextDocViewer } from '@/features/projects/context-files/ContextDocViewer';
import type { ContextDocMeta } from '@/features/projects/context-files/doc-config';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';
import { useApproveContextFile } from '@/features/projects/context-files/useApproveContextFile';
import { useContextFile } from '@/features/projects/context-files/useContextFile';
import { useRegenerateContextDoc } from '@/features/projects/context-files/useRegenerateContextDoc';
import { formatRelativeTime } from '@/lib/relative-time';
import { cn } from '@/lib/utils';

type ContextDocPanelProps = {
  projectId: string;
  meta: ContextDocMeta;
  /** Bubbles the editor's unsaved-changes state up to the tab-switch guard. */
  onDirtyChange: (dirty: boolean) => void;
};

/**
 * Single-doc card. Card header: file icon + label + mono filename pill + icon-only action cluster
 * (Copy / Edit / Regenerate). Card body: rendered markdown (or the markdown editor in edit mode).
 * Below the card: meta row (version + last-updated + Approved chip) and a stand-alone Approve
 * button when not yet approved.
 *
 * Edit-mode swaps the body for the textarea editor; regenerate-mode shows skeletons. Layout is
 * stable across modes — the card chrome doesn't shift.
 */
export function ContextDocPanel({ projectId, meta, onDirtyChange }: ContextDocPanelProps) {
  const { doc } = useContextFile(projectId, meta.type);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const approve = useApproveContextFile(projectId);
  const regenerate = useRegenerateContextDoc(projectId);

  // The parent only mounts a panel for a doc that exists; this guards the type narrowing.
  if (!doc) {
    return null;
  }

  function handleCancelEdit(): void {
    onDirtyChange(false);
    setMode('view');
  }

  function handleSaved(): void {
    onDirtyChange(false);
    setMode('view');
  }

  const isApproved = doc.is_final;

  return (
    <article className="space-y-4">
      <div
        className={cn(
          'overflow-hidden rounded-lg border transition-colors',
          isApproved
            ? 'border-brand-soft-border bg-brand-soft/40'
            : 'border-border bg-card',
        )}
      >
        <header
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3',
            isApproved ? 'border-brand-soft-border' : 'border-border-subtle',
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <FileText
              aria-hidden="true"
              className={cn(
                'h-4 w-4 shrink-0',
                isApproved ? 'text-brand-text' : 'text-muted-foreground',
              )}
            />
            <h2
              className={cn(
                'text-[16px] font-semibold tracking-tight',
                isApproved ? 'text-brand-text' : 'text-foreground',
              )}
            >
              {meta.label}
            </h2>
            <span className="inline-flex items-center rounded-md border border-border-subtle bg-subtle/60 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {meta.filename}
            </span>
            {isApproved && (
              <CheckCircle2
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-brand-text"
              />
            )}
          </div>
          {mode === 'view' && !regenerate.isPending && (
            <ContextDocActions
              content={doc.content}
              isRegenerating={regenerate.isPending}
              onEdit={() => setMode('edit')}
              onRegenerate={() => regenerate.mutate({ type: meta.type })}
              type={meta.type}
            />
          )}
        </header>

        <div className="px-5 py-4">
          {mode === 'edit' ? (
            <ContextDocEditor
              doc={doc}
              onCancel={handleCancelEdit}
              onDirtyChange={onDirtyChange}
              onSaved={handleSaved}
              projectId={projectId}
            />
          ) : regenerate.isPending ? (
            <div aria-live="polite" className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : (
            <ContextDocViewer content={doc.content} />
          )}
        </div>
      </div>

      {/* Footer meta row: version + last-updated on the left; Approve CTA on the right when
          the doc isn't yet approved. Hides while editing or regenerating to avoid mid-flow noise. */}
      {mode === 'view' && !regenerate.isPending && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center rounded border border-border-subtle bg-subtle/60 px-1.5 py-0.5 font-mono text-[11px]">
              {CONTEXT_FILES_MESSAGES.VERSION_LABEL(doc.version)}
            </span>
            <span>
              {CONTEXT_FILES_MESSAGES.LAST_UPDATED_PREFIX}{' '}
              {formatRelativeTime(doc.updated_at, CONTEXT_FILES_MESSAGES.UPDATED_JUST_NOW)}
            </span>
          </div>
          {!isApproved && (
            <Button
              aria-busy={approve.isPending}
              disabled={approve.isPending || regenerate.isPending}
              onClick={() => approve.mutate({ type: meta.type })}
              size="sm"
            >
              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
              {approve.isPending
                ? CONTEXT_FILES_MESSAGES.APPROVE_BUSY
                : CONTEXT_FILES_MESSAGES.APPROVE_BUTTON}
            </Button>
          )}
        </div>
      )}

      {(approve.isError || regenerate.isError) && mode === 'view' && (
        <p className="text-sm text-destructive">
          {regenerate.isError
            ? getAiErrorCopy(regenerate.error, CONTEXT_FILES_MESSAGES.REGENERATE_FAILED)
            : CONTEXT_FILES_MESSAGES.APPROVE_FAILED}
        </p>
      )}
    </article>
  );
}
