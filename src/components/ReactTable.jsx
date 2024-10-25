
import {flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table"

import * as React from "react"

import { useLocation, useNavigate } from "react-router-dom"

import { Table as BTable } from "reactstrap"

import SortArrow from "../assets/svg/sort-arrow.svg"

import DataGridPagination from "./Datagridpagination"

import "./ReactTable.scss"
 
export default function ReactTable({

    columns,

    dataQuery,

    setPagination,

    setSorting,

    pagination,

    sorting

}) {

    const navigate = useNavigate()

    const location = useLocation()
 
    const defaultData = React.useMemo(() => [], [])
 
    // Assuming dataQuery contains headers in its response

    const totalRecords = dataQuery?.data?.headers?.['x-total-count'] ?? 2 ;

 
    const table = useReactTable({

        // data: dataQuery.data?.data?.data ?? defaultData,

        data : dataQuery?.data ?? defaultData,

        columns,

        rowCount: totalRecords,

        state: {

            pagination,

            sorting

        },

        onSortingChange: setSorting,

        onPaginationChange: setPagination,

        getCoreRowModel: getCoreRowModel(),

        manualPagination: true,

        manualSorting: true,

        isMultiSortEvent: (e) => true,

        debugTable: true,

        enableSortingRemoval: true

    })
 
    React.useEffect(() => {

        let path = ''

        if (sorting.length === 0) {

            path = `${location.pathname}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`

        } else {

            path = `${location.pathname}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&sortBy=${sorting.map(sort => `${sort.id}:${sort.desc ? "desc" : "asc"}`).join(",")}`

        }

        navigate(path)

    }, [sorting, pagination])
 
    return (

        <>

            <BTable striped bordered hover responsive size="sm">

                <thead>

                    {table.getHeaderGroups().map(headerGroup => (

                        <tr key={headerGroup.id}>

                            {headerGroup.headers.map(header => {

                                return (

                                    <th key={header.id} colSpan={header.colSpan}>

                                        {header.isPlaceholder ? null : (

                                            <div

                                                className={

                                                    header.column.getCanSort()

                                                        ? "cursor-pointer user-select-none"

                                                        : ""

                                                }

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

                                                    asc: <img className="sort-asc" src={SortArrow} />,

                                                    desc: <img className="sort-desc" src={SortArrow} />

                                                }[header.column.getIsSorted()] ?? null}

                                            </div>

                                        )}

                                    </th>

                                )

                            })}

                        </tr>

                    ))}

                </thead>

                <tbody>

                    {table.getRowModel().rows.map(row => (

                        <tr key={row.id}>

                            {row.getVisibleCells().map(cell => (

                                <td key={cell.id} align={cell.column.columnDef.meta?.align}>

                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}

                                </td>

                            ))}

                        </tr>

                    ))}

                </tbody>

            </BTable>

            <div className="">

                <div>
 
                </div>

                <DataGridPagination

                    rowsPerPage={pagination.pageSize}

                    currentPage={pagination.pageIndex + 1}

                    totalPages={Math.ceil(totalRecords / pagination.pageSize)}

                    totalRecords={totalRecords}

                    setCurrentPage={(selected) => {

                        table.setPagination({ ...pagination, pageIndex: selected - 1 })

                    }}

                    currentTotalRecord={table.getRowModel().rows.length}

                    setLimit={(limit) => {
                        table.setPagination({ pageIndex: 0, pageSize: limit })
                    }}

                />

            </div>

        </>

    )

}
