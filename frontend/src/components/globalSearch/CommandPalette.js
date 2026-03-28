import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import FocusTrap from 'focus-trap-react';

import {
  closeGlobalSearch,
  setGlobalSearchQuery,
  setGlobalSearchLoading,
  setMenuResults,
  setDocumentResults,
  setSelectedIndex,
} from '../../actions/GlobalSearchActions';
import { searchMenuItems, searchAllDocuments } from '../../api/globalSearch';
import { requestRedirect } from '../../reducers/redirect';

import './CommandPalette.css';

const DEBOUNCE_DELAY = 300;

/**
 * @summary Builds a flat array of all navigable result items across categories.
 * When query is empty, returns recent documents. When query is present, returns
 * menu results followed by document results from all windows.
 */
function getAllResults({
  query,
  recentDocuments,
  menuResults,
  documentResults,
}) {
  const results = [];

  if (!query) {
    // Show recent documents when no query
    recentDocuments.forEach((doc) => {
      results.push({
        type: 'recentDocument',
        windowId: doc.windowId,
        docId: doc.docId,
        caption: doc.caption,
      });
    });
  } else {
    // Menu results
    menuResults.forEach((item) => {
      results.push({
        type: item.type || 'window',
        elementId: item.elementId,
        caption: item.caption,
        windowId: item.windowId,
      });
    });

    // Document results from all windows
    Object.keys(documentResults).forEach((windowId) => {
      const group = documentResults[windowId];
      if (group && group.results) {
        group.results.forEach((doc) => {
          results.push({
            type: 'document',
            windowId,
            docId: doc.docId,
            caption: doc.caption,
          });
        });
      }
    });
  }

  return results;
}

const CommandPalette = ({
  isOpen,
  query,
  selectedIndex,
  recentDocuments,
  menuResults,
  documentResults,
  dispatch,
}) => {
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef(null);

  const allResults = useMemo(
    () =>
      getAllResults({ query, recentDocuments, menuResults, documentResults }),
    [query, recentDocuments, menuResults, documentResults]
  );

  const totalResults = allResults.length;
  const hasResults = totalResults > 0;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }

    if (!isOpen) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      requestIdRef.current++;
    }
  }, [isOpen]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const selectedEl = resultsRef.current.querySelector(
      `#command-palette-item-${selectedIndex}`
    );
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelectItem = useCallback(
    (index) => {
      const item = allResults[index];
      if (!item) return;

      dispatch(closeGlobalSearch());

      if (item.type === 'recentDocument' || item.type === 'document') {
        dispatch(requestRedirect(`/window/${item.windowId}/${item.docId}`));
      } else if (item.type === 'newRecord' && item.elementId) {
        dispatch(requestRedirect(`/window/${item.elementId}/new`));
      } else if (item.elementId) {
        dispatch(requestRedirect(`/window/${item.elementId}`));
      }
    },
    [allResults, dispatch]
  );

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (totalResults > 0) {
            dispatch(setSelectedIndex((selectedIndex + 1) % totalResults));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (totalResults > 0) {
            dispatch(
              setSelectedIndex(
                (selectedIndex - 1 + totalResults) % totalResults
              )
            );
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (totalResults > 0) {
            handleSelectItem(selectedIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          dispatch(closeGlobalSearch());
          break;
        default:
          break;
      }
    },
    [dispatch, selectedIndex, totalResults, handleSelectItem]
  );

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      dispatch(closeGlobalSearch());
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    dispatch(setGlobalSearchQuery(value));

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value) {
      dispatch(setMenuResults([]));
      dispatch(setGlobalSearchLoading(false));
      return;
    }

    dispatch(setGlobalSearchLoading(true));
    const currentRequestId = ++requestIdRef.current;

    debounceTimerRef.current = setTimeout(() => {
      // Search menu items
      searchMenuItems(value)
        .then((results) => {
          if (currentRequestId === requestIdRef.current) {
            dispatch(setMenuResults(results));
          }
        })
        .catch(() => {
          if (currentRequestId === requestIdRef.current) {
            dispatch(setMenuResults([]));
          }
        });

      // Search documents across entity types
      if (value.trim().length >= 2) {
        searchAllDocuments(value).then((resultsByWindowId) => {
          if (currentRequestId === requestIdRef.current) {
            Object.keys(resultsByWindowId).forEach((windowId) => {
              const { caption, results } = resultsByWindowId[windowId];
              dispatch(setDocumentResults(windowId, caption, results));
            });
            dispatch(setGlobalSearchLoading(false));
          }
        });
      } else {
        dispatch(setGlobalSearchLoading(false));
      }
    }, DEBOUNCE_DELAY);
  };

  const handleItemClick = useCallback(
    (index) => {
      handleSelectItem(index);
    },
    [handleSelectItem]
  );

  if (!isOpen) {
    return null;
  }

  // Build the rendered result sections with a running flat index
  let flatIndex = 0;
  const renderResultSections = () => {
    const sections = [];

    if (!query) {
      // Recent documents
      if (recentDocuments.length > 0) {
        sections.push(
          <div
            key="header-recent"
            role="presentation"
            className="command-palette-category-header"
          >
            Recent Documents
          </div>
        );
        recentDocuments.forEach((doc) => {
          const idx = flatIndex++;
          sections.push(
            <div
              key={`recent-${idx}`}
              id={`command-palette-item-${idx}`}
              role="option"
              aria-selected={idx === selectedIndex}
              className={classnames('command-palette-item', {
                'command-palette-item-selected': idx === selectedIndex,
              })}
              onClick={() => handleItemClick(idx)}
            >
              {doc.caption || `Document ${doc.docId}`}
            </div>
          );
        });
      }
    } else {
      // Menu results
      if (menuResults.length > 0) {
        sections.push(
          <div
            key="header-menu"
            role="presentation"
            className="command-palette-category-header"
          >
            Menu Items
          </div>
        );
        menuResults.forEach((item, i) => {
          const idx = flatIndex++;
          sections.push(
            <div
              key={`menu-${i}`}
              id={`command-palette-item-${idx}`}
              role="option"
              aria-selected={idx === selectedIndex}
              className={classnames('command-palette-item', {
                'command-palette-item-selected': idx === selectedIndex,
              })}
              onClick={() => handleItemClick(idx)}
            >
              {item.caption}
            </div>
          );
        });
      }

      // Document results
      Object.keys(documentResults).forEach((windowId) => {
        const group = documentResults[windowId];
        if (!group || !group.results || group.results.length === 0) return;

        sections.push(
          <div
            key={`header-doc-${windowId}`}
            role="presentation"
            className="command-palette-category-header"
          >
            {group.caption || `Window ${windowId}`}
          </div>
        );
        group.results.forEach((doc, i) => {
          const idx = flatIndex++;
          sections.push(
            <div
              key={`doc-${windowId}-${i}`}
              id={`command-palette-item-${idx}`}
              role="option"
              aria-selected={idx === selectedIndex}
              className={classnames('command-palette-item', {
                'command-palette-item-selected': idx === selectedIndex,
              })}
              onClick={() => handleItemClick(idx)}
            >
              {doc.caption || `Document ${doc.docId}`}
            </div>
          );
        });
      });
    }

    return sections;
  };

  const resultSections = renderResultSections();

  // Determine the live region announcement
  let announcement = '';
  if (totalResults > 0) {
    announcement = `${totalResults} results available`;
  } else if (query) {
    announcement = 'No results found';
  }

  return (
    <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
      <div
        className="command-palette-overlay screen-freeze"
        onClick={handleOverlayClick}
        onKeyDown={handleKeyDown}
      >
        <div
          className="command-palette-modal"
          role="dialog"
          aria-label="Command Palette"
        >
          <div className="command-palette-input-wrapper">
            <span className="command-palette-icon">&#128269;</span>
            <input
              ref={inputRef}
              className="command-palette-input"
              type="text"
              placeholder="Search documents, menus, and more..."
              value={query}
              onChange={handleInputChange}
              role="combobox"
              aria-expanded={hasResults}
              aria-controls="command-palette-listbox"
              aria-activedescendant={
                selectedIndex >= 0 && hasResults
                  ? `command-palette-item-${selectedIndex}`
                  : undefined
              }
              aria-autocomplete="list"
              aria-label="Search documents, menus, and more"
            />
          </div>
          <div
            ref={resultsRef}
            className="command-palette-results"
            role="listbox"
            id="command-palette-listbox"
            aria-label="Search results"
          >
            {resultSections}
          </div>
          <div aria-live="polite" className="sr-only">
            {announcement}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

CommandPalette.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  query: PropTypes.string.isRequired,
  selectedIndex: PropTypes.number.isRequired,
  recentDocuments: PropTypes.array.isRequired,
  menuResults: PropTypes.array.isRequired,
  documentResults: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isOpen: state.globalSearch.isOpen,
  query: state.globalSearch.query,
  selectedIndex: state.globalSearch.selectedIndex,
  recentDocuments: state.globalSearch.recentDocuments,
  menuResults: state.globalSearch.menuResults,
  documentResults: state.globalSearch.documentResults,
});

export default connect(mapStateToProps)(CommandPalette);
