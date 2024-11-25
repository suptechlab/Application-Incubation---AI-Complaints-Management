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
// import Loader from "./Loader";

export default function ReactTable({
  columns,
  dataQuery,
  setPagination,
  setSorting,
  pagination,
  sorting,
  showPagination=true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultData = React.useMemo(() => [], []);

  // Assuming dataQuery contains headers in its response
  const totalRecords = dataQuery?.data?.headers?.["x-total-count"] ?? 0;


  const { data } = dataQuery;
  // console.log('32 table',dataQuery?.data)
  const table = useReactTable({
    // data: dataQuery.data?.data?.data ?? defaultData,
    data: data?.data ?? defaultData,
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

  React.useEffect(() => {
    let path = "";
  
    // Check if pagination is enabled
    if (pagination && showPagination) {
      if (sorting && sorting.length === 0) {
        path = `${location.pathname}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`;
      } else {
        path = `${location.pathname}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&sortBy=${sorting
          .map((sort) => `${sort.id}:${sort.desc ? "desc" : "asc"}`)
          .join(",")}`;
      }
    } else if (sorting && sorting.length > 0) {
      // If only sorting is enabled, exclude pagination parameters
      path = `${location.pathname}?sortBy=${sorting
        .map((sort) => `${sort.id}:${sort.desc ? "desc" : "asc"}`)
        .join(",")}`;
    } else {
      // If neither pagination nor sorting is enabled, keep the base path
      path = `${location.pathname}`;
    }
  
    navigate(path);
  }, [sorting, pagination, showPagination]);
  

  return (
    <div className="d-flex flex-column flex-grow-1 small table-cover-main">
      {/* <Loader isLoading={isLoading} /> */}
      <BTable striped bordered hover responsive className="mb-0">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                  >
                    {header.column.getCanSort() ? (
                      <Button
                        variant="link"
                        className="align-items-center border-0 cursor-pointer d-flex fw-semibold gap-2 text-body p-0 table-sorting text-decoration-none user-select-none w-100 text-start"
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === "asc"
                              ? "Sort ascending"
                              : header.column.getNextSortingOrder() === "desc"
                                ? "Sort descending"
                                : "Clear sort"
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,

                          header.getContext()
                        )}

                        {{
                          asc: (
                            <span>
                              <FiArrowUp size={18} />
                            </span>
                          ),
                          desc: (
                            <span>
                              <FiArrowDown size={18} />
                            </span>
                          ),
                        }[header.column.getIsSorted()] ?? null}
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
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  align={cell.column.columnDef.meta?.align}
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </BTable>

      {/* Conditionally render pagination based on showPagination prop */}
      {showPagination && (
        <div className="mt-auto pt-3 pb-1 pagination-cover">
          <DataGridPagination
            rowsPerPage={pagination?.pageSize}
            currentPage={pagination?.pageIndex + 1}
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
