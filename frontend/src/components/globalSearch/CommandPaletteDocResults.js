import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { SEARCHABLE_ENTITIES } from '../../api/globalSearch';

/**
 * @method getEntityIcon
 * @summary Returns the icon class for a given windowId from SEARCHABLE_ENTITIES
 */
function getEntityIcon(windowId) {
  const entity = SEARCHABLE_ENTITIES.find((e) => e.windowId === windowId);
  return entity ? entity.icon : 'meta-icon-document';
}

/**
 * @method getDocumentTitle
 * @summary Extracts the first meaningful display value from a row's fieldsByName
 */
function getDocumentTitle(row) {
  if (!row || !row.fieldsByName) {
    return row.rowId || 'Unknown';
  }

  const fields = row.fieldsByName;
  const fieldKeys = Object.keys(fields);

  for (let i = 0; i < fieldKeys.length; i++) {
    const field = fields[fieldKeys[i]];
    if (field && field.value) {
      // field.value can be a string or an object with caption
      if (typeof field.value === 'string') {
        return field.value;
      }
      if (field.value.caption) {
        return field.value.caption;
      }
    }
  }

  return row.rowId || 'Unknown';
}

const CommandPaletteDocResults = ({ documentResults, onResultClick }) => {
  if (!documentResults || Object.keys(documentResults).length === 0) {
    return null;
  }

  const windowIds = Object.keys(documentResults);
  const hasAnyResults = windowIds.some(
    (wid) =>
      documentResults[wid].results && documentResults[wid].results.length > 0
  );

  if (!hasAnyResults) {
    return null;
  }

  return (
    <div className="command-palette-doc-results">
      {windowIds.map((windowId) => {
        const { caption, results } = documentResults[windowId];

        if (!results || results.length === 0) {
          return null;
        }

        const icon = getEntityIcon(windowId);

        return (
          <div key={windowId} className="command-palette-category">
            <div className="command-palette-category-header">
              {caption}
              <span className="command-palette-category-count">
                {results.length}
              </span>
            </div>
            {results.slice(0, 5).map((row) => (
              <div
                key={row.rowId}
                className="command-palette-result-item"
                onClick={() => onResultClick(windowId, row.rowId)}
              >
                <i className={icon} />
                <div className="command-palette-result-text">
                  <span className="command-palette-result-title">
                    {getDocumentTitle(row)}
                  </span>
                  <span className="command-palette-result-subtitle">
                    {caption}
                  </span>
                </div>
              </div>
            ))}
            <a
              className="command-palette-show-all"
              onClick={() => onResultClick(windowId)}
            >
              Show all results
            </a>
          </div>
        );
      })}
    </div>
  );
};

CommandPaletteDocResults.propTypes = {
  documentResults: PropTypes.object.isRequired,
  onResultClick: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  documentResults: state.globalSearch.documentResults,
});

export default connect(mapStateToProps)(CommandPaletteDocResults);
