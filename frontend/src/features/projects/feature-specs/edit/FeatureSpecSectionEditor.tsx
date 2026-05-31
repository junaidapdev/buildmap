import { Pencil, RefreshCw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { getAiErrorCopy } from '@/features/_shared/ai-error-copy';
import { FeatureSpecSection } from '@/features/projects/feature-specs/FeatureSpecSection';
import { FEATURE_SPEC_EDIT_MESSAGES } from '@/features/projects/feature-specs/edit/messages';
import { getFeatureSpecSectionIssue } from '@/features/projects/feature-specs/edit/section-validation';
import { useRegenerateFeatureSpecSection } from '@/features/projects/feature-specs/edit/useRegenerateFeatureSpecSection';
import { useSaveFeatureSpecSection } from '@/features/projects/feature-specs/edit/useSaveFeatureSpecSection';
import { cn } from '@/lib/utils';

type FeatureSpecSectionEditorProps = {
  sectionKey: FeatureSpecSectionKey;
  label: string;
  /** 1-indexed section number passed through to FeatureSpecSection for the "01", "02"… caption. */
  number: number;
  /** Reflects the spec's global is_final; FeatureSpecView passes the same value to every section. */
  isApproved?: boolean;
  specContent: FeatureSpecContent;
  chunkId: string;
  onSaved: (content: FeatureSpecContent) => void;
  onDirtyChange: (sectionKey: FeatureSpecSectionKey, dirty: boolean) => void;
};

/**
 * One spec section: a markdown view with Edit and Regenerate actions. Edit mode is a single
 * textarea (the section is a markdown string, so no structured editor is needed). Save stitches
 * the edited section into the full content_json and persists the whole object; regenerate fetches
 * new markdown for just this section, then stitches and saves.
 *
 * Visual chrome (numbered eyebrow, brand-soft tint when approved, icon-only action cluster) lives
 * in FeatureSpecSection — this editor calls it ONCE per render, swapping the body content per
 * mode.
 */
export function FeatureSpecSectionEditor({
  sectionKey,
  label,
  number,
  isApproved,
  specContent,
  chunkId,
  onSaved,
  onDirtyChange,
}: FeatureSpecSectionEditorProps) {
  const value = specContent[sectionKey];
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [draft, setDraft] = useState(value);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const save = useSaveFeatureSpecSection(chunkId);
  const regenerate = useRegenerateFeatureSpecSection(chunkId);

  const isDirty = mode === 'edit' && draft !== value;

  // Validate the section's draft before allowing Save, so a too-short/too-long field is caught
  // inline with a field-level message instead of failing opaquely on save.
  const sectionError =
    mode === 'edit' ? getFeatureSpecSectionIssue(draft, sectionKey, label) : null;

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
    if (sectionError) {
      return;
    }
    const nextContent: FeatureSpecContent = { ...specContent, [sectionKey]: draft };
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
    const trimmed = instruction.trim();
    try {
      const result = await regenerate.mutateAsync({
        sectionKey,
        userInstruction: trimmed.length > 0 ? trimmed : undefined,
      });
      const nextContent: FeatureSpecContent = { ...specContent, [sectionKey]: result.content };
      await save.mutateAsync(nextContent);
      setDraft(result.content);
      setInstruction('');
      onSaved(nextContent);
      setMode('view');
    } catch {
      // regenerate.isError / save.isError drive the inline message.
    }
  }

  const busy = regenerate.isPending || save.isPending;
  const canSave = draft !== value && sectionError === null && !save.isPending;

  // Icon-only Edit + Regenerate cluster; shown in view mode (edit mode has its own
  // Save/Cancel pair inside the body) and hidden during regenerate.
  const actions: ReactNode =
    mode === 'view' && !regenerate.isPending ? (
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          aria-label={FEATURE_SPEC_EDIT_MESSAGES.EDIT_BUTTON}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          disabled={busy}
          onClick={startEdit}
          size="icon"
          variant="ghost"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
        </Button>
        <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
          <AlertDialogTrigger asChild>
            <Button
              aria-busy={regenerate.isPending}
              aria-label={
                regenerate.isPending
                  ? FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_SECTION_BUSY
                  : FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_SECTION_BUTTON
              }
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled={busy}
              size="icon"
              variant="ghost"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn('h-4 w-4', regenerate.isPending && 'animate-spin')}
              />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_CONFIRM_TITLE}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor={`feature-spec-regen-instruction-${sectionKey}`}
              >
                {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_INSTRUCTION_LABEL}
              </label>
              <Textarea
                id={`feature-spec-regen-instruction-${sectionKey}`}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder={FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_INSTRUCTION_PLACEHOLDER}
                rows={3}
                value={instruction}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_CONFIRM_CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleRegenerate}>
                {FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ) : null;

  // Body content per mode.
  let body: ReactNode;
  if (regenerate.isPending) {
    body = (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  } else if (mode === 'edit') {
    body = (
      <div className="space-y-3 rounded-md border border-border-subtle bg-muted/20 p-4">
        <p className="text-xs text-muted-foreground">{FEATURE_SPEC_EDIT_MESSAGES.EDITOR_HINT}</p>
        <Textarea
          className="font-mono text-sm leading-relaxed"
          onChange={(event) => setDraft(event.target.value)}
          rows={16}
          spellCheck={false}
          value={draft}
        />
        {sectionError && <p className="text-sm text-destructive">{sectionError}</p>}
        {save.isError && (
          <p className="text-sm text-destructive">{FEATURE_SPEC_EDIT_MESSAGES.SAVE_FAILED}</p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button disabled={save.isPending} onClick={cancelEdit} size="sm" variant="outline">
            {FEATURE_SPEC_EDIT_MESSAGES.CANCEL_BUTTON}
          </Button>
          <Button aria-busy={save.isPending} disabled={!canSave} onClick={handleSave} size="sm">
            {save.isPending
              ? FEATURE_SPEC_EDIT_MESSAGES.SAVE_BUTTON_BUSY
              : FEATURE_SPEC_EDIT_MESSAGES.SAVE_BUTTON}
          </Button>
        </div>
      </div>
    );
  } else {
    // View mode: rendered markdown + (when applicable) inline error from the last failed action.
    body = (
      <>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
        {(regenerate.isError || save.isError) && (
          <p className="mt-2 text-sm text-destructive">
            {regenerate.isError
              ? getAiErrorCopy(regenerate.error, FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_FAILED)
              : FEATURE_SPEC_EDIT_MESSAGES.REGENERATE_FAILED}
          </p>
        )}
      </>
    );
  }

  return (
    <FeatureSpecSection action={actions} isApproved={isApproved} number={number} title={label}>
      {body}
    </FeatureSpecSection>
  );
}
