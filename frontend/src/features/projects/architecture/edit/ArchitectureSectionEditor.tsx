import { RefreshCw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import type { ArchitectureContent, ArchitectureSectionKey } from '@shared/schemas/architecture';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArchitectureSection } from '@/features/projects/architecture/ArchitectureSection';
import { ARCHITECTURE_EDIT_MESSAGES } from '@/features/projects/architecture/edit/messages';
import { useRegenerateArchitectureSection } from '@/features/projects/architecture/edit/useRegenerateArchitectureSection';
import { useSaveArchitectureSection } from '@/features/projects/architecture/edit/useSaveArchitectureSection';

type ArchitectureSectionEditorProps<K extends ArchitectureSectionKey> = {
  sectionKey: K;
  label: string;
  value: ArchitectureContent[K];
  projectId: string;
  /** Merge an edited section value back into the full content for saving. */
  stitch: (value: ArchitectureContent[K]) => ArchitectureContent;
  renderView: () => ReactNode;
  renderEditor: (
    draft: ArchitectureContent[K],
    setDraft: (value: ArchitectureContent[K]) => void,
  ) => ReactNode;
  onSaved: (content: ArchitectureContent) => void;
  onDirtyChange: (sectionKey: ArchitectureSectionKey, dirty: boolean) => void;
};

export function ArchitectureSectionEditor<K extends ArchitectureSectionKey>({
  sectionKey,
  label,
  value,
  stitch,
  projectId,
  renderView,
  renderEditor,
  onSaved,
  onDirtyChange,
}: ArchitectureSectionEditorProps<K>) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draft, setDraft] = useState<ArchitectureContent[K]>(value);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const save = useSaveArchitectureSection(projectId);
  const regenerate = useRegenerateArchitectureSection(projectId);

  const isDirty = mode === 'edit' && JSON.stringify(draft) !== JSON.stringify(value);

  useEffect(() => {
    onDirtyChange(sectionKey, isDirty);
  }, [isDirty, onDirtyChange, sectionKey]);

  function startEdit(): void {
    setDraft(value);
    setMode('edit');
  }

  function cancelEdit(): void {
    setDraft(value);
    setMode('view');
  }

  async function handleSave(): Promise<void> {
    const nextContent = stitch(draft);
    try {
      await save.mutateAsync(nextContent);
      onSaved(nextContent);
      setMode('view');
    } catch {
      // save.isError drives the inline message.
    }
  }

  async function handleRegenerate(): Promise<void> {
    setConfirmOpen(false);
    try {
      const result = await regenerate.mutateAsync(sectionKey);
      // The Edge Function validated result.sectionKey === sectionKey, so value matches this section.
      const nextValue = result.value as ArchitectureContent[K];
      const nextContent = stitch(nextValue);
      await save.mutateAsync(nextContent);
      setDraft(nextValue);
      onSaved(nextContent);
      setMode('view');
    } catch {
      // regenerate.isError / save.isError drive the inline message.
    }
  }

  const busy = regenerate.isPending || save.isPending;

  const actions =
    mode === 'view' ? (
      <div className="flex shrink-0 gap-1">
        <Button disabled={busy} onClick={startEdit} size="sm" variant="ghost">
          {ARCHITECTURE_EDIT_MESSAGES.EDIT_BUTTON}
        </Button>
        <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
          <AlertDialogTrigger asChild>
            <Button aria-busy={regenerate.isPending} disabled={busy} size="sm" variant="ghost">
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              {regenerate.isPending
                ? ARCHITECTURE_EDIT_MESSAGES.REGENERATE_SECTION_BUSY
                : ARCHITECTURE_EDIT_MESSAGES.REGENERATE_SECTION_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_TITLE}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleRegenerate}>
                {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ) : null;

  return (
    <ArchitectureSection action={actions} title={label}>
      {regenerate.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : mode === 'view' ? (
        <>
          {renderView()}
          {(regenerate.isError || save.isError) && (
            <p className="mt-2 text-sm text-destructive">
              {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_FAILED}
            </p>
          )}
        </>
      ) : (
        <div className="space-y-3 rounded-md border bg-muted/20 p-4">
          {renderEditor(draft, setDraft)}
          {save.isError && (
            <p className="text-sm text-destructive">{ARCHITECTURE_EDIT_MESSAGES.SAVE_FAILED}</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button disabled={save.isPending} onClick={cancelEdit} size="sm" variant="outline">
              {ARCHITECTURE_EDIT_MESSAGES.CANCEL_BUTTON}
            </Button>
            <Button
              aria-busy={save.isPending}
              disabled={save.isPending}
              onClick={handleSave}
              size="sm"
            >
              {save.isPending
                ? ARCHITECTURE_EDIT_MESSAGES.SAVE_BUTTON_BUSY
                : ARCHITECTURE_EDIT_MESSAGES.SAVE_BUTTON}
            </Button>
          </div>
        </div>
      )}
    </ArchitectureSection>
  );
}
