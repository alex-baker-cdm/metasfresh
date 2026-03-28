import { createViewRequest, browseViewRequest } from './view';
import { queryPathsRequest } from './app';
import { flattenLastElem } from '../actions/MenuActions';

export const SEARCHABLE_ENTITIES = [
  { windowId: '123', caption: 'Business Partners', icon: 'meta-icon-account' },
  { windowId: '143', caption: 'Sales Orders', icon: 'meta-icon-document' },
  { windowId: '181', caption: 'Purchase Orders', icon: 'meta-icon-document' },
  {
    windowId: '167',
    caption: 'Invoices (Customer)',
    icon: 'meta-icon-document',
  },
];

/**
 * @method searchMenuItems
 * @summary Search menu items using the queryPaths API
 * @param {string} query - search term
 * @returns {Promise<Array>} flattened menu results
 */
export function searchMenuItems(query) {
  return queryPathsRequest(query, 9, true).then((response) =>
    flattenLastElem(response.data)
  );
}

/**
 * @method searchDocuments
 * @summary Search documents for a specific entity window
 * @param {string} windowId - the window/entity type ID
 * @param {string} query - search term (unused in view creation, kept for future filter support)
 * @returns {Promise<Array>} array of row objects from the view
 */
export async function searchDocuments(windowId) {
  try {
    const createResponse = await createViewRequest({
      windowId,
      viewType: 'list',
      filters: [],
    });
    const { viewId } = createResponse.data;

    const browseResponse = await browseViewRequest({
      windowId,
      viewId,
      page: 1,
      pageLength: 5,
    });

    return browseResponse.data.result || [];
  } catch (e) {
    // Graceful failure per entity — don't break other categories
    return [];
  }
}

/**
 * @method searchAllDocuments
 * @summary Search documents across all searchable entity types in parallel
 * @param {string} query - search term
 * @returns {Promise<Object>} results keyed by windowId
 */
export async function searchAllDocuments(query) {
  const promises = SEARCHABLE_ENTITIES.map((entity) =>
    searchDocuments(entity.windowId, query).then((results) => ({
      windowId: entity.windowId,
      caption: entity.caption,
      results,
    }))
  );

  const settled = await Promise.allSettled(promises);
  const resultsByWindowId = {};

  settled.forEach((outcome) => {
    if (outcome.status === 'fulfilled') {
      const { windowId, caption, results } = outcome.value;
      resultsByWindowId[windowId] = { caption, results };
    }
  });

  return resultsByWindowId;
}
