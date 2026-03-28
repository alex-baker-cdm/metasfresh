import React from 'react';
import PropTypes from 'prop-types';

const getIcon = (type) => {
  switch (type) {
    case 'window':
      return <i className="meta-icon-window" />;
    case 'newRecord':
      return <i className="meta-icon-new" />;
    case 'group':
      return <i className="meta-icon-folder" />;
    default:
      return <i className="meta-icon-window" />;
  }
};

const CommandPaletteItem = ({ item, onClick, isSelected }) => {
  const className =
    'command-palette-item' +
    (isSelected ? ' command-palette-item-selected' : '');

  return (
    <div className={className} onClick={() => onClick(item)}>
      <div className="command-palette-item-icon">{getIcon(item.type)}</div>
      <div className="command-palette-item-text">
        <div className="command-palette-item-title">{item.caption}</div>
        <div className="command-palette-item-subtitle">{item.type}</div>
      </div>
    </div>
  );
};

CommandPaletteItem.propTypes = {
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default CommandPaletteItem;
