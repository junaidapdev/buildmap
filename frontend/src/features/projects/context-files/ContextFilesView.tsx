import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import type { ContextFileType } from '@shared/schemas/context-files';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContextDocPanel } from '@/features/projects/context-files/ContextDocPanel';
import { ContextFilesPageActions } from '@/features/projects/context-files/ContextFilesPageActions';
import { CONTEXT_DOC_ORDER } from '@/features/projects/context-files/doc-config';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';
import type { ContextFilesState } from '@/features/projects/context-files/useAllContextFiles';
import { useDirtyGuard } from '@/features/projects/_shared/edit/useDirtyGuard';

type ContextFilesViewProps = {
  projectId: string;
  state: ContextFilesState;
};

export function ContextFilesView({ projectId, state }: ContextFilesViewProps) {
  const [activeTab, setActiveTab] = useState<ContextFileType>(CONTEXT_DOC_ORDER[0].type);
  const [dirty, setDirty] = useState(false);
  // When non-null, a tab switch is pending confirmation because the active doc has unsaved edits.
  const [pendingTab, setPendingTab] = useState<ContextFileType | null>(null);

  // Warn on browser refresh/close while an edit is unsaved (shared with the PRD/architecture editors).
  useDirtyGuard(dirty);

  function handleTabChange(next: string): void {
    const nextType = next as ContextFileType;
    if (nextType === activeTab) {
      return;
    }
    if (dirty) {
      // Hold the switch and ask before discarding the in-progress edit.
      setPendingTab(nextType);
      return;
    }
    setActiveTab(nextType);
  }

  function confirmSwitch(): void {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
      setDirty(false);
    }
  }

  function cancelSwitch(): void {
    setPendingTab(null);
  }

  return (
    <div className="space-y-6">
      <ContextFilesPageActions
        approvedCount={state.approvedCount}
        projectId={projectId}
        total={state.total}
      />

      <Tabs onValueChange={handleTabChange} value={activeTab}>
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          {CONTEXT_DOC_ORDER.map((meta) => {
            const approved = state.byType[meta.type]?.is_final ?? false;
            return (
              <TabsTrigger key={meta.type} value={meta.type}>
                {meta.label}
                {approved && (
                  <CheckCircle2
                    aria-label={CONTEXT_FILES_MESSAGES.TAB_APPROVED_LABEL}
                    className="h-3.5 w-3.5 text-green-600 dark:text-green-500"
                  />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CONTEXT_DOC_ORDER.map((meta) => (
          <TabsContent className="mt-6" key={meta.type} value={meta.type}>
            <ContextDocPanel meta={meta} onDirtyChange={setDirty} projectId={projectId} />
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            cancelSwitch();
          }
        }}
        open={pendingTab !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{CONTEXT_FILES_MESSAGES.SWITCH_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {CONTEXT_FILES_MESSAGES.SWITCH_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSwitch}>
              {CONTEXT_FILES_MESSAGES.SWITCH_CONFIRM_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitch}>
              {CONTEXT_FILES_MESSAGES.SWITCH_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
