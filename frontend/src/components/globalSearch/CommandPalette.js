import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FocusTrap from 'focus-trap-react';

import {
  closeGlobalSearch,
  setGlobalSearchQuery,
  setDocumentResults,
  setGlobalSearchLoading,
} from '../../actions/GlobalSearchActions';
import { searchAllDocuments } from '../../api/globalSearch';
import CommandPaletteDocResults from './CommandPaletteDocResults';

import './CommandPalette.css';

const DEBOUNCE_DELAY = 300;

const CommandPalette = ({ isOpen, query, dispatch }) => {
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const performDocumentSearch = useCallback(
    (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return;
      }

      dispatch(setGlobalSearchLoading(true));

      searchAllDocuments(searchQuery).then((resultsByWindowId) => {
        Object.keys(resultsByWindowId).forEach((windowId) => {
          const { caption, results } = resultsByWindowId[windowId];
          dispatch(setDocumentResults(windowId, caption, results));
        });
        dispatch(setGlobalSearchLoading(false));
      });
    },
    [dispatch]
  );

  const handleResultClick = useCallback(
    (windowId, rowId) => {
      dispatch(closeGlobalSearch());

      if (rowId) {
        window.location.href = `/window/${windowId}/${rowId}`;
      } else {
        window.location.href = `/window/${windowId}`;
      }
    },
    [dispatch]
  );

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      dispatch(closeGlobalSearch());
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      dispatch(closeGlobalSearch());
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    dispatch(setGlobalSearchQuery(value));

    // Debounce the document search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performDocumentSearch(value);
    }, DEBOUNCE_DELAY);
  };

  return (
    <FocusTrap>
      <div
        className="command-palette-overlay screen-freeze"
        onClick={handleOverlayClick}
        onKeyDown={handleKeyDown}
      >
        <div className="command-palette-modal">
          <div className="command-palette-input-wrapper">
            <span className="command-palette-icon">&#128269;</span>
            <input
              ref={inputRef}
              className="command-palette-input"
              type="text"
              placeholder="Search documents, menus, and more..."
              value={query}
              onChange={handleInputChange}
            />
          </div>
          <div className="command-palette-results">
            <CommandPaletteDocResults onResultClick={handleResultClick} />
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

CommandPalette.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  query: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isOpen: state.globalSearch.isOpen,
  query: state.globalSearch.query,
});

export default connect(mapStateToProps)(CommandPalette);
