import React from 'react';
import { MediaItem } from './MediaItem';

/**
 * MediaGrid - Component for displaying media items in a grid layout
 *
 * @param {Object} props
 * @param {Array} props.items - Media items to display
 * @param {Function} props.onSelectItem - Handler for item selection
 * @param {Function} props.onDeleteItem - Handler for item deletion
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element}
 */
export const MediaGrid = ({ items = [], onSelectItem, onDeleteItem, loading = false }) => {
  // If loading, show skeleton loader
  if (loading) {
    return (
      <div className="row g-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="col-6 col-md-4 col-lg-3">
            <div className="card bg-light border-0 p-2 h-100">
              <div className="placeholder-glow" style={{ height: '150px' }}>
                <div
                  className="placeholder w-100 h-100"
                  style={{ borderRadius: '0.25rem' }}
                />
              </div>
              <div className="card-body p-2">
                <p className="card-text placeholder-glow">
                  <span className="placeholder col-7"></span>
                  <span className="placeholder col-4"></span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If no items, show empty state
  if (items.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-images fs-1 text-muted"></i>
        <h5 className="mt-3">No media found</h5>
        <p className="text-muted">
          Upload new media or adjust your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {items.map((item) => (
        <div key={item.id} className="col-6 col-md-4 col-lg-3">
          <MediaItem
            item={item}
            onSelect={onSelectItem}
            onDelete={onDeleteItem}
          />
        </div>
      ))}
    </div>
  );
};