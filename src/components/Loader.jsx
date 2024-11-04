import React from "react";
import { Spinner } from "react-bootstrap";

/**
 * Loader component for showing progress
 *
 * @param {{ isLoading: boolean }} props - Indicates if the loader is active
 * @returns {JSX.Element | null}
 */

const Loader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div
      className="loader-cover d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 theme-loader-z-index"
    >
      <Spinner animation="border" variant="light" />
    </div>
  );
};

export default Loader;