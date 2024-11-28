import React from 'react';
import ReactTable from "../components/ReactTable";

const CommonDataTable = ({ columns, dataQuery, pagination, setPagination, sorting, setSorting, showPagination,clearTableSelection }) => {

    return (
        <div className="flex-grow-1 d-flex flex-column">
            <ReactTable
                columns={columns}
                dataQuery={dataQuery}
                setPagination={setPagination}
                pagination={pagination}
                setSorting={setSorting}
                sorting={sorting}
                showPagination={showPagination}
                clearTableSelection={clearTableSelection ?? false}
            />
        </div>
    );
};

export default CommonDataTable;
