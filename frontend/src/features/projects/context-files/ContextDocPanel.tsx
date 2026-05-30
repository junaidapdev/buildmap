import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ContextDocActions } from '@/features/projects/context-files/ContextDocActions';
import { ContextDocApprovalBanner } from '@/features/projects/context-files/ContextDocApprovalBanner';
import { ContextDocEditor } from '@/features/projects/context-files/ContextDocEditor';
import { ContextDocViewer } from '@/features/projects/context-files/ContextDocViewer';
import type { ContextDocMeta } from '@/features/projects/context-files/doc-config';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';
import { useApproveContextFile } from '@/features/projects/context-files/useApproveContextFile';
import { useContextFile } from '@/features/projects/context-files/useContextFile';
import { useRegenerateContextDoc } from '@/features/projects/context-files/useRegenerateContextDoc';
import { formatRelativeTime } from '@/lib/relative-time';

type ContextDocPanelProps = {
  projectId: string;
  meta: ContextDocMeta;
  /** Bubbles the editor's unsaved-changes state up to the tab-switch guard. */
  onDirtyChange: (dirty: boolean) => void;
};

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

  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{meta.label}</h2>
          <p className="text-xs text-muted-foreground">{meta.filename}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{CONTEXT_FILES_MESSAGES.VERSION_LABEL(doc.version)}</Badge>
          <span className="text-xs text-muted-foreground">
            {CONTEXT_FILES_MESSAGES.LAST_UPDATED_PREFIX}{' '}
            {formatRelativeTime(doc.updated_at, CONTEXT_FILES_MESSAGES.UPDATED_JUST_NOW)}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{meta.description}</p>

      {doc.is_final && mode === 'view' && !regenerate.isPending && <ContextDocApprovalBanner />}

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
        </div>
      ) : (
        <>
          <ContextDocViewer content={doc.content} />
          <ContextDocActions
            content={doc.content}
            isApproving={approve.isPending}
            isFinal={doc.is_final}
            isRegenerating={regenerate.isPending}
            onApprove={() => approve.mutate({ type: meta.type })}
            onEdit={() => setMode('edit')}
            onRegenerate={() => regenerate.mutate({ type: meta.type })}
            type={meta.type}
          />
          {(approve.isError || regenerate.isError) && (
            <p className="text-sm text-destructive">
              {regenerate.isError
                ? CONTEXT_FILES_MESSAGES.REGENERATE_FAILED
                : CONTEXT_FILES_MESSAGES.APPROVE_FAILED}
            </p>
          )}
        </>
      )}
    </article>
  );
}
