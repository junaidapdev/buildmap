import { CheckCircle2, FileText } from 'lucide-react';
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
import { ContextDocSidebar } from '@/features/projects/context-files/ContextDocSidebar';
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
      <ContextFilesPageActions projectId={projectId} state={state} />

      <Tabs onValueChange={handleTabChange} value={activeTab}>
        {/*
          Underlined-tab variant of shadcn's pill TabsList — flat row with a single bottom rule,
          per-trigger bottom underline on the active tab. Each trigger shows file icon + label +
          mono filename so the user can scan by filename without opening the tab. The row scrolls
          horizontally on narrow viewports rather than wrapping (matches the mockup's row of tabs).
        */}
        <TabsList className="flex h-auto items-center justify-start gap-0 overflow-x-auto rounded-none border-b border-border-subtle bg-transparent p-0">
          {CONTEXT_DOC_ORDER.map((meta) => {
            const approved = state.byType[meta.type]?.is_final ?? false;
            return (
              <TabsTrigger
                className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2.5 text-[13px] font-medium data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                key={meta.type}
                value={meta.type}
              >
                <FileText aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{meta.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {meta.filename}
                </span>
                {approved && (
                  <CheckCircle2
                    aria-label={CONTEXT_FILES_MESSAGES.TAB_APPROVED_LABEL}
                    className="h-3 w-3 text-brand-text"
                  />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CONTEXT_DOC_ORDER.map((meta) => (
          <TabsContent className="mt-6" key={meta.type} value={meta.type}>
            {/*
              Two-column body: doc card on the left (lg:col-span-2), info sidebar on the right
              (lg:col-span-1). Stacks on small screens.
            */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ContextDocPanel meta={meta} onDirtyChange={setDirty} projectId={projectId} />
              </div>
              <ContextDocSidebar meta={meta} />
            </div>
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
