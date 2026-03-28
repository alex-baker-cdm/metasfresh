import React from 'react';
import PropTypes from 'prop-types';
import counterpart from 'counterpart';
import { connect } from 'react-redux';

import SpinnerOverlay from '../app/SpinnerOverlay';
import CommandPaletteItem from './CommandPaletteItem';

const CommandPaletteResults = ({
  menuResults,
  isLoading,
  query,
  selectedIndex,
  onItemClick,
}) => {
  if (isLoading) {
    return (
      <div className="command-palette-spinner">
        <SpinnerOverlay iconSize={50} spinnerType="inline" />
      </div>
    );
  }

  if (menuResults.length === 0 && query) {
    return (
      <div className="command-palette-no-results">
        {counterpart.translate('window.noResults.caption')}
      </div>
    );
  }

  if (menuResults.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="command-palette-category-header">Menu Items</div>
      {menuResults.map((item, index) => (
        <CommandPaletteItem
          key={item.nodeId || index}
          item={item}
          onClick={onItemClick}
          isSelected={index === selectedIndex}
        />
      ))}
    </div>
  );
};

CommandPaletteResults.propTypes = {
  menuResults: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  query: PropTypes.string.isRequired,
  selectedIndex: PropTypes.number.isRequired,
  onItemClick: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  menuResults: state.globalSearch.menuResults,
  isLoading: state.globalSearch.isLoading,
  query: state.globalSearch.query,
  selectedIndex: state.globalSearch.selectedIndex,
});

export default connect(mapStateToProps)(CommandPaletteResults);
