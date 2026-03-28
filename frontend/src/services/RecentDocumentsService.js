const STORAGE_KEY_PREFIX = 'metasfresh_recent_docs_';
const MAX_RECENT_DOCUMENTS = 10;

function getStorageKey(userId) {
  return STORAGE_KEY_PREFIX + userId;
}

function getRecentDocuments(userId) {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function addRecentDocument(userId, document) {
  try {
    const docs = getRecentDocuments(userId);

    // Remove existing entry with same windowId+docId (move to front)
    const filtered = docs.filter(
      (d) => !(d.windowId === document.windowId && d.docId === document.docId)
    );

    // Add new entry to front
    filtered.unshift(document);

    // Trim to max
    const trimmed = filtered.slice(0, MAX_RECENT_DOCUMENTS);

    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(trimmed));

    return trimmed;
  } catch (e) {
    return getRecentDocuments(userId);
  }
}

function clearRecentDocuments(userId) {
  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
  } catch (e) {
    // graceful handling
  }
  return [];
}

export default {
  getRecentDocuments,
  addRecentDocument,
  clearRecentDocuments,
};
