import React from 'react';

/**
 * Pagination component
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Function to call when a page is selected
 * @returns {JSX.Element}
 * @constructor
 * @example
 * <Pagination
 * currentPage={currentPage}
 * totalPages={totalPages}
 * onPageChange={setCurrentPage}
 * />
 */

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null; // No mostrar si solo hay 1 página

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav>
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
          >
            Prev
          </button>
        </li>
        {pages.map((p) => (
          <li
            key={p}
            className={`page-item ${p === currentPage ? 'active' : ''}`}
          >
            <button className="page-link" onClick={() => onPageChange(p)}>
              {p}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};