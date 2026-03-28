import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FocusTrap from 'focus-trap-react';

import {
  closeGlobalSearch,
  setGlobalSearchQuery,
  setRecentDocuments,
} from '../../actions/GlobalSearchActions';
import RecentDocuments from './RecentDocuments';
import RecentDocumentsService from '../../services/RecentDocumentsService';
import history from '../../services/History';

import './CommandPalette.css';

const CommandPalette = ({ isOpen, query, me, dispatch }) => {
  const inputRef = useRef(null);

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
  }, [isOpen]);

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
    dispatch(setGlobalSearchQuery(e.target.value));
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
