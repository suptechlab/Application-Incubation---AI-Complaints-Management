import React from 'react';
import ReactTable from "../components/ReactTable";

const CommonDataTable = ({ columns, dataQuery, pagination, setPagination, sorting, setSorting }) => {

    return (
        <div className="flex-grow-1 d-flex flex-column">
            <ReactTable
                columns={columns}
                dataQuery={dataQuery}
                setPagination={setPagination}
                pagination={pagination}
                setSorting={setSorting}
                sorting={sorting}
            />
        </div>
    );
};

export default CommonDataTable;
