import globalSearch, {
  initialState,
  OPEN_GLOBAL_SEARCH,
  CLOSE_GLOBAL_SEARCH,
  SET_GLOBAL_SEARCH_QUERY,
  SET_MENU_RESULTS,
  SET_DOCUMENT_RESULTS,
  SET_SELECTED_INDEX,
  RESET_GLOBAL_SEARCH,
} from '../../reducers/globalSearch';

describe('globalSearch reducer', () => {
  it('should return the initial state', () => {
    expect(globalSearch(undefined, {})).toEqual(initialState);
  });

  it('should handle OPEN_GLOBAL_SEARCH', () => {
    const state = {
      ...initialState,
      query: 'old query',
      menuResults: [{ id: 1 }],
      selectedIndex: 3,
    };
    const result = globalSearch(state, { type: OPEN_GLOBAL_SEARCH });

    expect(result.isOpen).toBe(true);
    expect(result.query).toBe('');
    expect(result.menuResults).toEqual([]);
    expect(result.selectedIndex).toBe(0);
  });

  it('should handle CLOSE_GLOBAL_SEARCH', () => {
    const state = {
      ...initialState,
      isOpen: true,
      query: 'test',
      menuResults: [{ id: 1 }],
      recentDocuments: [{ id: 'recent1' }],
    };
    const result = globalSearch(state, { type: CLOSE_GLOBAL_SEARCH });

    expect(result.isOpen).toBe(false);
    expect(result.query).toBe('');
    expect(result.menuResults).toEqual([]);
    expect(result.recentDocuments).toEqual([{ id: 'recent1' }]);
  });

  it('should handle SET_GLOBAL_SEARCH_QUERY and reset selectedIndex', () => {
    const state = {
      ...initialState,
      selectedIndex: 5,
    };
    const result = globalSearch(state, {
      type: SET_GLOBAL_SEARCH_QUERY,
      query: 'sales order',
    });

    expect(result.query).toBe('sales order');
    expect(result.selectedIndex).toBe(0);
  });

  it('should handle SET_MENU_RESULTS', () => {
    const results = [
      { id: 1, name: 'Sales Order' },
      { id: 2, name: 'Purchase Order' },
    ];
    const result = globalSearch(initialState, {
      type: SET_MENU_RESULTS,
      results,
    });

    expect(result.menuResults).toEqual(results);
  });

  it('should handle SET_DOCUMENT_RESULTS', () => {
    const result = globalSearch(initialState, {
      type: SET_DOCUMENT_RESULTS,
      windowId: '143',
      caption: 'Sales Order',
      results: [{ id: 'doc1' }],
    });

    expect(result.documentResults).toEqual({
      '143': {
        caption: 'Sales Order',
        results: [{ id: 'doc1' }],
      },
    });
  });

  it('should handle SET_SELECTED_INDEX', () => {
    const result = globalSearch(initialState, {
      type: SET_SELECTED_INDEX,
      index: 3,
    });

    expect(result.selectedIndex).toBe(3);
  });

  it('should handle RESET_GLOBAL_SEARCH', () => {
    const state = {
      isOpen: true,
      query: 'test',
      isLoading: true,
      menuResults: [{ id: 1 }],
      documentResults: { '143': { caption: 'SO', results: [] } },
      recentDocuments: [{ id: 'recent1' }],
      selectedIndex: 5,
    };
    const result = globalSearch(state, { type: RESET_GLOBAL_SEARCH });

    expect(result).toEqual(initialState);
  });
});
