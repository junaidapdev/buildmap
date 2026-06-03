import {
  Activity,
  Compass,
  FileText,
  Home,
  KanbanSquare,
  Layers,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { BrandMark } from '@/components/layout/BrandMark';

/**
 * Hero `ProductPreview` — the design's signature element. A faux-browser window over the chunks
 * board so the visitor sees a real-DOM mock of the actual product instead of stock imagery.
 *
 * Title bar: three traffic-light dots + centered "buildmap — Lumen / Chunks" + soft-accent
 * "5 / 12 shipped" pill. Body splits into a 200px mini-sidebar (nested nav with Chunks active)
 * and a 4-column board (Backlog / In progress / Done / Blocked).
 *
 * Sample chunk data and copy are lifted verbatim from the Claude Design handoff
 * (`design_handoff_landing_page/source/screens-landing.jsx` §8) so the mock matches the spec
 * pixel-for-pixel. The card data is hard-coded — the preview is intentionally static and isn't
 * derived from real project state.
 */

type SidebarRow = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  /** Indent level: 0 = flush, 1 = "Lumen" depth, 2 = per-page depth. */
  indent: 0 | 1 | 2;
};

const SIDEBAR_ROWS: readonly SidebarRow[] = [
  { label: 'Projects', icon: Home, indent: 0 },
  { label: 'Lumen', icon: Sparkles, indent: 1 },
  { label: 'Overview', icon: Compass, indent: 2 },
  { label: 'PRD', icon: FileText, indent: 2 },
  { label: 'Architecture', icon: Layers, indent: 2 },
  { label: 'Context files', icon: FileText, indent: 2 },
  { label: 'Chunks', icon: KanbanSquare, indent: 2, active: true },
  { label: 'Progress', icon: Activity, indent: 2 },
];

type ChunkCard = {
  id: number;
  title: string;
  /** Effort badge label — S / M / L. */
  effort: 'S' | 'M' | 'L';
};

type ChunkColumn = {
  title: string;
  count: number;
  cards: readonly ChunkCard[];
};

const COLUMNS: readonly ChunkColumn[] = [
  {
    title: 'Backlog',
    count: 4,
    cards: [
      { id: 8, title: 'Highlight capture: photo + OCR', effort: 'L' },
      { id: 9, title: 'Weekend recap generator', effort: 'L' },
      { id: 10, title: 'Streak-at-risk push', effort: 'S' },
      { id: 12, title: 'Settings: timezone, goal, pause', effort: 'S' },
    ],
  },
  {
    title: 'In progress',
    count: 2,
    cards: [
      { id: 6, title: 'Reading session timer', effort: 'M' },
      { id: 7, title: 'Highlight capture: paste', effort: 'S' },
    ],
  },
  {
    title: 'Done',
    count: 5,
    cards: [
      { id: 1, title: 'Repo scaffolding & CI', effort: 'S' },
      { id: 2, title: 'Auth & onboarding', effort: 'M' },
      { id: 3, title: 'Book library', effort: 'M' },
      { id: 4, title: 'Daily log: quick-log', effort: 'S' },
      { id: 5, title: 'Streak engine (shared)', effort: 'M' },
    ],
  },
  {
    title: 'Blocked',
    count: 1,
    cards: [{ id: 11, title: 'Pause-day spending UI', effort: 'S' }],
  },
];

const INDENT_CLASS = ['ml-0', 'ml-1.5', 'ml-3'] as const;

export function ProductPreview() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-[14px] border bg-elevated shadow-elevated"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-3.5 py-2.5">
        <div className="flex gap-[5px]">
          <span className="size-[11px] rounded-full bg-border" />
          <span className="size-[11px] rounded-full bg-border" />
          <span className="size-[11px] rounded-full bg-border" />
        </div>
        <span className="flex-1 text-center text-[12px] text-muted-foreground">
          buildmap — Lumen / Chunks
        </span>
        <span className="inline-flex h-[18px] items-center rounded-full border border-brand-soft-border bg-brand-soft px-2 text-[10px] font-medium text-brand-text">
          5 / 12 shipped
        </span>
      </div>

      {/*
        Body. Desktop (sm+): 200px sidebar + 4-column board, locked-height window.
        Mobile (<sm): sidebar hidden (no horizontal real estate for a 200px column on a 320px
        viewport), board grows to fill the window and scrolls horizontally — each column keeps
        its visual identity instead of being squashed unreadable.
      */}
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] sm:[height:460px]">
        {/* Sidebar — hidden on mobile. */}
        <div className="hidden border-r border-border-subtle bg-background p-3 sm:block">
          <div className="flex items-center gap-2 px-1.5 pb-3 pt-1">
            <BrandMark size={20} />
            <span className="text-[13px] font-semibold tracking-tight">buildmap</span>
          </div>
          {SIDEBAR_ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <div
                className={`mb-px flex items-center gap-2 rounded-md px-1.5 py-[5px] text-[12px] ${
                  row.active
                    ? 'bg-inset font-medium text-foreground'
                    : 'text-secondaryText'
                } ${INDENT_CLASS[row.indent]}`}
                key={row.label}
              >
                <Icon className="size-3" />
                <span>{row.label}</span>
              </div>
            );
          })}
        </div>

        {/* Board — horizontal scroll on mobile, fixed 4-col grid on sm+. */}
        <div className="overflow-x-auto p-3 sm:p-4">
          <div className="grid w-max grid-cols-4 gap-2.5 sm:w-auto">
            {COLUMNS.map((column) => (
              <div className="w-[160px] sm:w-auto" key={column.title}>
                <div className="flex items-center gap-1.5 px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  <span>{column.title}</span>
                  <span className="tabular-nums text-faint">{column.count}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {column.cards.map((card) => (
                    <div
                      className="rounded-lg border bg-elevated px-2.5 py-2 text-[11px]"
                      key={card.id}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-mono text-faint">#{card.id}</span>
                        <span className="inline-flex h-4 items-center rounded-full border bg-subtle px-1.5 text-[9px] font-medium text-secondaryText">
                          {card.effort}
                        </span>
                      </div>
                      <div className="leading-[1.35]">{card.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
