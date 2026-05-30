import {
  ArchitectureContentSchema,
  type ArchitectureSectionKey,
} from '@shared/schemas/architecture';

import { ARCHITECTURE_EDIT_MESSAGES } from '@/features/projects/architecture/edit/messages';

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
 * Build a friendly "subject" string for an issue path: the section label for a top-level issue,
 * `Item N` for an array-of-strings entry, `Item N (field)` for an array-of-objects field, and
 * `Item N (field M)` for a nested array entry (e.g. one of a component's responsibilities).
 */
function describeSubject(
  path: ReadonlyArray<PropertyKey>,
  sectionLabel: string,
): string {
  if (path.length <= 1) {
    return sectionLabel;
  }

  const itemIndex = typeof path[1] === 'number' ? path[1] : null;
  if (itemIndex === null) {
    return sectionLabel;
  }

  if (path.length === 2) {
    return ARCHITECTURE_EDIT_MESSAGES.VALIDATION_ITEM(itemIndex + 1);
  }

  const fieldName = typeof path[2] === 'string' ? path[2] : null;
  if (fieldName === null) {
    return ARCHITECTURE_EDIT_MESSAGES.VALIDATION_ITEM(itemIndex + 1);
  }

  const field = humanizeField(fieldName);
  const nestedIndex = path.length >= 4 && typeof path[3] === 'number' ? path[3] : null;
  if (nestedIndex !== null) {
    return ARCHITECTURE_EDIT_MESSAGES.VALIDATION_ITEM_NESTED(itemIndex + 1, field, nestedIndex + 1);
  }
  return ARCHITECTURE_EDIT_MESSAGES.VALIDATION_ITEM_FIELD(itemIndex + 1, field);
}

/**
 * Validates a candidate architecture content against the shared schema and returns friendly,
 * field-level messages for issues in ONE section. The stored architecture is always schema-valid
 * (the generator and save Edge Function both validate it), so any issue here comes from the
 * in-progress draft of `sectionKey` — which lets the editor disable Save and point at the offending
 * field instead of failing opaquely on save (architecture_save_invalid_local). Returns an empty
 * array when the section is valid.
 */
export function getArchitectureSectionIssues(
  candidate: unknown,
  sectionKey: ArchitectureSectionKey,
  sectionLabel: string,
): string[] {
  const result = ArchitectureContentSchema.safeParse(candidate);
  if (result.success) {
    return [];
  }

  return result.error.issues
    .filter((issue) => issue.path[0] === sectionKey)
    .map((issue) => {
      // The superRefine uniqueness checks (component/service/decision ids) already carry a
      // complete, friendly message.
      if (issue.code === 'custom') {
        return issue.message;
      }

      const subject = describeSubject(issue.path, sectionLabel);

      let reason: string;
      if (issue.code === 'too_small') {
        const min = readNumber(issue, 'minimum') ?? 1;
        reason = Array.isArray(valueAtPath(candidate, issue.path))
          ? ARCHITECTURE_EDIT_MESSAGES.VALIDATION_NEED_AT_LEAST(min)
          : ARCHITECTURE_EDIT_MESSAGES.VALIDATION_TOO_SHORT(min);
      } else if (issue.code === 'too_big') {
        const max = readNumber(issue, 'maximum') ?? 0;
        reason = ARCHITECTURE_EDIT_MESSAGES.VALIDATION_TOO_LONG(max);
      } else {
        reason = ARCHITECTURE_EDIT_MESSAGES.VALIDATION_INVALID;
      }

      return `${subject} ${reason}`;
    });
}
