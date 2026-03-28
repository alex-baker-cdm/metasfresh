// Action types
export const OPEN_GLOBAL_SEARCH = 'OPEN_GLOBAL_SEARCH';
export const CLOSE_GLOBAL_SEARCH = 'CLOSE_GLOBAL_SEARCH';
export const SET_GLOBAL_SEARCH_QUERY = 'SET_GLOBAL_SEARCH_QUERY';
export const SET_GLOBAL_SEARCH_LOADING = 'SET_GLOBAL_SEARCH_LOADING';
export const SET_MENU_RESULTS = 'SET_MENU_RESULTS';
export const SET_DOCUMENT_RESULTS = 'SET_DOCUMENT_RESULTS';
export const SET_RECENT_DOCUMENTS = 'SET_RECENT_DOCUMENTS';
export const SET_SELECTED_INDEX = 'SET_SELECTED_INDEX';
export const RESET_GLOBAL_SEARCH = 'RESET_GLOBAL_SEARCH';

export const initialState = {
  isOpen: false,
  query: '',
  isLoading: false,
  menuResults: [],
  documentResults: {},
  recentDocuments: [],
  selectedIndex: 0,
};

export default function globalSearch(state = initialState, action) {
  switch (action.type) {
    case OPEN_GLOBAL_SEARCH:
      return {
        ...initialState,
        isOpen: true,
        recentDocuments: state.recentDocuments,
      };

    case CLOSE_GLOBAL_SEARCH:
      return {
        ...initialState,
        recentDocuments: state.recentDocuments,
      };

    case SET_GLOBAL_SEARCH_QUERY:
      return {
        ...state,
        query: action.query,
        selectedIndex: 0,
      };

    case SET_GLOBAL_SEARCH_LOADING:
      return {
        ...state,
        isLoading: action.isLoading,
      };

    case SET_MENU_RESULTS:
      return {
        ...state,
        menuResults: action.results,
      };

    case SET_DOCUMENT_RESULTS:
      return {
        ...state,
        documentResults: {
          ...state.documentResults,
          [action.windowId]: {
            caption: action.caption,
            results: action.results,
          },
        },
      };

    case SET_RECENT_DOCUMENTS:
      return {
        ...state,
        recentDocuments: action.documents,
      };

    case SET_SELECTED_INDEX:
      return {
        ...state,
        selectedIndex: action.index,
      };

    case RESET_GLOBAL_SEARCH:
      return {
        ...initialState,
      };

    default:
      return state;
  }
}
