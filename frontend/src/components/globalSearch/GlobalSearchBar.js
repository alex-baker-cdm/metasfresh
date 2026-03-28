import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { openGlobalSearch } from '../../actions/GlobalSearchActions';
import Tooltips from '../tooltips/Tooltips';

const GlobalSearchBar = ({ dispatch }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleClick = () => {
    dispatch(openGlobalSearch());
  };

  return (
    <div
      className={classnames(
        'header-item-container',
        'header-item-container-static',
        'pointer tooltip-parent js-not-unselect'
      )}
      onClick={handleClick}
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
    >
      <span className="header-item icon-lg">
        <i className="meta-icon-preview" />
      </span>
      {tooltipOpen && <Tooltips name="Ctrl+K" action="Search" type="" />}
    </div>
  );
};

GlobalSearchBar.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(GlobalSearchBar);
