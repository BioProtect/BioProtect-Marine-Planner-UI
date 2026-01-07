/**
 * RTKQ cache helper for endpoints that return either:
 *   - an array: [...]
 *   - or an object: { data: [...] }
 *
 * Returns the mutable list reference inside the draft (Immer draft).
 */
export function getDraftList(draft) {
  if (Array.isArray(draft)) {
    return draft;
  }
  if (draft && Array.isArray(draft.data)) {
    return draft.data;
  }
  return null;
}

/**
 * Update items in a cached list by id.
 */
export function replaceItemsById(draft, byId) {
  const list = getDraftList(draft);
  if (!list) return;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const updated = byId.get(item?.id);
    if (updated) list[i] = updated;
  }
}

/**
 * Patch a single item by id (merge patch into existing item).
 */
export function patchItemById(draft, id, patch) {
  const list = getDraftList(draft);
  if (!list) return;

  const idx = list.findIndex((x) => x?.id === id);
  if (idx === -1) return;

  list[idx] = { ...list[idx], ...patch };
}
