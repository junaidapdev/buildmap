import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/constants/routes';
import { ChunkHeader } from '@/features/projects/feature-specs/ChunkHeader';
import { FeatureSpecTab } from '@/features/projects/feature-specs/FeatureSpecTab';
import { NotesTab } from '@/features/projects/feature-specs/NotesTab';
import { PromptTab } from '@/features/projects/feature-specs/PromptTab';
import { FEATURE_SPEC_MESSAGES } from '@/features/projects/feature-specs/messages';
import { useChunk } from '@/features/projects/feature-specs/useChunk';
import { useProject } from '@/features/projects/layout/useProject';
import { useDocumentTitle } from '@/lib/document-title';

type TabValue = 'spec' | 'prompt' | 'notes';

export function ChunkDetailPage() {
  const { id, chunkId } = useParams<{ id: string; chunkId: string }>();
  // ProjectLayout has loaded the project before this nested route mounts.
  const { project } = useProject();
  // Hook called unconditionally (disabled when chunkId is absent) to keep hook order stable.
  const chunkQuery = useChunk(chunkId ?? '');
  // Controlled tabs so the Prompt tab's SpecRequired state can deep-link back to the Spec tab,
  // and so the header's "View prompt" button can snap to the Prompt panel.
  const [tab, setTab] = useState<TabValue>('spec');

  // Title hook stays above the Navigate early return so hook order is stable across renders.
  // Falls back to a generic "Chunk" while the chunk row is loading.
  const chunkTitle = chunkQuery.data?.title ?? 'Chunk';
  useDocumentTitle(`${chunkTitle} — ${project.name || 'Project'} — buildmap`);

  if (!id || !chunkId) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

  if (chunkQuery.isPending) {
    return (
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (chunkQuery.isError || !chunkQuery.data) {
    return (
      <div className="mx-auto max-w-7xl">
        <section className="flex flex-col items-center py-16 text-center" role="alert">
          <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
            <AlertCircle aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">{FEATURE_SPEC_MESSAGES.PAGE_LOAD_ERROR_TITLE}</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            {FEATURE_SPEC_MESSAGES.PAGE_LOAD_ERROR_BODY}
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline">
              <Link to={ROUTES.PROJECT_CHUNKS(id)}>{FEATURE_SPEC_MESSAGES.BACK_TO_BOARD}</Link>
            </Button>
            <Button onClick={() => void chunkQuery.refetch()}>
              {FEATURE_SPEC_MESSAGES.ERROR_RETRY}
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const chunk = chunkQuery.data;

  return (
    // max-w-7xl matches the rest of the project surfaces so the chunk detail page shares the
    // same viewport rhythm as Overview / Brief / PRD / Architecture / Context Files / Progress.
    <div className="mx-auto max-w-7xl space-y-6">
      <Button asChild className="-ml-2 text-muted-foreground" size="sm" variant="ghost">
        <Link to={ROUTES.PROJECT_CHUNKS(id)}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {FEATURE_SPEC_MESSAGES.BACK_TO_BOARD}
        </Link>
      </Button>

      <ChunkHeader chunk={chunk} onViewPrompt={() => setTab('prompt')} projectId={id} />

      <Tabs onValueChange={(value) => setTab(value as TabValue)} value={tab}>
        {/*
          Underlined-tab variant of shadcn TabsList — flat row with a single bottom rule, per-trigger
          underline on the active tab. Matches the Context Files page tabs.
        */}
        <TabsList className="flex h-auto items-center justify-start gap-0 overflow-x-auto rounded-none border-b border-border-subtle bg-transparent p-0">
          <TabsTrigger
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-[13px] font-medium data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="spec"
          >
            {FEATURE_SPEC_MESSAGES.TAB_SPEC}
          </TabsTrigger>
          <TabsTrigger
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-[13px] font-medium data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="prompt"
          >
            {FEATURE_SPEC_MESSAGES.TAB_PROMPT}
          </TabsTrigger>
          <TabsTrigger
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-[13px] font-medium data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="notes"
          >
            {FEATURE_SPEC_MESSAGES.TAB_NOTES}
          </TabsTrigger>
        </TabsList>
        <TabsContent className="mt-6" value="spec">
          <FeatureSpecTab chunk={chunk} chunkId={chunkId} />
        </TabsContent>
        <TabsContent className="mt-6" value="prompt">
          <PromptTab chunk={chunk} chunkId={chunkId} onOpenSpec={() => setTab('spec')} />
        </TabsContent>
        <TabsContent className="mt-6" value="notes">
          <NotesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
