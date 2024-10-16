import React from 'react';
import ReactTable from "../../components/ReactTable";

const UsersTable = ({ columns, dataQuery, pagination, setPagination, sorting, setSorting }) => {
    return (
        <div className="flex-grow-1 d-flex flex-column px-3 pb-1 overflow-auto">
            <div className="p-1 h-100">
                <ReactTable
                    columns={columns}
                    dataQuery={dataQuery}
                    setPagination={setPagination}
                    pagination={pagination}
                    setSorting={setSorting}
                    sorting={sorting}
                />
            </div>
        </div>
    );
};

export default UsersTable;
