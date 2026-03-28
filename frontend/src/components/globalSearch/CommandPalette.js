import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FocusTrap from 'focus-trap-react';

import {
  closeGlobalSearch,
  setGlobalSearchQuery,
} from '../../actions/GlobalSearchActions';

import './CommandPalette.css';

const CommandPalette = ({ isOpen, query, dispatch }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
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
          <div className="command-palette-results" />
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
