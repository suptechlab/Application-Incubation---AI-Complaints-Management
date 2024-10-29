import * as React from "react"
import { useTranslation } from "react-i18next"
import { FaAngleLeft, FaAngleRight } from "react-icons/fa"
import ReactPaginate from "react-paginate"

/**
 * Data Grind Pagination Reusable Component
 * @date 4/13/2023 - 7:10:05 PM
 *
 * @param {{ rowsPerPage: any; currentPage: any; }} {
    rowsPerPage, currentPage
}
 * @returns {*}
 */

const DataGridPagination = ({
  rowsPerPage,
  currentPage,
  totalPages,
  totalRecords,
  setCurrentPage,
  currentTotalRecord,
  setLimit
}) => {
  const handlePagination = page => {
    //console.log("pagenum", page)
    setCurrentPage(page.selected + 1)
  }

  const {t} = useTranslation()
  return (
    <div className="align-items-center d-flex flex-column flex-sm-row justify-content-end">
      <span className="pageShowText mb-md-0 me-sm-4">{t("ROWS PER PAGE")}: 
        <select className="border-0 ms-2" onChange={(event) => {
          setLimit(event.target.value)
        }}>
            <option>10</option>
            <option>20</option>
        </select>
        </span>
      <div className="pageShowText mb-md-0 me-sm-4">
         {1 + (currentPage - 1) * rowsPerPage}-{""}
        {currentTotalRecord + (currentPage - 1) * rowsPerPage} of {totalRecords}{" "}
        
      </div>
      
      <ReactPaginate
        previousLabel={<FaAngleLeft />      }
        nextLabel={<FaAngleRight />      }
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
        onPageChange={page => handlePagination(page)}
      />
    </div>
  )
}
export default DataGridPagination
