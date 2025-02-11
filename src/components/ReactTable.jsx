import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { Button } from "react-bootstrap";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { Table as BTable } from "reactstrap";
import DataGridPagination from "./Datagridpagination";
import "./ReactTable.scss";
import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";

export default function ReactTable({
  columns,
  dataQuery,
  setPagination,
  setSorting,
  pagination,
  sorting,
  showPagination = true,
  clearTableSelection = false
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultData = React.useMemo(() => [], []);

  const {t} = useTranslation()

  // Assuming dataQuery contains headers in its response
  const totalRecords = dataQuery?.data?.headers?.["x-total-count"] ?? 0;


  const { data } = dataQuery;


  const tableData = React.useMemo(() => data?.data ?? defaultData, [data, defaultData]);

  const table = useReactTable({
    data: tableData,
    columns,
    defaultColumn: {
      size: '200px',
    },
    rowCount: totalRecords,
    state: {
      pagination,
      sorting,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    isMultiSortEvent: (e) => false,
    debugTable: true,
    enableSortingRemoval: true,
  });


  // Function to get the sorting title
  const getSortingTitle = (column) => {
    if (!column.getCanSort()) return undefined;
    const nextOrder = column.getNextSortingOrder();
    const sortingTitles = {
      asc: t("SORT_ASCENDING"),
      desc: t("SORT_DESCENDING"),
    };
    
    return sortingTitles[nextOrder] || t("CLEAR_SORT");
  };

  // Function to get the sorting icon
  const getSortingIcon = (sortingState) => {
    const iconMap = {
      asc: <FiArrowUp size={18} />,
      desc: <FiArrowDown size={18} />,
    };
    return iconMap[sortingState] ?? null;
  };

  React.useEffect(() => {
    if (table && clearTableSelection === true) {
      const isAnyRowSelected = table.getSelectedRowModel().rows.length > 0;

      if (isAnyRowSelected) {
        table.toggleAllRowsSelected(false); // Clear selection

      }
    }
  }, [clearTableSelection])

  // React.useEffect(() => {
  //   let path = "";

  //   if (sorting.length === 0) {
  //     path = `${location.pathname}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize
  //       }`;
  //   } else {
  //     path = `${location.pathname}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize
  //       }&sortBy=${sorting
  //         .map((sort) => `${sort.id}:${sort.desc ? "desc" : "asc"}`)
  //         .join(",")}`;
  //   }

  //   navigate(path);
  // }, [sorting, pagination]);
  React.useEffect(() => {
    let params = new URLSearchParams(location.search);
  
    // Always update page and limit
    params.set("page", pagination.pageIndex + 1);
    params.set("limit", pagination.pageSize);
  
    // Update sorting if available
    if (sorting.length > 0) {
      const sortParams = sorting
        .map((sort) => `${sort.id}:${sort.desc ? "desc" : "asc"}`)
        .join(",");
      params.set("sortBy", sortParams);
    } else {
      params.delete("sortBy"); // Remove if no sorting
    }
  
    // Navigate with updated params
    navigate(`${location.pathname}?${params.toString()}`);
  }, [sorting, pagination]);


  return (
    <div className="d-flex flex-column h-100 small table-cover-main">
      {/* <Loader isLoading={isLoading} /> */}
      <BTable striped bordered hover responsive className="mb-0">
        <thead className="fs-15">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const thClassName = header.column.columnDef.meta?.thClassName || '';
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() && header.getSize() != 'NaN' ? header.getSize() : '' }}
                    className={thClassName}
                  >
                    {header.column.getCanSort() ? (
                      <Button
                        variant="link"
                        className="align-items-center border-0 cursor-pointer d-flex fs-15 fw-semibold gap-2 link-dark p-0 table-sorting text-decoration-none user-select-none w-100 text-start"
                        onClick={header.column.getToggleSortingHandler()}
                        title={getSortingTitle(header.column)}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {getSortingIcon(header.column.getIsSorted())}
                      </Button>

                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>


        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const tdClassName = cell.column.columnDef.meta?.tdClassName || '';
                return (
                  <td
                    key={cell.id}
                    align={cell.column.columnDef.meta?.align}
                    style={{ width: cell?.column?.getSize() && cell?.column?.getSize() != 'NaN' ? cell?.column?.getSize() : '' }}
                    className={tdClassName}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </BTable>

      {/* Conditionally render pagination based on showPagination prop */}
      {showPagination && (
        <div className="mt-auto pt-3 pb-1 pagination-cover">
          <DataGridPagination
            rowsPerPage={pagination.pageSize}
            currentPage={pagination.pageIndex + 1}
            totalPages={Math.ceil(totalRecords / pagination.pageSize)}
            totalRecords={totalRecords}
            setCurrentPage={(selected) => {
              table.setPagination({ ...pagination, pageIndex: selected - 1 });
            }}
            currentTotalRecord={table.getRowModel().rows.length}
            setLimit={(limit) => {
              table.setPagination({ pageIndex: 0, pageSize: limit });
            }}
          />
        </div>
      )}
    </div>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array.isRequired, // Assuming columns is an array
  dataQuery: PropTypes.string.isRequired, // Assuming dataQuery is a string
  setPagination: PropTypes.func.isRequired, // setPagination is a function
  setSorting: PropTypes.func.isRequired, // setSorting is a function
  pagination: PropTypes.object.isRequired, // pagination is an object (you can define its structure if needed)
  sorting: PropTypes.object.isRequired, // sorting is an object (you can define its structure if needed)
  showPagination: PropTypes.bool, // showPagination is a boolean (optional, defaults to true)
  clearTableSelection: PropTypes.bool, // clearTableSelection is a boolean (optional, defaults to false)
};

ReactTable.defaultProps = {
  showPagination: true, // Default value for showPagination
  clearTableSelection: false, // Default value for clearTableSelection
};