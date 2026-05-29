/**
 * Generic copy for the shared document editors (prose + list). Lifted from prd/edit in Chunk 16 so
 * the architecture editor reuses the same controls. Feature-specific copy (PRD vs architecture
 * section labels, confirm bodies, etc.) stays in each feature's own edit/messages.ts, which spreads
 * this in.
 */
export const SHARED_EDIT_MESSAGES = {
  ADD_ITEM_BUTTON: 'Add item',
  REMOVE_LABEL: 'Remove',
  MOVE_UP_LABEL: 'Move up',
  MOVE_DOWN_LABEL: 'Move down',
} as const;
