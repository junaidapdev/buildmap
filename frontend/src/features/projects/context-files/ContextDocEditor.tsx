import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';
import type { ContextFileRow } from '@/features/projects/context-files/useAllContextFiles';
import { useSaveContextFile } from '@/features/projects/context-files/useSaveContextFile';

type ContextDocEditorProps = {
  doc: ContextFileRow;
  projectId: string;
  onCancel: () => void;
  onSaved: () => void;
  /** Bubbles unsaved-changes state up so the parent can guard tab switches and page unload. */
  onDirtyChange: (dirty: boolean) => void;
};

export function ContextDocEditor({
  doc,
  projectId,
  onCancel,
  onSaved,
  onDirtyChange,
}: ContextDocEditorProps) {
  const [draft, setDraft] = useState(doc.content);
  const save = useSaveContextFile(projectId);

  const isDirty = draft !== doc.content;
  const canSave = isDirty && draft.trim().length > 0 && !save.isPending;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // Clear the dirty flag if this editor unmounts (e.g. the parent swaps panels) so no stale unsaved
  // state lingers in the tab-switch guard.
  useEffect(() => {
    return () => onDirtyChange(false);
  }, [onDirtyChange]);

  async function handleSave(): Promise<void> {
    try {
      await save.mutateAsync({ type: doc.type, content: draft });
      onDirtyChange(false);
      onSaved();
    } catch {
      // save.isError drives the inline message.
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium" htmlFor={`context-doc-editor-${doc.type}`}>
          {CONTEXT_FILES_MESSAGES.EDITOR_LABEL}
        </label>
        <p className="text-xs text-muted-foreground">{CONTEXT_FILES_MESSAGES.EDITOR_HINT}</p>
      </div>
      <Textarea
        className="font-mono text-sm leading-relaxed"
        id={`context-doc-editor-${doc.type}`}
        onChange={(event) => setDraft(event.target.value)}
        rows={24}
        spellCheck={false}
        value={draft}
      />
      {save.isError && (
        <p className="text-sm text-destructive">{CONTEXT_FILES_MESSAGES.SAVE_FAILED}</p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button disabled={save.isPending} onClick={onCancel} size="sm" variant="outline">
          {CONTEXT_FILES_MESSAGES.CANCEL_BUTTON}
        </Button>
        <Button aria-busy={save.isPending} disabled={!canSave} onClick={handleSave} size="sm">
          {save.isPending ? CONTEXT_FILES_MESSAGES.SAVE_BUSY : CONTEXT_FILES_MESSAGES.SAVE_BUTTON}
        </Button>
      </div>
    </div>
  );
}
