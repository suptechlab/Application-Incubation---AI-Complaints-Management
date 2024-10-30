import React from "react";
import SvgIcons from "./SVGIcons";

/**
 * User Loader component for showing progress
 *
 * @param {{ isLoading: any; title: any; subTitle: any; }} param0
 * @param {*} param0.isLoading
 * @param {*} param0.title
 * @param {*} param0.subTitle
 * @returns {*}
 */

const UserLoader = ({ isLoading, title, subTitle }) => {
  if (!isLoading) return null;

  return (
    <div className="loader-cover d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 theme-loader-z-index">
      <div className="bg-body custom-min-height-200 custom-min-width-240 m-auto p-4 rounded-4 text-center">
        <div className="p-2 w-100 h-100">
          <div className="pb-1">
            <div className="d-inline-block pe-4 position-relative text-warning">
              {SvgIcons.halfUserIcon}
              <span className="bottom-0 end-0 position-absolute spin text-primary z-1">
                {SvgIcons.userRefreshIcon}
              </span>
            </div>
          </div>
          <div className="pt-4 fs-4 fw-bold">{title}</div>
          {subTitle && <p className="opacity-50 mb-0">{subTitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default UserLoader;
