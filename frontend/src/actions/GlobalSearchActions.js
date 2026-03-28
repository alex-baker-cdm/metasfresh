import {
  OPEN_GLOBAL_SEARCH,
  CLOSE_GLOBAL_SEARCH,
  SET_GLOBAL_SEARCH_QUERY,
  SET_GLOBAL_SEARCH_LOADING,
  SET_MENU_RESULTS,
  SET_DOCUMENT_RESULTS,
  SET_RECENT_DOCUMENTS,
  SET_SELECTED_INDEX,
} from '../reducers/globalSearch';

export function openGlobalSearch() {
  return {
    type: OPEN_GLOBAL_SEARCH,
  };
}

export function closeGlobalSearch() {
  return {
    type: CLOSE_GLOBAL_SEARCH,
  };
}

export function setGlobalSearchQuery(query) {
  return {
    type: SET_GLOBAL_SEARCH_QUERY,
    query,
  };
}

export function setGlobalSearchLoading(isLoading) {
  return {
    type: SET_GLOBAL_SEARCH_LOADING,
    isLoading,
  };
}

export function setMenuResults(results) {
  return {
    type: SET_MENU_RESULTS,
    results,
  };
}

export function setDocumentResults(windowId, caption, results) {
  return {
    type: SET_DOCUMENT_RESULTS,
    windowId,
    caption,
    results,
  };
}

export function setRecentDocuments(documents) {
  return {
    type: SET_RECENT_DOCUMENTS,
    documents,
  };
}

export function setSelectedIndex(index) {
  return {
    type: SET_SELECTED_INDEX,
    index,
  };
}
