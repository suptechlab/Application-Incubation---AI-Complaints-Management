import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  MdArrowBackIos,
  MdArrowForwardIos
} from "react-icons/md";
import ReactPaginate from "react-paginate";

/**
 * Data Grind Pagination Reusable Component
 *
 * @param {{ rowsPerPage: any; currentPage: any; totalPages: any; totalRecords: any; setCurrentPage: any; currentTotalRecord: any; setLimit: any; }} param0
 * @param {*} param0.rowsPerPage
 * @param {*} param0.currentPage
 * @param {*} param0.totalPages
 * @param {*} param0.totalRecords
 * @param {*} param0.setCurrentPage
 * @param {*} param0.currentTotalRecord
 * @param {*} param0.setLimit
 * @returns {*}
 */

const DataGridPagination = ({
  rowsPerPage,
  currentPage,
  totalPages,
  totalRecords,
  setCurrentPage,
  currentTotalRecord,
  setLimit,
}) => {
  const handlePagination = (page) => {
    setCurrentPage(page.selected + 1);
  };

  const { t } = useTranslation();
  return (
    <div className="align-items-center d-flex flex-column flex-sm-row justify-content-end">
      <span className="pageShowText mb-md-0 me-sm-4">
        {t("ROWS PER PAGE")}:
        <select
          className="border-0 d-inline-block form-select form-select-sm ms-2 w-auto"
          onChange={(event) => {
            setLimit(event.target.value);
          }}
        >
          <option>10</option>
          <option>20</option>
          <option>50</option>
          <option>100</option>
        </select>
      </span>
      <div className="pageShowText mb-md-0 me-sm-4">
        {1 + (currentPage - 1) * rowsPerPage}-{""}
        {currentTotalRecord + (currentPage - 1) * rowsPerPage} of {totalRecords}{" "}
      </div>

      <ReactPaginate
        previousLabel={<MdArrowBackIos />}
        nextLabel={<MdArrowForwardIos />}
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item prev-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakClassName="page-item"
        breakLinkClassName="page-link"
        containerClassName="flex-wrap justify-content-center mb-0 pagination user-select-none"
        activeClassName="active"
        pageCount={totalPages}
        marginPagesDisplayed={1}
        pageRangeDisplayed={4}
        forcePage={currentPage - 1}
        onPageChange={(page) => handlePagination(page)}
      />
    </div>
  );
};
export default DataGridPagination;
