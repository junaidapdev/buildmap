import { RefreshCw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import type { PrdContent, PrdSectionKey } from '@shared/schemas/prd';
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
import { PrdSection } from '@/features/projects/prd/PrdSection';
import { PRD_EDIT_MESSAGES } from '@/features/projects/prd/edit/messages';
import { getPrdSectionIssues } from '@/features/projects/prd/edit/section-validation';
import { useRegeneratePrdSection } from '@/features/projects/prd/edit/useRegeneratePrdSection';
import { useSavePrdSection } from '@/features/projects/prd/edit/useSavePrdSection';

type PrdSectionEditorProps<K extends PrdSectionKey> = {
  sectionKey: K;
  label: string;
  value: PrdContent[K];
  prdContent: PrdContent;
  projectId: string;
  /** Merge an edited section value back into the full content for saving. */
  stitch: (value: PrdContent[K]) => PrdContent;
  renderView: () => ReactNode;
  renderEditor: (draft: PrdContent[K], setDraft: (value: PrdContent[K]) => void) => ReactNode;
  onSaved: (content: PrdContent) => void;
  onDirtyChange: (sectionKey: PrdSectionKey, dirty: boolean) => void;
};

export function PrdSectionEditor<K extends PrdSectionKey>({
  sectionKey,
  label,
  value,
  stitch,
  projectId,
  renderView,
  renderEditor,
  onSaved,
  onDirtyChange,
}: PrdSectionEditorProps<K>) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draft, setDraft] = useState<PrdContent[K]>(value);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const save = useSavePrdSection(projectId);
  const regenerate = useRegeneratePrdSection(projectId);

  const isDirty = mode === 'edit' && JSON.stringify(draft) !== JSON.stringify(value);

  // Validate the edited section before allowing Save, so an empty/too-short field is caught inline
  // with a field-level message instead of failing opaquely on save (prd_save_invalid_local).
  const sectionIssues = mode === 'edit' ? getPrdSectionIssues(stitch(draft), sectionKey, label) : [];
  const sectionInvalid = sectionIssues.length > 0;

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
    if (sectionInvalid) {
      return;
    }
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
      const nextValue = result.value as PrdContent[K];
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
          {PRD_EDIT_MESSAGES.EDIT_BUTTON}
        </Button>
        <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
          <AlertDialogTrigger asChild>
            <Button aria-busy={regenerate.isPending} disabled={busy} size="sm" variant="ghost">
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              {regenerate.isPending
                ? PRD_EDIT_MESSAGES.REGENERATE_SECTION_BUSY
                : PRD_EDIT_MESSAGES.REGENERATE_SECTION_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{PRD_EDIT_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
              <AlertDialogDescription>
                {PRD_EDIT_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{PRD_EDIT_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
              <AlertDialogAction onClick={handleRegenerate}>
                {PRD_EDIT_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ) : null;

  return (
    <PrdSection action={actions} title={label}>
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
            <p className="mt-2 text-sm text-destructive">{PRD_EDIT_MESSAGES.REGENERATE_FAILED}</p>
          )}
        </>
      ) : (
        <div className="space-y-3 rounded-md border bg-muted/20 p-4">
          {renderEditor(draft, setDraft)}
          {sectionInvalid && (
            <div className="space-y-1 text-sm text-destructive">
              <p className="font-medium">{PRD_EDIT_MESSAGES.VALIDATION_HEADING}</p>
              <ul className="list-disc space-y-0.5 pl-5">
                {sectionIssues.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}
          {save.isError && (
            <p className="text-sm text-destructive">{PRD_EDIT_MESSAGES.SAVE_FAILED}</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button disabled={save.isPending} onClick={cancelEdit} size="sm" variant="outline">
              {PRD_EDIT_MESSAGES.CANCEL_BUTTON}
            </Button>
            <Button
              aria-busy={save.isPending}
              disabled={save.isPending || sectionInvalid}
              onClick={handleSave}
              size="sm"
            >
              {save.isPending ? PRD_EDIT_MESSAGES.SAVE_BUTTON_BUSY : PRD_EDIT_MESSAGES.SAVE_BUTTON}
            </Button>
          </div>
        </div>
      )}
    </PrdSection>
  );
}
