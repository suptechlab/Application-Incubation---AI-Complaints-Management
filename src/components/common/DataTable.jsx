import ReactTable from "./ReactTable";


const DataTable = ({ columns, dataQuery, pagination, setPagination, sorting, setSorting, showPagination }) => {
  return <div className="flex-grow-1 d-flex flex-column">
    <ReactTable
      columns={columns}
      dataQuery={dataQuery}
      setPagination={setPagination}
      pagination={pagination}
      setSorting={setSorting}
      sorting={sorting}
      showPagination={showPagination}
    />
  </div>;
};

export default DataTable;

