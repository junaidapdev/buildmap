import type { ContextDocMeta } from '@/features/projects/context-files/doc-config';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';

/**
 * Right-column info panel that explains what the active context doc is and where it goes when the
 * user drops it into their repo. The "Where it goes" pill renders the on-disk filename with a `./`
 * prefix so it reads as a path. Same caption for every file — the docs all sit at repo root.
 */
export function ContextDocSidebar({ meta }: { meta: ContextDocMeta }) {
  return (
    <aside aria-label={CONTEXT_FILES_MESSAGES.SIDEBAR_ABOUT_LABEL} className="space-y-6">
      <div className="rounded-lg border border-border-subtle bg-card p-5">
        <p className="page-eyebrow">{CONTEXT_FILES_MESSAGES.SIDEBAR_ABOUT_LABEL}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-foreground">{meta.description}</p>
      </div>
      <div className="rounded-lg border border-border-subtle bg-card p-5">
        <p className="page-eyebrow">{CONTEXT_FILES_MESSAGES.SIDEBAR_PATH_LABEL}</p>
        <p className="mt-3 inline-flex items-center rounded-md border border-border-subtle bg-subtle/60 px-2 py-1 font-mono text-[12px] text-foreground">
          ./{meta.filename}
        </p>
        <p className="mt-3 text-[12px] text-muted-foreground">
          {CONTEXT_FILES_MESSAGES.SIDEBAR_PATH_CAPTION}
        </p>
      </div>
    </aside>
  );
}
