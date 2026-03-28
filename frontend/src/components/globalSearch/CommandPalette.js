import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FocusTrap from 'focus-trap-react';
import debounce from 'lodash/debounce';

import {
  closeGlobalSearch,
  setGlobalSearchQuery,
  setGlobalSearchLoading,
  setMenuResults,
  setRecentDocuments,
} from '../../actions/GlobalSearchActions';
import { searchMenuItems } from '../../api/globalSearch';
import { requestRedirect } from '../../reducers/redirect';
import CommandPaletteResults from './CommandPaletteResults';
import RecentDocuments from './RecentDocuments';
import RecentDocumentsService from '../../services/RecentDocumentsService';
import history from '../../services/History';

import './CommandPalette.css';

const CommandPalette = ({ isOpen, query, me, dispatch }) => {
  const inputRef = useRef(null);
  const requestIdRef = useRef(0);

  const performSearch = useCallback(
    debounce((searchQuery) => {
      if (!searchQuery) {
        dispatch(setMenuResults([]));
        dispatch(setGlobalSearchLoading(false));
        return;
      }

      const currentRequestId = ++requestIdRef.current;

      searchMenuItems(searchQuery)
        .then((results) => {
          if (currentRequestId === requestIdRef.current) {
            dispatch(setMenuResults(results));
            dispatch(setGlobalSearchLoading(false));
          }
        })
        .catch(() => {
          if (currentRequestId === requestIdRef.current) {
            dispatch(setMenuResults([]));
            dispatch(setGlobalSearchLoading(false));
          }
        });
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }

    if (isOpen) {
      const userId = me && (me.userId || me.username);
      if (userId) {
        const docs = RecentDocumentsService.getRecentDocuments(userId);
        dispatch(setRecentDocuments(docs));
      }
    }

    if (!isOpen) {
      performSearch.cancel();
      requestIdRef.current++;
    }
  }, [isOpen, performSearch]);

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

    if (value) {
      dispatch(setGlobalSearchLoading(true));
    } else {
      dispatch(setMenuResults([]));
      dispatch(setGlobalSearchLoading(false));
    }

    performSearch(value);
  };

  const handleItemClick = (item) => {
    dispatch(closeGlobalSearch());

    if (item.type === 'newRecord') {
      dispatch(requestRedirect(`/window/${item.elementId}/new`));
    } else {
      dispatch(requestRedirect(`/window/${item.elementId}`));
    }
  };

  const handleRecentNavigate = (windowId, docId) => {
    dispatch(closeGlobalSearch());
    history.push(`/window/${windowId}/${docId}`);
  };

  const handleClearRecent = () => {
    const userId = me && (me.userId || me.username);
    if (userId) {
      const cleared = RecentDocumentsService.clearRecentDocuments(userId);
      dispatch(setRecentDocuments(cleared));
    }
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
            {!query && (
              <RecentDocuments
                onNavigate={handleRecentNavigate}
                onClear={handleClearRecent}
              />
            )}
            <CommandPaletteResults onItemClick={handleItemClick} />
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

CommandPalette.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  query: PropTypes.string.isRequired,
  me: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isOpen: state.globalSearch.isOpen,
  query: state.globalSearch.query,
  me: state.appHandler.me,
});

export default connect(mapStateToProps)(CommandPalette);
