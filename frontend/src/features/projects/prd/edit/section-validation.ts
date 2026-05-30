import { PrdContentSchema, type PrdSectionKey } from '@shared/schemas/prd';

import { PRD_EDIT_MESSAGES } from '@/features/projects/prd/edit/messages';

/** Reads a numeric property off an issue defensively, tolerating number or bigint (Zod minimum/maximum). */
function readNumber(source: object, key: string): number | null {
  const value = (source as Record<string, unknown>)[key];
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return null;
}

/** Walks a path into the candidate so we can tell an empty-collection issue from a too-short string. */
function valueAtPath(root: unknown, path: ReadonlyArray<PropertyKey>): unknown {
  let current: unknown = root;
  for (const segment of path) {
    if (current !== null && typeof current === 'object') {
      current = (current as Record<PropertyKey, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

function humanizeField(field: string): string {
  return field.replace(/_/g, ' ');
}

/**
 * Validates a candidate PRD content against the shared schema and returns friendly, field-level
 * messages for issues in ONE section. The stored PRD is always schema-valid (the generator and save
 * Edge Function both validate it), so any issue here comes from the in-progress draft of `sectionKey`
 * — which lets the editor disable Save and point at the offending field instead of failing opaquely
 * on save. Returns an empty array when the section is valid.
 */
export function getPrdSectionIssues(
  candidate: unknown,
  sectionKey: PrdSectionKey,
  sectionLabel: string,
): string[] {
  const result = PrdContentSchema.safeParse(candidate);
  if (result.success) {
    return [];
  }

  return result.error.issues
    .filter((issue) => issue.path[0] === sectionKey)
    .map((issue) => {
      // The superRefine uniqueness checks already carry a complete, friendly message.
      if (issue.code === 'custom') {
        return issue.message;
      }

      const path = issue.path;
      const itemIndex = typeof path[1] === 'number' ? path[1] : null;
      const fieldName = typeof path[2] === 'string' ? path[2] : null;
      const subject = itemIndex !== null
        ? fieldName !== null
          ? PRD_EDIT_MESSAGES.VALIDATION_ITEM_FIELD(itemIndex + 1, humanizeField(fieldName))
          : PRD_EDIT_MESSAGES.VALIDATION_ITEM(itemIndex + 1)
        : sectionLabel;

      let reason: string;
      if (issue.code === 'too_small') {
        const min = readNumber(issue, 'minimum') ?? 1;
        reason = Array.isArray(valueAtPath(candidate, path))
          ? PRD_EDIT_MESSAGES.VALIDATION_NEED_AT_LEAST(min)
          : PRD_EDIT_MESSAGES.VALIDATION_TOO_SHORT(min);
      } else if (issue.code === 'too_big') {
        const max = readNumber(issue, 'maximum') ?? 0;
        reason = PRD_EDIT_MESSAGES.VALIDATION_TOO_LONG(max);
      } else {
        reason = PRD_EDIT_MESSAGES.VALIDATION_INVALID;
      }

      return `${subject} ${reason}`;
    });
}
