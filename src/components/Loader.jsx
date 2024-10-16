import React from "react"
import { Spinner } from "react-bootstrap"

/**
 * Loader component for showing progress
 *
 * @param {{ isLoading: any; }} {
    isLoading
}
 * @returns {*}
 */
const Loader = ({ isLoading }) => {
  return (
    <div
      className={`align-items-center bg-black bg-opacity-50 d-block d-flex h-100 justify-content-center loaderCover position-fixed start-0 top-0 w-100 z-3 ${
        isLoading ? "d-block" : "d-none"
      }`}
    >
      <Spinner animation="border" variant="light" />
    </div>
  )
}

export default Loader
