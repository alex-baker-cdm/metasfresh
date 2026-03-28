import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const RecentDocuments = ({ recentDocuments, query, onNavigate, onClear }) => {
  // Only show when query is empty
  if (query) {
    return null;
  }

  if (!recentDocuments || recentDocuments.length === 0) {
    return (
      <div className="command-palette-empty-state">No recent documents</div>
    );
  }

  return (
    <div>
      <div className="command-palette-recent-header">
        <span className="command-palette-recent-title">Recent Documents</span>
        <button
          className="command-palette-clear-btn"
          onClick={onClear}
          type="button"
        >
          Clear recent
        </button>
      </div>
      {recentDocuments.map((doc) => (
        <div
          key={`${doc.windowId}-${doc.docId}`}
          className="command-palette-result-item"
          onClick={() => onNavigate(doc.windowId, doc.docId)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onNavigate(doc.windowId, doc.docId);
            }
          }}
        >
          <i className="meta-icon-document" />
          <div className="command-palette-result-content">
            <div className="command-palette-result-title">
              {doc.caption || `${doc.windowId} - ${doc.docId}`}
            </div>
            {doc.windowCaption && (
              <div className="command-palette-result-subtitle">
                {doc.windowCaption}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

RecentDocuments.propTypes = {
  recentDocuments: PropTypes.array.isRequired,
  query: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  recentDocuments: state.globalSearch.recentDocuments,
  query: state.globalSearch.query,
});

export default connect(mapStateToProps)(RecentDocuments);
