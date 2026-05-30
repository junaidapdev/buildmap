import { useCallback, useState } from 'react';

import type { FeatureSpecContent, FeatureSpecSectionKey } from '@shared/schemas/feature-spec';
import { Badge } from '@/components/ui/badge';
import { useDirtyGuard } from '@/features/projects/_shared/edit/useDirtyGuard';
import {
  FEATURE_SPEC_SECTION_LABELS,
  FEATURE_SPEC_SECTION_ORDER,
} from '@/features/projects/feature-specs/doc-config';
import { FeatureSpecActions } from '@/features/projects/feature-specs/FeatureSpecActions';
import { FeatureSpecSectionEditor } from '@/features/projects/feature-specs/edit/FeatureSpecSectionEditor';
import { FEATURE_SPEC_MESSAGES } from '@/features/projects/feature-specs/messages';
import type { FeatureSpecRow } from '@/features/projects/feature-specs/useExistingFeatureSpec';
import { formatRelativeTime } from '@/lib/relative-time';

type FeatureSpecViewProps = {
  spec: FeatureSpecRow;
  chunkId: string;
};

export function FeatureSpecView({ spec, chunkId }: FeatureSpecViewProps) {
  const content = spec.content_json;

  const [dirtyMap, setDirtyMap] = useState<Partial<Record<FeatureSpecSectionKey, boolean>>>({});
  const anyDirty = Object.values(dirtyMap).some(Boolean);
  useDirtyGuard(anyDirty);

  const handleDirtyChange = useCallback((sectionKey: FeatureSpecSectionKey, dirty: boolean) => {
    setDirtyMap((previous) =>
      previous[sectionKey] === dirty ? previous : { ...previous, [sectionKey]: dirty },
    );
  }, []);

  // Saving invalidates the spec query, so the refetched row updates this view; nothing to do here.
  const handleSaved = useCallback((_content: FeatureSpecContent) => {}, []);

  return (
    <article className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">{FEATURE_SPEC_MESSAGES.VERSION_LABEL(spec.version)}</Badge>
        <span className="text-xs text-muted-foreground">
          {FEATURE_SPEC_MESSAGES.LAST_UPDATED_PREFIX}{' '}
          {formatRelativeTime(spec.updated_at, FEATURE_SPEC_MESSAGES.UPDATED_JUST_NOW)}
        </span>
      </div>

      <div className="space-y-8">
        {FEATURE_SPEC_SECTION_ORDER.map((sectionKey) => (
          <FeatureSpecSectionEditor
            chunkId={chunkId}
            key={sectionKey}
            label={FEATURE_SPEC_SECTION_LABELS[sectionKey]}
            onDirtyChange={handleDirtyChange}
            onSaved={handleSaved}
            sectionKey={sectionKey}
            specContent={content}
          />
        ))}
      </div>

      <FeatureSpecActions chunkId={chunkId} spec={spec} />
    </article>
  );
}
