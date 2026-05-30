import { AlertCircle, ArrowLeft } from 'lucide-react';
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

export function ChunkDetailPage() {
  const { id, chunkId } = useParams<{ id: string; chunkId: string }>();
  // Hook called unconditionally (disabled when chunkId is absent) to keep hook order stable.
  const chunkQuery = useChunk(chunkId ?? '');

  if (!id || !chunkId) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

  if (chunkQuery.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (chunkQuery.isError || !chunkQuery.data) {
    return (
      <div className="mx-auto max-w-4xl">
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
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild className="-ml-2 text-muted-foreground" size="sm" variant="ghost">
        <Link to={ROUTES.PROJECT_CHUNKS(id)}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {FEATURE_SPEC_MESSAGES.BACK_TO_BOARD}
        </Link>
      </Button>

      <ChunkHeader chunk={chunk} projectId={id} />

      <Tabs defaultValue="spec">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="spec">{FEATURE_SPEC_MESSAGES.TAB_SPEC}</TabsTrigger>
          <TabsTrigger value="prompt">{FEATURE_SPEC_MESSAGES.TAB_PROMPT}</TabsTrigger>
          <TabsTrigger value="notes">{FEATURE_SPEC_MESSAGES.TAB_NOTES}</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-6" value="spec">
          <FeatureSpecTab chunkId={chunkId} />
        </TabsContent>
        <TabsContent className="mt-6" value="prompt">
          <PromptTab />
        </TabsContent>
        <TabsContent className="mt-6" value="notes">
          <NotesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
